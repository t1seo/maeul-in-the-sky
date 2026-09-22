import { afterEach, describe, expect, it } from 'vitest';
import { InstancedMesh, Matrix4, Vector3 } from 'three';
import { GeometryResources } from '../../src/world/three/geometry/resources.js';
import { createBatches } from '../../src/tour/render/batches.js';
import { addScenery } from '../../src/tour/render/scenery.js';
import { createForestWind } from '../../src/tour/render/wind.js';
import { buildTourModel } from '../../src/tour/model/build.js';
import { sceneFor, snapshotFor } from './model/helpers.js';

const owned: GeometryResources[] = [];
afterEach(() => owned.splice(0).forEach((resources) => resources.dispose()));
function setup() {
  const resources = new GeometryResources();
  owned.push(resources);
  const wind = createForestWind(resources);
  const source = buildTourModel(sceneFor(snapshotFor(['2026-06-01', '2026-06-02'])));
  const cell = { ...source.cells[1], x: 20, z: 12, surface: 'grass' as const };
  const model = { ...source, cells: [cell], placements: [], paths: [] };
  return { resources, wind, source, model, cell };
}

describe('natural grass scenery', () => {
  it('makes a denser meadow from curved, tapered blades with a root-to-tip light gradient', () => {
    // Given: one dry summer cell without an animal clearing.
    const { resources, wind, model } = setup();

    // When: grass is generated using the shared wind controller.
    const scenery = addScenery(model, createBatches(resources, wind), resources, wind);
    const grass = scenery.children.find((child) => child instanceof InstancedMesh);
    expect(grass).toBeInstanceOf(InstancedMesh);
    if (!(grass instanceof InstancedMesh)) return;
    const positions = grass.geometry.getAttribute('position');
    const colors = grass.geometry.getAttribute('color');
    const heights = Array.from({ length: positions.count }, (_, index) => positions.getY(index));

    // Then: visible clumps have multiple bending segments rather than one triangular spike.
    expect(grass.count).toBeGreaterThan(12);
    expect(grass.count).toBeLessThanOrEqual(24);
    expect(new Set(heights).size).toBeGreaterThan(5);
    expect(Math.min(...heights)).toBe(0);
    expect(Math.max(...heights)).toBeLessThan(0.5);
    expect(colors).toBeDefined();
    expect(grass.customDepthMaterial).toBe(wind.depth('grass'));
    expect(grass.castShadow).toBe(true);
  });

  it('leaves the squirrel feet visible and draws only accepted, grounded instances', () => {
    // Given: a small animal at the center of the dry cell.
    const { resources, wind, source, model, cell } = setup();
    const animal = {
      ...source.placements[0],
      source: { ...source.placements[0].source, catalogId: 'squirrel' },
      position: { x: cell.x, y: 0, z: cell.z },
    };

    // When: denser grass is added around the existing source placement.
    const scenery = addScenery(
      { ...model, placements: [animal] },
      createBatches(resources, wind),
      resources,
      wind,
    );
    const grass = scenery.children.find((child) => child instanceof InstancedMesh);
    expect(grass).toBeInstanceOf(InstancedMesh);
    if (!(grass instanceof InstancedMesh)) return;
    const matrix = new Matrix4();
    const position = new Vector3();

    // Then: the clearing has no grass or uninitialized origin instances.
    expect(grass.count).toBeLessThan(grass.instanceMatrix.count);
    for (let index = 0; index < grass.count; index++) {
      grass.getMatrixAt(index, matrix);
      position.setFromMatrixPosition(matrix);
      expect(Math.hypot(position.x - cell.x, position.z - cell.z)).toBeGreaterThanOrEqual(0.55);
      expect(position.y).toBeCloseTo(0.015);
      expect(Math.abs(position.x - cell.x)).toBeLessThan(2);
      expect(Math.abs(position.z - cell.z)).toBeLessThan(2);
    }
    expect(animal.position).toEqual({ x: 20, y: 0, z: 12 });
  });
});
