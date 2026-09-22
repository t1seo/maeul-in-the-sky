import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import {
  BoxGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Raycaster,
  Vector3,
} from 'three';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { parseTourSnapshot } from '../../src/tour/model/snapshot.js';
import { GeometryResources } from '../../src/world/three/geometry/resources.js';
import { createForestWind } from '../../src/tour/render/wind.js';
import { createAuthoredSource } from '../../src/tour/authored/transforms.js';
import { createAuthoredBatches } from '../../src/tour/authored/batches.js';

const resources = new GeometryResources();
const geometry = new BoxGeometry(1, 2, 1);
geometry.translate(0, 1, 0);
const material = new MeshStandardMaterial();
const sourceRoot = new Group().add(new Mesh(geometry, material));
const source = createAuthoredSource(sourceRoot);
const model = parseTourSnapshot(sampleSnapshot());
const placement = model.placements[0];
afterEach(() => resources.dispose());
afterAll(() => {
  geometry.dispose();
  material.dispose();
});

describe('instanced authored geometry', () => {
  it('shares a drawable while retaining original dates per raycast instance', () => {
    // Given two nearby dated placements of one static model.
    const batches = createAuthoredBatches(resources);
    const part = { file: 'tree.glb', height: 2, maxSpan: 1 };
    batches.add(source, part, {
      ...placement,
      position: { x: 0, y: 0, z: 0 },
      source: { ...placement.source, id: 'first-date' },
    });
    batches.add(source, part, {
      ...placement,
      position: { x: 3, y: 0, z: 0 },
      source: { ...placement.source, id: 'second-date' },
    });
    // When the actual instance is raycast from the second dated anchor.
    batches.finish();
    batches.root.updateMatrixWorld(true);
    const hit = new Raycaster(new Vector3(3, 1, 5), new Vector3(0, 0, -1)).intersectObject(
      batches.root,
      true,
    )[0];
    // Then batching retains exact source identity and reusable geometry.
    expect(batches.inspect()).toMatchObject({ drawables: 1, instances: 2 });
    expect(hit).toBeDefined();
    expect(hit ? batches.identities.get(hit.object.uuid)?.[hit.instanceId ?? 0] : null).toBe(
      'second-date',
    );
    const mesh = batches.root.children[0];
    expect(mesh).toBeInstanceOf(InstancedMesh);
    if (!(mesh instanceof InstancedMesh)) throw new TypeError('Expected authored instances');
    expect(mesh.geometry).toBe(geometry);
    const geometryDispose = vi.fn();
    const instanceDispose = vi.fn();
    geometry.addEventListener('dispose', geometryDispose);
    mesh.addEventListener('dispose', instanceDispose);
    batches.dispose();
    batches.dispose();
    expect(instanceDispose).toHaveBeenCalledTimes(1);
    expect(geometryDispose).not.toHaveBeenCalled();
  });

  it('separates distant chunks and protects moving bounds without moving root anchors', () => {
    // Given identical plants in separate Calendar regions.
    const wind = createForestWind(resources);
    const batches = createAuthoredBatches(resources, wind);
    const part = { file: 'tree.glb', height: 2, maxSpan: 1, wind: 'tree' as const };
    for (const x of [0, 8, 84])
      batches.add(source, part, { ...placement, position: { x, y: 0, z: 0 } });
    // When the wind-ready instances become renderable.
    batches.finish();
    const meshes = batches.root.children.filter((item) => item instanceof InstancedMesh);
    // Then culling and shadows retain conservative extents around grounded transforms.
    expect(meshes.map((mesh) => mesh.count)).toEqual([2, 1]);
    const matrix = new Matrix4();
    meshes[0]?.getMatrixAt(0, matrix);
    expect(new Vector3().setFromMatrixPosition(matrix).y).toBe(0);
    expect(meshes[0]?.boundingBox?.min.y).toBeLessThan(0);
    expect(meshes[0]?.customDepthMaterial).toBeDefined();
    expect(meshes[0]?.material).not.toBe(material);
    batches.dispose();
  });
});
