import { Accessor } from '@gltf-transform/core';
import type { Document } from '@gltf-transform/core';
import { KHRTextureTransform, Transform } from '@gltf-transform/extensions';
import sharp from 'sharp';
import { VillagePreparationError } from './schema.js';

export function bakeVillageColors(document: Document, id: string): void {
  const root = document.getRoot();
  const buffer = root.listBuffers()[0];
  if (!buffer) throw new VillagePreparationError(id, 'Missing buffer');
  const material = document
    .createMaterial(`${id}-surface`)
    .setBaseColorFactor([1, 1, 1, 1])
    .setMetallicFactor(0)
    .setRoughnessFactor(id.startsWith('onggi-') && id !== 'onggi-terrace' ? 0.38 : 0.86);
  for (const mesh of root.listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const original = primitive.getMaterial();
      const positions = primitive.getAttribute('POSITION');
      if (!original || !positions || original.getBaseColorTexture()) {
        throw new VillagePreparationError(id, 'Expected solid color geometry');
      }
      const color = original.getBaseColorFactor();
      const previous = primitive.getAttribute('COLOR_0');
      const colors = new Uint8Array(positions.getCount() * 4);
      for (let vertex = 0; vertex < positions.getCount(); vertex += 1) {
        const authored = previous?.getElement(vertex, []) ?? [1, 1, 1, 1];
        colors.set(
          color.map((value, channel) => Math.round(255 * value * (authored[channel] ?? 1))),
          vertex * 4,
        );
      }
      primitive.setAttribute(
        'COLOR_0',
        document
          .createAccessor(`${id}-colors`, buffer)
          .setType(Accessor.Type.VEC4)
          .setArray(colors)
          .setNormalized(true),
      );
      primitive
        .setAttribute('TEXCOORD_0', null)
        .setAttribute('TEXCOORD_1', null)
        .setAttribute('TANGENT', null)
        .setMaterial(material);
    }
  }
}

export async function embedVillageTextures(document: Document, id: string): Promise<void> {
  for (const mesh of document.getRoot().listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const info = primitive.getMaterial()?.getBaseColorTextureInfo();
      const transform = info?.getExtension<Transform>(KHRTextureTransform.EXTENSION_NAME);
      if (!transform) continue;
      const uv = primitive.getAttribute(
        `TEXCOORD_${transform.getTexCoord() ?? info?.getTexCoord() ?? 0}`,
      );
      if (!uv) throw new VillagePreparationError(id, 'Transformed texture has no coordinates');
      const output = uv.clone();
      const [sx, sy] = transform.getScale();
      const [ox, oy] = transform.getOffset();
      const angle = transform.getRotation();
      for (let vertex = 0; vertex < uv.getCount(); vertex += 1) {
        const coordinates: [number, number] = [0, 0];
        const [u, v] = uv.getElement(vertex, coordinates);
        output.setElement(vertex, [
          ox + Math.cos(angle) * sx * u - Math.sin(angle) * sy * v,
          oy + Math.sin(angle) * sx * u + Math.cos(angle) * sy * v,
        ]);
      }
      primitive.setAttribute('TEXCOORD_0', output);
    }
  }
  for (const material of document.getRoot().listMaterials()) {
    material.getBaseColorTextureInfo()?.setExtension(KHRTextureTransform.EXTENSION_NAME, null);
  }
  document
    .getRoot()
    .listExtensionsUsed()
    .find((extension) => extension.extensionName === KHRTextureTransform.EXTENSION_NAME)
    ?.dispose();
  for (const texture of document.getRoot().listTextures()) {
    const image = texture.getImage();
    if (!image) throw new VillagePreparationError(id, 'Missing texture bytes');
    const size = texture.getSize();
    if (size && Math.max(...size) > 1024) {
      const output = await sharp(image)
        .resize(1024, 1024, { fit: 'inside' })
        .jpeg({ quality: 90 })
        .toBuffer();
      texture.setImage(output).setMimeType('image/jpeg');
    }
    texture.setURI('');
  }
}
