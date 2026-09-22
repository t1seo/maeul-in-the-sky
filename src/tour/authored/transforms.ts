import { Box3, Matrix4, Mesh, MeshStandardMaterial, SkinnedMesh, Vector3 } from 'three';
import type { BufferGeometry, Object3D } from 'three';
import type { TourPlacement } from '../types.js';
import type { AuthoredPart } from './types.js';
import { AuthoredLoadError } from './download.js';

export type AuthoredMesh = {
  readonly geometry: BufferGeometry;
  readonly material: MeshStandardMaterial;
  readonly matrix: Matrix4;
};
export type AuthoredSource = {
  readonly meshes: readonly AuthoredMesh[];
  readonly bounds: Box3;
};

export function createAuthoredSource(root: Object3D): AuthoredSource {
  root.updateWorldMatrix(true, true);
  const meshes: AuthoredMesh[] = [];
  const bounds = new Box3();
  const vertex = new Vector3();
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    if (object instanceof SkinnedMesh || !(object.material instanceof MeshStandardMaterial))
      throw new AuthoredLoadError();
    const position = object.geometry.getAttribute('position');
    if (!position || position.itemSize !== 3 || !object.matrixWorld.elements.every(Number.isFinite))
      throw new AuthoredLoadError();
    for (let index = 0; index < position.count; index++) {
      vertex.fromBufferAttribute(position, index);
      if (![vertex.x, vertex.y, vertex.z].every(Number.isFinite)) throw new AuthoredLoadError();
      bounds.expandByPoint(vertex.applyMatrix4(object.matrixWorld));
    }
    object.geometry.computeBoundingBox();
    object.geometry.computeBoundingSphere();
    meshes.push({
      geometry: object.geometry,
      material: object.material,
      matrix: object.matrixWorld.clone(),
    });
  });
  if (
    meshes.length === 0 ||
    bounds.isEmpty() ||
    ![...bounds.min.toArray(), ...bounds.max.toArray()].every(Number.isFinite)
  )
    throw new AuthoredLoadError();
  return { meshes, bounds };
}

export function authoredMatrix(
  source: AuthoredSource,
  part: AuthoredPart,
  placement: TourPlacement,
): Matrix4 {
  const rotation = new Matrix4().makeRotationY(part.yaw ?? 0);
  const size = source.bounds.getSize(new Vector3());
  const rotatedSize = source.bounds.clone().applyMatrix4(rotation).getSize(new Vector3());
  const scale = Math.min(
    part.height / size.y,
    part.maxSpan / Math.max(rotatedSize.x, rotatedSize.z),
  );
  if (!Number.isFinite(scale) || scale <= 0) throw new AuthoredLoadError();
  const center = source.bounds.getCenter(new Vector3());
  const offset = part.offset ?? { x: 0, y: 0, z: 0 };
  const anchor = placement.position;
  return new Matrix4()
    .makeTranslation(anchor.x + offset.x, anchor.y + offset.y, anchor.z + offset.z)
    .multiply(rotation)
    .multiply(new Matrix4().makeScale(scale, scale, scale))
    .multiply(new Matrix4().makeTranslation(-center.x, -source.bounds.min.y, -center.z));
}
