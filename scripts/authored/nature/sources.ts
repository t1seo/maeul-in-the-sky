import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { z } from 'zod';

export const NATURE_SOURCE = {
  creator: 'Quaternius',
  originalTitle: 'Stylized Nature MegaKit — Standard',
  modelUrl: 'https://quaternius.com/packs/stylizednaturemegakit.html',
  downloadUrl: 'https://quaternius.itch.io/stylized-nature-megakit/file/11055123',
  license: 'CC0-1.0',
  licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  licenseFile: 'licenses/Quaternius-nature-standard.txt',
  sha256: '298f6732b872e4cf7b30e6e7abf9641c7f6dc6b326df37ac089533ed7e3d58c9',
  bytes: 104088529,
} as const;

const SOURCE_FILE = z.object({
  file: z.string().regex(/^(?:glTF\/[A-Za-z0-9_]+\.(?:gltf|bin|png)|License_Standard\.txt)$/),
  bytes: z.number().int().positive(),
  sha256: z.string().regex(/^[a-f\d]{64}$/),
});

export class NatureAssetError extends Error {
  readonly name = 'NatureAssetError';

  constructor(
    readonly file: string,
    message: string,
  ) {
    super(`${file}: ${message}`);
  }
}

export function digest(data: Uint8Array): string {
  return createHash('sha256').update(data).digest('hex');
}

export function verifyNatureBytes(data: Uint8Array, source: z.infer<typeof SOURCE_FILE>): void {
  if (data.byteLength !== source.bytes || digest(data) !== source.sha256) {
    throw new NatureAssetError(source.file, 'Source differs from the verified licensed original');
  }
}

export async function verifyNatureSources(directory: string, archiveFile: string): Promise<void> {
  verifyNatureBytes(await readFile(archiveFile), { file: archiveFile, ...NATURE_SOURCE });
  const files = z
    .array(SOURCE_FILE)
    .length(52)
    .parse(JSON.parse(await readFile(new URL('./source-files.json', import.meta.url), 'utf8')));
  for (const source of files) {
    verifyNatureBytes(await readFile(resolve(directory, source.file)), source);
  }
}
