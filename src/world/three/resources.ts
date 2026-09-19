import {
  InstancedMesh,
  Line,
  Material,
  Mesh,
  Points,
  Sprite,
  Texture,
  type BufferGeometry,
  type Object3D,
} from 'three';

export function disposeObjectTree(root: Object3D, disposeTextures = true): void {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  root.traverse((object) => {
    if (object instanceof InstancedMesh) object.dispose();
    if (object instanceof Mesh || object instanceof Points || object instanceof Line) {
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material])
        materials.add(material);
    } else if (object instanceof Sprite) {
      geometries.add(object.geometry);
      materials.add(object.material);
    }
  });
  for (const material of materials) {
    if (disposeTextures)
      for (const value of Object.values(material))
        if (value instanceof Texture) textures.add(value);
    material.dispose();
  }
  for (const geometry of geometries) geometry.dispose();
  for (const texture of textures) texture.dispose();
  root.clear();
}
