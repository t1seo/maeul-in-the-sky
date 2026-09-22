import { afterEach, describe, expect, it } from 'vitest';
import { Box3, BoxGeometry, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { AuthoredLoadError } from '../../src/tour/authored/download.js';
import { authoredMatrix, createAuthoredSource } from '../../src/tour/authored/transforms.js';
import { buildTourModel } from '../../src/tour/model/build.js';
import { sceneFor, snapshotFor } from './model/helpers.js';

const geometries: BoxGeometry[] = [];
const materials: MeshStandardMaterial[] = [];
afterEach(() => {
  geometries.splice(0).forEach((item) => item.dispose());
  materials.splice(0).forEach((item) => item.dispose());
});

function sourceObject() {
  const collection = new Group();
  collection.position.set(3, 7, -2);
  const root = new Group();
  root.position.set(10, 20, 30);
  root.scale.set(2, 3, 4);
  collection.add(root);
  const geometry = new BoxGeometry(2, 4, 6);
  const material = new MeshStandardMaterial();
  geometries.push(geometry);
  materials.push(material);
  const mesh = new Mesh(geometry, material);
  mesh.position.set(0, 2, 0);
  root.add(mesh);
  return { root, geometry, material, mesh };
}

describe('actual authored model transforms', () => {
  it('recomputes stale declared bounds while preserving original parent transforms', () => {
    // Given an authored model whose accessor bounds are wrong.
    const { root, geometry, mesh } = sourceObject();
    geometry.boundingBox = new Box3(new Vector3(-999, -999, -999), new Vector3(999, 999, 999));
    // When the selected source is prepared from its actual vertices.
    const source = createAuthoredSource(root);
    // Then bounds follow the original hierarchy without altering the shared mesh.
    expect(source.bounds.getSize(new Vector3())).toEqual(new Vector3(4, 12, 24));
    expect(source.meshes[0]?.matrix).toEqual(mesh.matrixWorld);
    expect(source.meshes[0]?.geometry).toBe(geometry);
    expect(root.position.toArray()).toEqual([10, 20, 30]);
    expect(geometry.boundingBox?.getSize(new Vector3())).toEqual(new Vector3(2, 4, 6));
  });

  it('grounds and centers a rotated model inside its horizontal span at the dated anchor', () => {
    // Given a off-center authored object and an actual contribution placement.
    const { root } = sourceObject();
    const source = createAuthoredSource(root);
    const model = buildTourModel(sceneFor(snapshotFor(['2026-05-01', '2026-05-02'])));
    const sourcePlacement = model.placements[0];
    if (!sourcePlacement) throw new TypeError('Expected a source placement');
    const placement = { ...sourcePlacement, position: { x: 8, y: 0, z: 12 } };
    // When target size, yaw and a local metre offset are applied.
    const matrix = authoredMatrix(
      source,
      {
        file: 'tree.glb',
        height: 4,
        maxSpan: 3,
        yaw: Math.PI / 4,
        offset: { x: 1, y: 0.2, z: -2 },
      },
      placement,
    );
    const bounds = source.bounds.clone().applyMatrix4(matrix);
    // Then the model is grounded without losing its source anchor or width envelope.
    const size = bounds.getSize(new Vector3());
    expect(bounds.min.y).toBeCloseTo(0.2);
    expect(bounds.getCenter(new Vector3()).x).toBeCloseTo(9);
    expect(bounds.getCenter(new Vector3()).z).toBeCloseTo(10);
    expect(size.y).toBeLessThanOrEqual(4);
    expect(Math.max(size.x, size.z)).toBeCloseTo(3);
    expect(placement.position).toEqual({ x: 8, y: 0, z: 12 });
  });

  it('rejects a selected root with no renderable vertices', () => {
    // Given an empty named group.
    const root = new Group();
    // When it is used as a visible replacement.
    expect(() => createAuthoredSource(root)).toThrow(AuthoredLoadError);
  });

  it('rejects non-finite position data before deriving GPU bounds', () => {
    // Given a corrupt source position.
    const { root, geometry } = sourceObject();
    geometry.getAttribute('position').setX(0, NaN);
    // When it reaches the static geometry boundary.
    expect(() => createAuthoredSource(root)).toThrow(AuthoredLoadError);
  });
});
