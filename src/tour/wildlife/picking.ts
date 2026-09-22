import type { SkinnedMesh } from 'three';

export function trackSkinnedBounds(mesh: SkinnedMesh): () => void {
  const raycast = mesh.raycast.bind(mesh);
  let dirty = true;
  mesh.raycast = (ray, intersections): void => {
    if (dirty) {
      mesh.computeBoundingSphere();
      if (mesh.boundingBox !== null) mesh.computeBoundingBox();
      dirty = false;
    }
    raycast(ray, intersections);
  };
  return () => {
    dirty = true;
  };
}
