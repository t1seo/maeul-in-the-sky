import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { InstancedMesh } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { parseTourSnapshot } from '../../src/tour/model/snapshot.js';
import { GeometryResources } from '../../src/world/three/geometry/resources.js';
import { createAuthoredPopulation } from '../../src/tour/authored/population.js';
import { authoredAsset } from '../../src/tour/authored/catalog.js';
import { createAuthoredSource } from '../../src/tour/authored/transforms.js';
import type { AuthoredLibrary } from '../../src/tour/authored/library.js';
import { AuthoredLoadError } from '../../src/tour/authored/download.js';
import { disposeWildlifeModels } from '../../src/tour/wildlife/resources.js';
import { authoredFixtureBytes } from './authored-fixture.js';

vi.mock('../../src/tour/authored/catalog.js', () => ({ authoredAsset: vi.fn() }));
const resources = new GeometryResources();
const model = parseTourSnapshot(sampleSnapshot());
let library: AuthoredLibrary;
beforeAll(async () => {
  const gltf = await new GLTFLoader().parseAsync(await authoredFixtureBytes(), '');
  library = {
    models: new Map([['tree.glb', { gltf, source: () => createAuthoredSource(gltf.scene) }]]),
    dispose: () => disposeWildlifeModels([gltf]),
  };
});
afterEach(() => {
  resources.dispose();
  vi.resetAllMocks();
});
afterAll(() => library.dispose());

describe('dated authored placement replacement', () => {
  it('replaces only mapped placements and retains their explicit composites and collider policy', () => {
    // Given two actual source placements and a mapping with residual procedural parts.
    const limited = { ...model, placements: model.placements.slice(0, 2) };
    const before = JSON.stringify(limited);
    const residual = [
      {
        primitive: 'box' as const,
        color: '#ffffff',
        opacity: 1,
        roughness: 1,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        size: { x: 1, y: 1, z: 1 },
      },
    ];
    vi.mocked(authoredAsset).mockImplementation((placement) => ({
      parts: [{ file: 'tree.glb', height: 2, maxSpan: 2 }],
      retainedParts: residual,
      ...(placement.source.id === limited.placements[0]?.source.id ? { collider: null } : {}),
    }));
    // When those source records become instanced authored objects.
    const population = createAuthoredPopulation(limited, library, resources);
    resources.instance(population);
    // Then IDs, residual parts, optional collisions and source data remain exact.
    expect(population.inspect().count).toBe(2);
    expect(population.placements).toEqual(
      new Set(limited.placements.map((placement) => placement.source.id)),
    );
    expect([...population.retainedParts.values()]).toEqual([residual, residual]);
    expect(population.colliders.has(limited.placements[0].source.id)).toBe(true);
    expect(population.colliders.get(limited.placements[0].source.id)).toBeNull();
    expect(population.colliders.has(limited.placements[1].source.id)).toBe(false);
    expect(population.root.children.every((object) => object instanceof InstancedMesh)).toBe(true);
    expect(JSON.stringify(limited)).toBe(before);
  });

  it('retains the procedural path when no library was supplied by a public caller', () => {
    // Given a synchronous renderer caller using the existing procedural API.
    // When no library has been requested.
    const population = createAuthoredPopulation(model, undefined, resources);
    resources.instance(population);
    // Then no source placement is hidden or marked replaced.
    expect(population.inspect().count).toBe(0);
    expect(population.retainedParts.size).toBe(0);
    expect(authoredAsset).not.toHaveBeenCalled();
  });

  it('rejects a missing requested model instead of hiding its original source body', () => {
    // Given a catalog reference absent from the loaded inventory.
    vi.mocked(authoredAsset).mockReturnValue({
      parts: [{ file: 'missing.glb', height: 2, maxSpan: 2 }],
      retainedParts: [],
    });
    // When replacement population creation runs.
    expect(() => createAuthoredPopulation(model, library, resources)).toThrow(AuthoredLoadError);
  });
});
