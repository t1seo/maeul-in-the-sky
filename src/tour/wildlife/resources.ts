import { Mesh, SkinnedMesh, Texture, type BufferGeometry, type Material } from 'three';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';

export function disposeWildlifeModels(models: Iterable<GLTF>): void {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  const bitmaps = new Set<ImageBitmap>();
  for (const model of models) {
    for (const scene of model.scenes) {
      scene.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material]) {
          materials.add(material);
          for (const value of Object.values(material)) {
            if (value instanceof Texture) textures.add(value);
          }
        }
        if (object instanceof SkinnedMesh) object.skeleton.dispose();
      });
    }
  }
  for (const texture of textures) {
    const source: unknown = texture.source.data;
    if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) bitmaps.add(source);
    texture.dispose();
  }
  for (const bitmap of bitmaps) bitmap.close();
  for (const material of materials) material.dispose();
  for (const geometry of geometries) geometry.dispose();
}
