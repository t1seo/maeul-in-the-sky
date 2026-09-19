import { Scene, type WebGLRenderer } from 'three';
import { frameWorld } from '../model/index.js';
import type { WorldRenderer, WorldRendererCallbacks } from '../model/renderer-types.js';
import type { WorldFocus, WorldScene, WorldView } from '../model/types.js';
import { createWorldGeometry } from './geometry/index.js';
import { createAtmosphere } from './atmosphere.js';
import { createCameraRig } from './camera.js';
import { createFrameDriver } from './frame-driver.js';
import { attachPicking } from './picking.js';
import { capturePng, exportGlb } from './exports.js';
import { focusBounds, toBounds } from './focus.js';
import { renderFailure, ThreeRendererError } from './errors.js';
import { observeShaderTextures } from './shader-textures.js';
import { visibleGeometryBounds } from './camera-fit.js';

export function createThreeController(
  renderer: WebGLRenderer,
  host: HTMLElement,
  world: WorldScene,
  initial: WorldView,
  callbacks: WorldRendererCallbacks,
) {
  let view = initial;
  let frame = frameWorld(world, view);
  let disposed = false;
  let changingCamera = false;
  let capturing = false;
  let lost = false;
  const events = new AbortController();
  const canvas = renderer.domElement;
  const scene = new Scene();
  const geometry = createWorldGeometry(world);
  geometry.update(frame, view);
  const bounds = toBounds(world.bounds).union(visibleGeometryBounds(geometry.content));
  const aspect = Math.max(1, host.clientWidth) / Math.max(1, host.clientHeight);
  const rig = createCameraRig(canvas, bounds, initial.camera, aspect);
  const atmosphere = createAtmosphere(world);
  scene.add(geometry.content, atmosphere.group);
  const shaderTextures = observeShaderTextures(renderer, scene);

  function currentView(): WorldView {
    return { ...view, camera: rig.read() };
  }
  function assertActive() {
    if (disposed) throw new ThreeRendererError('disposed', 'This 3D view has been closed.');
    if (lost)
      throw new ThreeRendererError(
        'context-lost',
        'The graphics context was lost. Please reopen 3D.',
      );
  }
  function paint(delta: number) {
    if (disposed || lost || capturing) return;
    view = { ...view, elapsedSeconds: view.elapsedSeconds + delta };
    frame = frameWorld(world, view);
    geometry.update(frame, view);
    const followed = frame.actors.find((actor) => actor.id === view.followActorId);
    if (followed) rig.follow(followed.position);
    atmosphere.update(view, frame.season, rig.camera, view.elapsedSeconds);
    renderer.render(scene, rig.camera);
    canvas.dataset.calls = String(renderer.info.render.calls);
    canvas.dataset.triangles = String(renderer.info.render.triangles);
    canvas.dataset.frames = String(Number(canvas.dataset.frames ?? 0) + 1);
    canvas.dataset.elapsed = String(view.elapsedSeconds);
    canvas.dataset.geometries = String(renderer.info.memory.geometries);
    canvas.dataset.textures = String(renderer.info.memory.textures);
  }
  const driver = createFrameDriver(renderer, host, paint, (error) =>
    callbacks.onError(renderFailure(error)),
  );
  function publishCamera() {
    if (changingCamera || disposed) return;
    view = currentView();
    callbacks.onViewChange(view);
    driver.request();
  }
  rig.controls.addEventListener('change', publishCamera);
  function releaseFollow() {
    if (view.followActorId) {
      view = { ...view, followActorId: undefined };
      callbacks.onViewChange(currentView());
    }
  }
  rig.controls.addEventListener('start', releaseFollow);

  function resize() {
    if (disposed || capturing) return;
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    const ratio = Math.min(
      devicePixelRatio || 1,
      view.quality === 'high' ? 2 : 1.25,
      Math.sqrt(2_000_000 / (width * height)),
    );
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    rig.resize(width / height);
    driver.request();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);

  function focus(target: WorldFocus) {
    assertActive();
    changingCamera = true;
    view = {
      ...currentView(),
      focus: target,
      followActorId: target.kind === 'actor' ? target.actorId : undefined,
    };
    rig.focus(target.kind === 'world' ? bounds : focusBounds(world, frame, target));
    changingCamera = false;
    publishCamera();
  }
  function reset() {
    assertActive();
    changingCamera = true;
    rig.apply({ ...initial.camera, zoom: 1 });
    changingCamera = false;
    focus({ kind: 'world' });
  }
  attachPicking(
    canvas,
    rig.camera,
    geometry,
    (id) => {
      view = { ...currentView(), selectedId: id };
      callbacks.onSelect(id);
      driver.request();
    },
    events.signal,
  );
  canvas.addEventListener(
    'keydown',
    (event) => {
      if (rig.isNavigationKey(event)) releaseFollow();
      if (event.key === 'Home') {
        event.preventDefault();
        reset();
      }
      if (event.key === '+' || event.key === '=' || event.key === '-') {
        event.preventDefault();
        releaseFollow();
        rig.apply({ ...rig.read(), zoom: rig.camera.zoom * (event.key === '-' ? 0.8 : 1.25) });
        publishCamera();
      }
    },
    { signal: events.signal, capture: true },
  );
  canvas.addEventListener(
    'webglcontextlost',
    (event) => {
      event.preventDefault();
      lost = true;
      driver.setPaused(true);
      callbacks.onError(
        new ThreeRendererError(
          'context-lost',
          '3D paused because the graphics context was lost. The map is still available.',
        ),
      );
    },
    { signal: events.signal },
  );
  canvas.addEventListener(
    'webglcontextrestored',
    () => {
      lost = false;
      renderer.shadowMap.needsUpdate = true;
      driver.setPaused(false);
    },
    { signal: events.signal },
  );

  const api: WorldRenderer = {
    kind: 'three',
    capabilities: { png: true, svg: false, glb: true, follow: true },
    getView: currentView,
    focus,
    reset,
    update(next) {
      assertActive();
      view = next;
      changingCamera = true;
      rig.apply(next.camera);
      changingCamera = false;
      frame = frameWorld(world, view);
      geometry.update(frame, view);
      renderer.shadowMap.needsUpdate = true;
      resize();
      driver.setMotion(view.motion);
    },
    async capture(options) {
      assertActive();
      if (capturing) throw new ThreeRendererError('capture', 'A photo is already being prepared.');
      paint(0);
      capturing = true;
      driver.setPaused(true);
      try {
        return await capturePng(renderer, scene, rig.camera, options, {
          active: () => !disposed && !lost,
          prepare: (camera) => atmosphere.update(view, frame.season, camera, view.elapsedSeconds),
        });
      } finally {
        capturing = false;
        if (!disposed && !lost) {
          driver.setPaused(false);
          resize();
        }
      }
    },
    async exportModel() {
      assertActive();
      paint(0);
      geometry.update(frame, { ...view, quality: 'high', camera: { ...view.camera, zoom: 32 } });
      try {
        return exportGlb(geometry.content);
      } finally {
        geometry.update(frame, view);
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      driver.dispose();
      events.abort();
      observer.disconnect();
      rig.dispose();
      shaderTextures.dispose();
      geometry.dispose();
      atmosphere.dispose();
      canvas.dataset.geometries = String(renderer.info.memory.geometries);
      canvas.dataset.textures = String(renderer.info.memory.textures);
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      scene.clear();
    },
  };
  resize();
  atmosphere.update(view, frame.season, rig.camera, view.elapsedSeconds);
  return {
    api,
    async prepare() {
      try {
        await renderer.compileAsync(scene, rig.camera);
        paint(0);
        driver.setMotion(view.motion);
      } catch (error) {
        api.dispose();
        throw error;
      }
    },
  };
}
