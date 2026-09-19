import { mkdir, writeFile } from 'node:fs/promises';
import { DataTexture, Mesh, MeshStandardMaterial } from 'three';
import { buildWorld, defaultWorldView, frameWorld } from '../../../../src/world/model/index.js';
import type { WorldInput, WorldView } from '../../../../src/world/model/types.js';
import { createWorldGeometry } from '../../../../src/world/three/geometry/index.js';
import { inputFor, sequence } from '../../model/helpers.js';
import { measureGeometry } from './metrics.js';

function measure(layout: WorldInput['settings']['layout']) {
  const input = inputFor(sequence('2024-01-01', 366, 25));
  const scene = buildWorld({ ...input, settings: { ...input.settings, layout } });
  const view = defaultWorldView(scene);
  const start = performance.now();
  const world = createWorldGeometry(scene);
  const createMilliseconds = performance.now() - start;
  const textures = new Set<DataTexture>();
  world.content.traverse((object) => {
    if (!(object instanceof Mesh) || !(object.material instanceof MeshStandardMaterial)) return;
    for (const texture of [object.material.map, object.material.normalMap])
      if (texture instanceof DataTexture) textures.add(texture);
  });
  const frames: readonly (readonly [string, WorldView])[] = [
    ['overview', view],
    ['month', { ...view, focus: { kind: 'month', monthKey: '2024-06' } }],
    ['export', { ...view, camera: { ...view.camera, zoom: 32 } }],
    ['rewind', { ...view, cursorDate: '2024-01-01' }],
  ];
  const measurements = frames.map(([name, next]) => {
    const before = performance.now();
    world.update(frameWorld(scene, next), next);
    const updateMilliseconds = performance.now() - before;
    return { name, updateMilliseconds, ...measureGeometry(world.content) };
  });
  world.update(frameWorld(scene, view), view);
  const samples = Array.from({ length: 90 }, (_, index) => {
    const next = { ...view, elapsedSeconds: index / 60 };
    const before = performance.now();
    world.update(frameWorld(scene, next), next);
    return performance.now() - before;
  }).sort((a, b) => a - b);
  world.dispose();
  return {
    layout,
    source: 'sample',
    dates: scene.days.length,
    entities: scene.entities.length,
    createMilliseconds,
    textures: textures.size,
    textureBytes: [...textures].reduce(
      (sum, texture) => sum + (texture.image.data?.byteLength ?? 0),
      0,
    ),
    measurements,
    cpuUpdateP50Milliseconds: samples[45],
    cpuUpdateP95Milliseconds: samples[85],
    disposedChildren: world.content.children.length,
  };
}

const report = {
  description:
    'CPU geometry measurements; visibleMeshes exclude renderer shadow/sky passes and are not GPU timings.',
  generatedAt: new Date().toISOString(),
  cases: [measure('archipelago'), measure('island')],
};
const directory = process.argv[2] ?? '.orca/world-expansion/evidence/geometry';
await mkdir(directory, { recursive: true });
await writeFile(`${directory}/measurements.json`, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
