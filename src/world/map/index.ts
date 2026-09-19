import type { WorldScene, WorldView } from '../model/types.js';
import type { WorldRenderer, WorldRendererCallbacks } from '../model/renderer-types.js';
import { frameWorld } from '../model/index.js';
import { captureMap, MapCaptureError } from './capture.js';
import { bindMapControls } from './controls.js';
import { bindSceneryMotion, mapElement, paintActors, paintCamera, paintSelection } from './dom.js';
import { MAP_VIEWPORT, focusView, moveCamera } from './projection.js';
import { createMapClock } from './clock.js';
import { sceneryParticles } from './scenery-motion.js';

export { renderMapSvg, renderMapFrame } from './render.js';

export function mountMap(
  host: HTMLElement,
  scene: WorldScene,
  view: WorldView,
  callbacks: WorldRendererCallbacks,
): WorldRenderer {
  const namespace = `map-${crypto.randomUUID()}`;
  let current = moveCamera(view, { x: 0, y: 0, z: 0 });
  let frame = frameWorld(scene, current);
  let viewport =
    host.clientWidth > 0 && host.clientHeight > 0
      ? { width: host.clientWidth, height: host.clientHeight }
      : MAP_VIEWPORT;
  let svg = mapElement(scene, frame, current, namespace, viewport);
  let particles = sceneryParticles(scene, frame, current);
  let paintScenery = bindSceneryMotion(svg, particles);
  let disposed = false;
  host.replaceChildren(svg);
  const follow = (): void => {
    if (!current.followActorId) return;
    const actor = frame.actors.find((entry) => entry.id === current.followActorId);
    if (!actor) return;
    current = moveCamera(current, {
      x: actor.position.x - current.camera.target.x,
      y: actor.position.y - current.camera.target.y,
      z: actor.position.z - current.camera.target.z,
    });
    paintCamera(svg, scene, frame, current, viewport);
  };
  const clock = createMapClock(
    host,
    () =>
      current.motion === 'full' &&
      (frame.actors.length > 0 || particles.length > 0 || frame.terrain.waterways.length > 0),
    (seconds) => {
      current = { ...current, elapsedSeconds: current.elapsedSeconds + seconds };
      frame = frameWorld(scene, current);
      paintActors(svg, frame);
      paintScenery(current.elapsedSeconds);
      follow();
    },
    callbacks.onError,
  );

  const update = (next: WorldView, resized = false): void => {
    if (disposed) return;
    const repaint =
      next.cursorDate !== current.cursorDate ||
      next.seasonOverride !== current.seasonOverride ||
      next.lighting !== current.lighting ||
      next.weather !== current.weather ||
      next.quality !== current.quality;
    const active = document.activeElement;
    const focusedId = active instanceof SVGElement ? active.dataset.dayId : undefined;
    current = moveCamera(next, { x: 0, y: 0, z: 0 });
    frame = frameWorld(scene, current);
    if (repaint || resized) {
      const replacement = mapElement(scene, frame, current, namespace, viewport);
      svg.replaceWith(replacement);
      svg = replacement;
      particles = sceneryParticles(scene, frame, current);
      paintScenery = bindSceneryMotion(svg, particles);
      if (focusedId) {
        const days = [...svg.querySelectorAll<SVGElement>('[data-day-id]')];
        (days.find((day) => day.dataset.dayId === focusedId) ?? days[0] ?? svg).focus();
      }
    } else {
      paintCamera(svg, scene, frame, current, viewport);
      paintActors(svg, frame);
      paintSelection(svg, current);
      paintScenery(current.elapsedSeconds);
    }
    follow();
    clock.refresh();
  };
  const change = (next: WorldView): void => {
    update(next);
    if (!disposed) callbacks.onViewChange(current);
  };
  const focus = (target: WorldView['focus']): void =>
    change(focusView(scene, frame, current, target, viewport));
  const reset = (): void => focus({ kind: 'world' });
  const resize = new ResizeObserver(() => {
    if (disposed || host.clientWidth <= 0 || host.clientHeight <= 0) return;
    if (viewport.width === host.clientWidth && viewport.height === host.clientHeight) return;
    viewport = { width: host.clientWidth, height: host.clientHeight };
    update(current, true);
  });
  resize.observe(host);
  const unbind = bindMapControls(host, scene, {
    view: () => current,
    viewport: () => viewport,
    change: (next) => change({ ...next, followActorId: undefined }),
    reset,
    select: (id) => {
      if (!frame.days.some((day) => day.id === id)) return;
      update({ ...current, selectedId: id });
      callbacks.onSelect(id);
    },
  });
  return {
    kind: 'map',
    capabilities: { png: true, svg: true, glb: false, follow: true },
    update,
    focus,
    reset,
    getView: () => current,
    capture: (options) =>
      disposed
        ? Promise.reject(new MapCaptureError('disposed', 'This world map has been closed.'))
        : captureMap(scene, current, options),
    dispose: () => {
      if (disposed) return;
      disposed = true;
      clock.dispose();
      resize.disconnect();
      unbind();
      svg.remove();
    },
  };
}
