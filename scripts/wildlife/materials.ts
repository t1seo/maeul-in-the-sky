import { Accessor, type Document, type Primitive } from '@gltf-transform/core';
import { joinPrimitives } from '@gltf-transform/functions';
import { WildlifeAssetError } from './sources.js';

export function consolidateWildlifeMaterials(document: Document, id: string): void {
  const root = document.getRoot();
  const solids = root
    .listMeshes()
    .flatMap((mesh) => mesh.listPrimitives())
    .filter((primitive) => !primitive.getMaterial()?.getBaseColorTexture());
  if (solids.length === 0) return;
  const buffer = root.listBuffers()[0];
  const original = solids[0]?.getMaterial();
  if (!buffer || !original) throw new WildlifeAssetError(id, 'Missing buffer or material');
  const material = document
    .createMaterial(`${id}-fur`)
    .setBaseColorFactor([1, 1, 1, 1])
    .setRoughnessFactor(original.getRoughnessFactor())
    .setMetallicFactor(original.getMetallicFactor())
    .setDoubleSided(original.getDoubleSided())
    .setAlphaMode(original.getAlphaMode());
  for (const mesh of root.listMeshes()) {
    const primitives: Primitive[] = [];
    for (const primitive of mesh.listPrimitives()) {
      const sourceMaterial = primitive.getMaterial();
      const positions = primitive.getAttribute('POSITION');
      if (!sourceMaterial || !positions)
        throw new WildlifeAssetError(id, 'Missing material or positions');
      if (sourceMaterial.getBaseColorTexture()) continue;
      if (
        sourceMaterial.getRoughnessFactor() !== material.getRoughnessFactor() ||
        sourceMaterial.getMetallicFactor() !== material.getMetallicFactor() ||
        sourceMaterial.getDoubleSided() !== material.getDoubleSided() ||
        sourceMaterial.getAlphaMode() !== material.getAlphaMode()
      )
        throw new WildlifeAssetError(id, 'Cannot merge differing material lighting properties');
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
      primitives.push(primitive);
    }
    if (primitives.length > 1) {
      const joined = joinPrimitives(primitives);
      for (const primitive of primitives) primitive.dispose();
      mesh.addPrimitive(joined);
    }
  }
}
