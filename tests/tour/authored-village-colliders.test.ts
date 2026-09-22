import { NodeIO } from '@gltf-transform/core';
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Raycaster,
  Vector3,
} from 'three';
import { assert, expect, it } from 'vitest';
import { createTourAsset } from '../../src/tour/assets/index.js';
import { villageAsset } from '../../src/tour/authored/village.js';
import { authoredMatrix, createAuthoredSource } from '../../src/tour/authored/transforms.js';
import { createGround } from '../../src/tour/navigation/ground.js';
import type { TourPlacement } from '../../src/tour/types.js';

const CLOSED = [
  'house',
  'houseB',
  'houseWinter',
  'houseBWinter',
  'barn',
  'barnWinter',
  'warehouse',
  'inn',
  'tavern',
  'blacksmith',
  'stable',
  'silo',
  'windmill',
  'windmillGrand',
  'tower',
  'tent',
  'pagoda',
  'hanok',
  'church',
] as const;
const CELLS = [-8, -4, 0, 4, 8].flatMap((x) =>
  [-8, -4, 0, 4, 8].map((z) => ({ x, z, surface: 'grass' })),
);

async function building(id: string) {
  const placement: TourPlacement = {
    source: {
      id: `collision:${id}`,
      catalogId: id,
      anchorDate: '2026-06-04',
      week: 2,
      day: 4,
      cx: 2,
      cy: 4,
      footprint: { x: 0, y: 0, width: 1, height: 1 },
      drawOrder: 1,
      variant: 0,
      animated: false,
    },
    position: { x: 0, y: 0, z: 0 },
    season: 'summer',
    kind: 'asset',
  };
  const fallback = createTourAsset(id, 0, 'summer');
  const definition = villageAsset(placement, fallback);
  assert(definition);
  const part = definition.parts[0];
  assert(part);
  const document = await new NodeIO().read(`docs/demo/tour/models/${part.file}`);
  const root = new Group();
  const material = new MeshStandardMaterial();
  for (const node of document.getRoot().listNodes()) {
    for (const primitive of node.getMesh()?.listPrimitives() ?? []) {
      const positions = primitive.getAttribute('POSITION')?.getArray();
      const indices = primitive.getIndices()?.getArray();
      assert(positions && indices);
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(Float32Array.from(positions), 3));
      geometry.setIndex(new BufferAttribute(Uint32Array.from(indices), 1));
      const mesh = new Mesh(geometry, material);
      mesh.matrix.copy(new Matrix4().fromArray(node.getWorldMatrix()));
      mesh.matrixAutoUpdate = false;
      root.add(mesh);
    }
  }
  const source = createAuthoredSource(root);
  root.matrix.copy(authoredMatrix(source, part, placement));
  root.matrixAutoUpdate = false;
  root.updateMatrixWorld(true);
  const collider = definition.collider === undefined ? fallback.collider : definition.collider;
  assert(collider);
  return {
    root,
    collider,
    ground: createGround(CELLS, [], [{ x: 0, z: 0, ...collider }]),
    dispose() {
      root.traverse((node) => {
        if (node instanceof Mesh) node.geometry.dispose();
      });
      material.dispose();
    },
  };
}

function wallSections(root: Group, id: string): readonly Vector3[] {
  const points: Vector3[] = [];
  root.traverse((mesh) => {
    if (!(mesh instanceof Mesh)) return;
    const positions = mesh.geometry.getAttribute('position');
    const indices = mesh.geometry.getIndex();
    assert(indices);
    for (let index = 0; index < indices.count; index += 3) {
      const triangle = [0, 1, 2].map((offset) =>
        new Vector3()
          .fromBufferAttribute(positions, indices.getX(index + offset))
          .applyMatrix4(mesh.matrixWorld),
      );
      const [a, b, c] = triangle;
      const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
      const ys = triangle.map((point) => point.y);
      if (
        Math.abs(normal.y) > (id === 'tent' ? 0.99 : 0.35) ||
        Math.max(...ys) - Math.min(...ys) < (id === 'tent' ? 0.01 : 0.24)
      )
        continue;
      for (const height of [0.15, 0.35, 0.65, 0.95, 1.25, 1.55]) {
        for (const [start, end] of [
          [a, b],
          [b, c],
          [c, a],
        ]) {
          if (
            start.y === end.y ||
            height < Math.min(start.y, end.y) ||
            height > Math.max(start.y, end.y)
          )
            continue;
          points.push(start.clone().lerp(end, (height - start.y) / (end.y - start.y)));
        }
      }
    }
  });
  return points;
}

it.each(CLOSED)(
  'stops outside actual %s body walls when walking from all four sides',
  async (id) => {
    // Given the shipped GLB transformed by the production placement function.
    const fixture = await building(id);
    try {
      const walls = wallSections(fixture.root, id);
      expect(walls.length).toBeGreaterThan(0);
      for (const axis of ['x', 'z'] as const) {
        for (const sign of [-1, 1]) {
          const wall = walls.reduce((edge, point) =>
            sign * point[axis] > sign * edge[axis] ? point : edge,
          );
          const from = { x: wall.x, z: wall.z, [axis]: wall[axis] + sign * 2 };
          const inside = { x: wall.x, z: wall.z, [axis]: wall[axis] - sign * 0.1 };
          // When production movement approaches the measured wall by 10 cm.
          const actual = fixture.ground.move(from, { x: inside.x - from.x, z: inside.z - from.z });
          // Then the camera remains outside the wall and cannot stand in its body.
          expect(fixture.ground.canStand(inside), `${id} ${axis} ${sign} wall=${wall[axis]}`).toBe(
            false,
          );
          expect(sign * actual[axis], `${id} ${axis} ${sign}`).toBeGreaterThanOrEqual(
            sign * wall[axis],
          );
        }
      }
    } finally {
      fixture.dispose();
    }
  },
);

it.each(['houseB', 'houseBWinter', 'barn', 'barnWinter'])(
  'blocks the reported %s rear wall at walking eye height',
  async (id) => {
    const fixture = await building(id);
    try {
      const hit = new Raycaster(new Vector3(0, 1.55, -3), new Vector3(0, 0, 1)).intersectObject(
        fixture.root,
        true,
      )[0];
      assert(hit);
      const actual = fixture.ground.move({ x: 0, z: -3 }, { x: 0, z: hit.point.z + 3.1 });
      expect(actual.z).toBeLessThan(hit.point.z);
      expect(fixture.ground.canStand({ x: 0, z: hit.point.z + 0.1 })).toBe(false);
    } finally {
      fixture.dispose();
    }
  },
);
