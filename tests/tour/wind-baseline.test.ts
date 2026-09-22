import { afterEach, describe, expect, it } from 'vitest';
import { InstancedMesh, Matrix4, Vector3 } from 'three';
import { part } from '../../src/world/model/recipes/primitives.js';
import { GeometryResources } from '../../src/world/three/geometry/resources.js';
import { createBatches } from '../../src/tour/render/batches.js';
import { addScenery } from '../../src/tour/render/scenery.js';
import { buildTourModel } from '../../src/tour/model/build.js';
import { sceneFor, snapshotFor } from './model/helpers.js';

const owned: GeometryResources[] = [];
afterEach(() => owned.splice(0).forEach((resources) => resources.dispose()));
function resourcesForTest(): GeometryResources {
  const resources = new GeometryResources();
  owned.push(resources);
  return resources;
}

describe('static tour batch characterization', () => {
  it('retains primitive sharing, dated identities and independent spatial chunks', () => {
    // Given: two nearby boxes, one sphere and a box in a distant chunk.
    const resources = resourcesForTest();
    const batches = createBatches(resources);
    const box = part('box', '#679864', [0, 1, 0], [2, 2, 2]);
    batches.add(box, 'house', { x: 4, y: 0, z: 8 }, 2, 'house:2026-06-01');
    batches.add(box, 'tree', { x: 8, y: 0, z: 8 }, 1, 'tree:2026-06-02');
    batches.add(
      part('sphere', '#679864', [0, 1, 0], [1, 1, 1]),
      'rock',
      { x: 8, y: 0, z: 12 },
      1,
      'rock:2026-06-03',
    );
    batches.add(box, 'house', { x: 84, y: 0, z: 8 }, 1, 'house:2026-06-04');

    // When: the static batches are finalized.
    const group = batches.finish();
    const meshes = group.children.filter((child) => child instanceof InstancedMesh);
    const matrix = new Matrix4();
    meshes[0].getMatrixAt(0, matrix);

    // Then: source IDs and transforms survive batching without extra static materials.
    expect(meshes.map((mesh) => mesh.count)).toEqual([2, 1, 1]);
    expect([...batches.identities.values()]).toEqual([
      ['house:2026-06-01', 'tree:2026-06-02'],
      ['rock:2026-06-03'],
      ['house:2026-06-04'],
    ]);
    expect(new Set(meshes.map((mesh) => mesh.material)).size).toBe(1);
    expect(new Vector3().setFromMatrixPosition(matrix)).toEqual(new Vector3(4, 2, 8));
    expect(meshes.every((mesh) => mesh.customDepthMaterial === undefined)).toBe(true);
  });

  it('grounds every grass clump on observed dry tiles without filling water', () => {
    // Given: two observed cells, one dry and one water.
    const resources = resourcesForTest();
    const source = buildTourModel(sceneFor(snapshotFor(['2026-06-01', '2026-06-02'])));
    const dry = { ...source.cells[0], surface: 'grass' as const };
    const model = {
      ...source,
      placements: [],
      paths: [],
      cells: [dry, { ...source.cells[1], surface: 'water' as const }],
    };

    // When: scenery is added without modifying source terrain.
    const scenery = addScenery(model, createBatches(resources), resources);
    const grass = scenery.children.find((child) => child instanceof InstancedMesh);
    const matrix = new Matrix4();
    const position = new Vector3();
    expect(grass).toBeDefined();
    if (!(grass instanceof InstancedMesh)) return;

    // Then: every accepted instance is grounded inside the sole eligible tile.
    expect(grass.count).toBeGreaterThan(0);
    for (let index = 0; index < grass.count; index++) {
      grass.getMatrixAt(index, matrix);
      position.setFromMatrixPosition(matrix);
      expect(position.y).toBeCloseTo(0.015);
      expect(Math.abs(position.x - dry.x)).toBeLessThan(1.96);
      expect(Math.abs(position.z - dry.z)).toBeLessThan(1.96);
    }
    expect([...grass.geometry.getAttribute('position').array].every(Number.isFinite)).toBe(true);
  });
});
