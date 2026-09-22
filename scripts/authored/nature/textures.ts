import type { Document } from '@gltf-transform/core';
import sharp from 'sharp';
import { NatureAssetError } from './sources.js';

export async function prepareNatureTextures(document: Document): Promise<void> {
  const root = document.getRoot();
  const normalMaps = new Set(root.listMaterials().map((material) => material.getNormalTexture()));
  for (const texture of root.listTextures()) {
    const original = texture.getImage();
    if (!original) throw new NatureAssetError(texture.getName(), 'Embedded image is missing');
    const image = sharp(original).resize({
      width: 512,
      height: 512,
      fit: 'inside',
      withoutEnlargement: true,
    });
    const pixels = await image.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let opaque = true;
    for (let index = 3; index < pixels.data.length; index += 4) {
      if (pixels.data[index] !== 255) {
        opaque = false;
        break;
      }
    }
    const encoded = opaque
      ? await image
          .removeAlpha()
          .jpeg({ quality: normalMaps.has(texture) ? 95 : 85, chromaSubsampling: '4:4:4' })
          .toBuffer()
      : await image.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
    texture
      .setImage(encoded)
      .setMimeType(opaque ? 'image/jpeg' : 'image/png')
      .setURI('');
  }
}
