import {
  ACESFilmicToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  Raycaster,
  Scene,
  Vector2,
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

type RendererOptions = {
  readonly reducedMotion?: boolean;
  readonly onChange?: () => void;
  readonly onError?: (message: string) => void;
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
  const village = populateVillage(model, resources);
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
  let frame = 0;
  let disposed = false;
  let contextLost = false;
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
    if (!document.hidden && !contextLost) {
      navigation.update(dt);
      if (!reduced) elapsed += dt;
      water.update(elapsed);
      particles.update(elapsed);
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
      options.onError?.('3D 연결이 중단되었습니다. 다시 열기를 눌러 마을로 돌아와 주세요.');
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
  renderer.render(scene, camera);
  frame = requestAnimationFrame(animate);
  const ray = new Raycaster();
  return {
    navigation,
    setLighting,
    setReducedMotion: (value: boolean): void => {
      reduced = value;
      navigation.setReduced(value);
    },
    pick: (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      ray.setFromCamera(
        new Vector2(
          ((clientX - rect.left) / rect.width) * 2 - 1,
          (-(clientY - rect.top) / rect.height) * 2 + 1,
        ),
        camera,
      );
      const hit = ray.intersectObjects([village.root, land], true)[0];
      if (!hit) return null;
      const id =
        hit.instanceId === undefined
          ? undefined
          : village.identities.get(hit.object.uuid)?.[hit.instanceId];
      const placement = model.placements.find((candidate) => candidate.source.id === id);
      const cell = placement
        ? model.cells.find((candidate) => candidate.source.date === placement.source.anchorDate)
        : model.cells.find(
            (candidate) =>
              candidate.source.week === Math.floor((hit.point.x + 2) / 4) &&
              candidate.source.day === Math.floor((hit.point.z + 2) / 4),
          );
      return cell?.source ?? null;
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
    }),
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frame);
      lifetime.abort();
      observer.disconnect();
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
