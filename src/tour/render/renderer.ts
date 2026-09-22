import {
  ACESFilmicToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { GeometryResources } from '../../world/three/geometry/resources.js';
import type { TourModel } from '../types.js';
import { createGround } from '../navigation/ground.js';
import { createDirector } from '../navigation/director.js';
import { createLand } from './land.js';
import { createWater } from './water.js';
import { createAtmosphere, type TourLighting } from './atmosphere.js';
import { populateVillage } from './populate.js';
import { createParticles } from './particles.js';
import { createTourPicker } from './picking.js';
import { createForestWind } from './wind.js';
import type { WildlifeLibrary } from '../wildlife/library.js';
import type { AuthoredLibrary } from '../authored/library.js';

type RendererOptions = {
  readonly reducedMotion?: boolean;
  readonly onChange?: () => void;
  readonly onNavigationFrame?: () => void;
  readonly onError?: (message: string) => void;
  readonly wildlife?: WildlifeLibrary;
  readonly authored?: AuthoredLibrary;
};

export function createTourRenderer(
  canvas: HTMLCanvasElement,
  model: TourModel,
  options: RendererOptions = {},
) {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  const resources = new GeometryResources();
  try {
    return buildTourRenderer(renderer, resources, canvas, model, options);
  } catch (error) {
    resources.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    throw error;
  }
}

function buildTourRenderer(
  renderer: WebGLRenderer,
  resources: GeometryResources,
  canvas: HTMLCanvasElement,
  model: TourModel,
  options: RendererOptions,
) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  const scene = new Scene();
  const camera = new PerspectiveCamera(46, 1, 0.12, 1400);
  const land = createLand(model, resources);
  const wind = createForestWind(resources);
  const village = populateVillage(model, resources, wind, options.wildlife, options.authored);
  const water = createWater(model, resources);
  const particles = createParticles(model, resources);
  scene.add(land, village.root, water.mesh, particles.points);
  const atmosphere = createAtmosphere(scene, model, resources);
  const ground = createGround(
    model.cells,
    model.paths.map((path) => path.points),
    village.colliders,
  );
  const navigation = createDirector(
    camera,
    canvas,
    model,
    ground,
    options.onChange ?? (() => {}),
    options.reducedMotion ?? false,
  );
  let lighting: TourLighting = 'golden';
  let elapsed = 0;
  let previous = 0;
  let navigationFrame = 0;
  let frame = 0;
  let disposed = false;
  let contextLost = false;
  let visible = true;
  let reduced = options.reducedMotion ?? false;
  const lifetime = new AbortController();
  const resize = (): void => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    previous = 0;
  });
  visibility.observe(canvas);
  resize();
  const setLighting = (mode: TourLighting): void => {
    lighting = mode;
    atmosphere.set(mode);
    water.night(mode === 'night');
    for (const material of village.glows)
      material.emissiveIntensity = mode === 'night' ? 1.7 : 0.08;
    options.onChange?.();
  };
  setLighting(lighting);
  const animate = (timestamp: number): void => {
    if (disposed) return;
    const dt = previous ? Math.min((timestamp - previous) / 1000, 0.05) : 0;
    previous = timestamp;
    if (!document.hidden && !contextLost && visible) {
      navigation.update(dt);
      if (timestamp - navigationFrame >= 100) {
        navigationFrame = timestamp;
        options.onNavigationFrame?.();
      }
      if (!reduced) elapsed += dt;
      water.update(elapsed);
      particles.update(elapsed);
      wind.update(elapsed);
      village.animals.update(elapsed, camera);
      atmosphere.update(camera.position);
      renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(animate);
  };
  canvas.addEventListener(
    'webglcontextlost',
    (event) => {
      event.preventDefault();
      contextLost = true;
      navigation.stop();
      options.onError?.(
        'The 3D connection was interrupted. Choose Try again to return to your village.',
      );
    },
    { signal: lifetime.signal },
  );
  document.addEventListener(
    'visibilitychange',
    () => {
      previous = 0;
    },
    { signal: lifetime.signal },
  );
  atmosphere.update(camera.position);
  village.animals.update(elapsed, camera);
  renderer.render(scene, camera);
  frame = requestAnimationFrame(animate);
  const picker = createTourPicker(camera, canvas, model, village, [land, water.mesh]);
  return {
    navigation,
    setLighting,
    setReducedMotion: (value: boolean): void => {
      reduced = value;
      navigation.setReduced(value);
    },
    pick: picker.cell,
    teleportAt: (clientX: number, clientY: number): boolean => {
      const point = picker.groundPoint(clientX, clientY);
      return point ? navigation.teleport(point) : false;
    },
    inspect: () => ({
      ...navigation.inspect(),
      lighting,
      elapsed,
      disposed,
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
      geometries: renderer.info.memory.geometries,
      wildlife: village.animals.inspect(),
      authored: village.scenery.inspect(),
      windTime: wind.elapsed,
      visible,
    }),
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      lifetime.abort();
      observer.disconnect();
      visibility.disconnect();
      navigation.dispose();
      atmosphere.dispose();
      resources.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      scene.clear();
    },
  };
}

export type TourRenderer = ReturnType<typeof createTourRenderer>;
