import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { z } from 'zod';
import { requestedAuthored } from '../../src/tour/authored/catalog.js';
import { requestedWildlife } from '../../src/tour/wildlife/library.js';
import type { TourModel } from '../../src/tour/types.js';
import { AuthoredInventoryError, type InventoryModel } from './inventory.js';

const TEXTURES = z.object({
  bufferViews: z.array(
    z.object({
      byteOffset: z.number().int().nonnegative().default(0),
      byteLength: z.number().int().positive(),
    }),
  ),
  images: z.array(z.object({ bufferView: z.number().int().nonnegative() })).default([]),
});

async function decodedTextureBytes(file: string): Promise<number> {
  const bytes = readFileSync(file);
  const end = 20 + bytes.readUInt32LE(12);
  const value: unknown = JSON.parse(bytes.subarray(20, end).toString('utf8'));
  const document = TEXTURES.parse(value);
  let decoded = 0;
  for (const image of document.images) {
    const view = document.bufferViews[image.bufferView];
    if (!view) throw new AuthoredInventoryError(file, 'Missing image buffer view');
    const start = end + 8 + view.byteOffset;
    const metadata = await sharp(bytes.subarray(start, start + view.byteLength)).metadata();
    if (!metadata.width || !metadata.height)
      throw new AuthoredInventoryError(file, 'Missing embedded image dimensions');
    decoded += metadata.width * metadata.height * 4;
  }
  return decoded;
}

export async function requestedAssetBudget(
  model: TourModel,
  inventory: readonly InventoryModel[],
  root: string,
) {
  const files = [
    ...new Set([
      ...requestedAuthored(model),
      ...requestedWildlife(model).map((species) => `${species}.glb`),
    ]),
  ];
  const measurements = await Promise.all(
    files.map(async (file) => {
      const record = inventory.find((entry) => entry.relativeFile === file);
      if (!record) throw new AuthoredInventoryError(file, 'Requested asset has no manifest record');
      return {
        file,
        bytes: record.bytes,
        decodedTextureBytes: await decodedTextureBytes(join(root, file)),
      };
    }),
  );
  const bytes = measurements.reduce((sum, entry) => sum + entry.bytes, 0);
  const decodedBytes = measurements.reduce((sum, entry) => sum + entry.decodedTextureBytes, 0);
  return {
    files: measurements,
    bytes,
    decodedTextureBytes: decodedBytes,
    textureBytesWithMipmaps: Math.ceil((decodedBytes * 4) / 3),
  };
}

export function verifyRequestedAssetBudget(
  budget: Awaited<ReturnType<typeof requestedAssetBudget>>,
): void {
  if (budget.bytes > 12 * 1024 * 1024)
    throw new AuthoredInventoryError('requested models', 'Initial transfer exceeds 12 MiB');
  if (budget.textureBytesWithMipmaps > 128 * 1024 * 1024)
    throw new AuthoredInventoryError(
      'requested textures',
      'Decoded RGBA textures with mipmaps exceed 128 MiB',
    );
}
