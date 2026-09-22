import type { Document } from '@gltf-transform/core';
import sharp from 'sharp';
import { WildlifeAssetError } from './sources.js';

export async function resizeWildlifeTextures(document: Document, id: string): Promise<void> {
  if (id === 'squirrel') return;
  for (const texture of document.getRoot().listTextures()) {
    const image = texture.getImage();
    if (!image) throw new WildlifeAssetError(id, 'Missing embedded texture image');
    const metadata = await sharp(image).metadata();
    if (!metadata.width || !metadata.height)
      throw new WildlifeAssetError(id, 'Invalid image dimensions');
    if (metadata.width <= 512 && metadata.height <= 512) continue;
    const resized = await sharp(image)
      .resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();
    texture.setImage(resized).setMimeType('image/png');
  }
}
