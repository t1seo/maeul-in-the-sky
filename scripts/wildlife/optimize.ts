import { Accessor } from '@gltf-transform/core';
import type { Document } from '@gltf-transform/core';
import { dedup, joinPrimitives, prune, resample } from '@gltf-transform/functions';
import { WildlifeAssetError } from './sources.js';

export const PEACEFUL_CLIP = /(?:^|\|)(?:Idle(?:_2|_Headlow)?|Eating)$/;

export function retainWildlifeClip(id: string, name: string): boolean {
  return (
    PEACEFUL_CLIP.test(name) && !((id === 'horse' || id === 'donkey') && name === 'Idle_Headlow')
  );
}

export async function optimizeWildlife(document: Document, id: string): Promise<void> {
  const root = document.getRoot();
  for (const animation of root.listAnimations()) {
    if (retainWildlifeClip(id, animation.getName())) continue;
    for (const channel of animation.listChannels()) channel.dispose();
    for (const sampler of animation.listSamplers()) sampler.dispose();
    animation.dispose();
  }
  if (id !== 'squirrel') {
    const buffer = root.listBuffers()[0];
    const original = root.listMaterials()[0];
    if (!buffer || !original) throw new WildlifeAssetError(id, 'Missing buffer or material');
    const material = document
      .createMaterial(`${id}-fur`)
      .setBaseColorFactor([1, 1, 1, 1])
      .setRoughnessFactor(original.getRoughnessFactor())
      .setMetallicFactor(original.getMetallicFactor())
      .setDoubleSided(original.getDoubleSided())
      .setAlphaMode(original.getAlphaMode());
    for (const mesh of root.listMeshes()) {
      const primitives = mesh.listPrimitives();
      for (const primitive of primitives) {
        const sourceMaterial = primitive.getMaterial();
        const positions = primitive.getAttribute('POSITION');
        if (!sourceMaterial || !positions || sourceMaterial.getBaseColorTexture()) {
          throw new WildlifeAssetError(id, 'Expected solid authored materials and positions');
        }
        if (
          sourceMaterial.getRoughnessFactor() !== material.getRoughnessFactor() ||
          sourceMaterial.getMetallicFactor() !== material.getMetallicFactor() ||
          sourceMaterial.getDoubleSided() !== material.getDoubleSided() ||
          sourceMaterial.getAlphaMode() !== material.getAlphaMode()
        ) {
          throw new WildlifeAssetError(id, 'Cannot merge differing material lighting properties');
        }
        const color = sourceMaterial.getBaseColorFactor();
        const authoredColors = primitive.getAttribute('COLOR_0');
        const colors = new Float32Array(positions.getCount() * 4);
        for (let vertex = 0; vertex < positions.getCount(); vertex += 1) {
          const authored = authoredColors?.getElement(vertex, []) ?? [1, 1, 1, 1];
          colors.set(
            color.map((value, index) => value * (authored[index] ?? 1)),
            vertex * 4,
          );
        }
        primitive.setAttribute(
          'COLOR_0',
          document
            .createAccessor(`${id}-colors`, buffer)
            .setType(Accessor.Type.VEC4)
            .setArray(colors),
        );
        primitive.setAttribute('TEXCOORD_0', null).setMaterial(material);
      }
      if (primitives.length > 1) {
        const joined = joinPrimitives(primitives);
        for (const primitive of primitives) primitive.dispose();
        mesh.addPrimitive(joined);
      }
    }
  }
  await document.transform(
    resample({ tolerance: 0, cleanup: false }),
    dedup(),
    prune({ keepLeaves: true, keepAttributes: true, keepIndices: true }),
  );
}
