import { BufferGeometry, InstancedMesh, Material, Mesh } from 'three';
import type { Group } from 'three';

export function measureGeometry(content: Group): {
  readonly visibleMeshes: number;
  readonly triangles: number;
  readonly instances: number;
  readonly uniqueGeometries: number;
  readonly uniqueMaterials: number;
} {
  let visibleMeshes = 0;
  let triangles = 0;
  let instances = 0;
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  content.traverseVisible((object) => {
    if (!(object instanceof Mesh)) return;
    const count = object instanceof InstancedMesh ? object.count : 1;
    if (!count) return;
    visibleMeshes += 1;
    triangles +=
      ((object.geometry.index?.count ?? object.geometry.getAttribute('position').count) / 3) *
      count;
    if (object instanceof InstancedMesh) instances += count;
    geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : [object.material])
      materials.add(material);
  });
  return {
    visibleMeshes,
    triangles,
    instances,
    uniqueGeometries: geometries.size,
    uniqueMaterials: materials.size,
  };
}
