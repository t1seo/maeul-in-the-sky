import { afterEach, describe, expect, it } from 'vitest';
import { Mesh, Raycaster, Triangle, Vector3 } from 'three';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { parseTourSnapshot } from '../../src/tour/model/snapshot.js';
import { createLand } from '../../src/tour/render/land.js';
import { createWater } from '../../src/tour/render/water.js';
import { GeometryResources } from '../../src/world/three/geometry/resources.js';
import type { TourCell } from '../../src/tour/types.js';

const resources = new GeometryResources();
const source = parseTourSnapshot(sampleSnapshot());
afterEach(() => resources.dispose());

function cell(surface: TourCell['surface'], depth: number, x = 0): TourCell {
  return { ...source.cells[0], x, z: 0, surface, depth };
}

function triangles(mesh: Mesh): Triangle[] {
  const positions = mesh.geometry.getAttribute('position');
  const result: Triangle[] = [];
  for (let i = 0; i < positions.count; i += 3) {
    result.push(
      new Triangle(
        new Vector3().fromBufferAttribute(positions, i),
        new Vector3().fromBufferAttribute(positions, i + 1),
        new Vector3().fromBufferAttribute(positions, i + 2),
      ),
    );
  }
  return result;
}

function sharedWall(cells: readonly TourCell[]): Triangle[] {
  return triangles(createLand({ ...source, cells }, resources)).filter((triangle) =>
    [triangle.a, triangle.b, triangle.c].every((point) => point.x === 2),
  );
}

describe('water bed visibility and closed terrain', () => {
  it.each([0, 0.16, 0.5, 0.9, 2.4])('keeps a valid water solid at source depth %s', (depth) => {
    // Given an isolated water cell, including source depths shallower than the new bed.
    const water = cell('water', depth);
    const model = { ...source, cells: [water] };
    const before = JSON.stringify(model);
    // When its terrain mesh is constructed and viewed from inside the water column.
    const mesh = createLand(model, resources);
    const bottom = -Math.max(0.9, depth);
    const center = new Vector3(0, (-0.72 + bottom) / 2, 0);
    const floor = new Raycaster(new Vector3(0, -0.6, 0), new Vector3(0, -1, 0)).intersectObject(
      mesh,
    )[0];
    // Then underwater bodies remain above the floor and every solid face points outward.
    expect(floor?.point.y).toBeCloseTo(-0.72);
    mesh.geometry.computeBoundingBox();
    expect(mesh.geometry.boundingBox?.min.toArray()).toEqual([-2, expect.closeTo(bottom), -2]);
    expect(mesh.geometry.boundingBox?.max.toArray()).toEqual([-2 + 4, expect.closeTo(-0.72), 2]);
    for (const triangle of triangles(mesh)) {
      expect(triangle.getArea()).toBeGreaterThan(0);
      const outward = triangle.getMidpoint(new Vector3()).sub(center);
      expect(triangle.getNormal(new Vector3()).dot(outward)).toBeGreaterThan(0);
    }
    expect(JSON.stringify(model)).toBe(before);
  });

  it('omits submerged internal walls while preserving a deeper neighboring water solid', () => {
    // Given adjacent water cells with identical beds and differing original island depths.
    const same = sharedWall([cell('water', 0.1), cell('water', 0.9, 4)]);
    // When a deeper water cell borders the shallow one.
    const exposed = sharedWall([cell('water', 2.4), cell('water', 0.1, 4)]);
    // Then only the deeper solid below the shallow bottom has an outward wall.
    expect(same).toHaveLength(0);
    expect(exposed.reduce((area, triangle) => area + triangle.getArea(), 0)).toBeCloseTo(6);
    for (const triangle of exposed) {
      expect(triangle.getNormal(new Vector3()).x).toBeCloseTo(1);
      for (const point of [triangle.a, triangle.b, triangle.c]) {
        expect(point.y).toBeGreaterThanOrEqual(-2.400001);
        expect(point.y).toBeLessThanOrEqual(-0.899999);
      }
    }
  });

  it('exposes the shore above the bed without duplicating a shared buried wall', () => {
    // Given equally deep dry and water cells sharing an edge.
    // When their different surface heights are meshed.
    const wall = sharedWall([cell('grass', 1.2), cell('water', 1.2, 4)]);
    // Then the dry bank is visible down to the bed with no buried opposing faces.
    expect(wall.reduce((area, triangle) => area + triangle.getArea(), 0)).toBeCloseTo(2.88);
    for (const triangle of wall) {
      expect(triangle.getArea()).toBeGreaterThan(0);
      expect(triangle.getNormal(new Vector3()).x).toBeCloseTo(1);
      expect(Math.min(triangle.a.y, triangle.b.y, triangle.c.y)).toBeGreaterThanOrEqual(-0.720001);
      expect(Math.max(triangle.a.y, triangle.b.y, triangle.c.y)).toBeLessThanOrEqual(0);
    }
  });

  it('preserves thin dry soil without bridging the open gap to a lower water bed', () => {
    // Given a thin dry island edge above a shallow water solid.
    // When their non-overlapping vertical ranges are meshed.
    const wall = sharedWall([cell('earth', 0.16), cell('water', 0.1, 4)]);
    // Then both exposed sides retain positive area and their own outward normal.
    const land = wall.filter((triangle) => triangle.getNormal(new Vector3()).x > 0);
    const water = wall.filter((triangle) => triangle.getNormal(new Vector3()).x < 0);
    expect(land.reduce((area, triangle) => area + triangle.getArea(), 0)).toBeCloseTo(0.64);
    expect(water.reduce((area, triangle) => area + triangle.getArea(), 0)).toBeCloseTo(0.72);
    for (const triangle of wall) expect(triangle.getArea()).toBeGreaterThan(0);
  });

  it('makes river surfaces translucent while retaining waterfall geometry and alpha', () => {
    // Given a dated water tile and an existing waterfall.
    const fall = {
      position: { x: 2, y: 0, z: 0 },
      edge: 'left' as const,
      drop: 4,
      date: '2026-09-01',
    };
    const model = { ...source, cells: [cell('water', 0.1)], falls: [fall] };
    const before = JSON.stringify(model);
    // When water appearance switches from day to night and time advances.
    const water = createWater(model, resources);
    water.night(true);
    water.update(13);
    // Then alpha remains readable and waterfalls retain their independent foam expression.
    expect(water.mesh.material.uniforms.surfaceAlpha?.value).toBe(0.64);
    expect(water.mesh.material.uniforms.time.value).toBe(13);
    expect(water.mesh.material.transparent).toBe(true);
    expect(water.mesh.material.depthWrite).toBe(false);
    expect(water.mesh.material.fragmentShader).toContain(
      'mix(surfaceAlpha,.66+foam*.25,waterfall)',
    );
    expect(Array.from(water.mesh.geometry.getAttribute('fall').array)).toEqual([
      0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1,
    ]);
    water.mesh.geometry.computeBoundingBox();
    expect(water.mesh.geometry.boundingBox?.min.y).toBe(-4);
    expect(water.mesh.geometry.boundingBox?.max.y).toBeCloseTo(0.03);
    expect(JSON.stringify(model)).toBe(before);
  });
});
