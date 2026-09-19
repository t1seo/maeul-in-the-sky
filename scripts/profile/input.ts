import { createHash } from 'node:crypto';
import { open, realpath } from 'node:fs/promises';
import { MAX_IMPORT_BYTES } from '../../src/core/settings/boundary.js';
import { parseSnapshot } from '../../src/core/settings/parse.js';
import { buildWorld } from '../../src/world/model/build.js';
import { defaultWorldSettings } from '../../src/world/model/defaults.js';
import { parseWorldScene } from '../../src/world/model/parse.js';

export function sha256(bytes: string | Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

export async function readProfileInput(path: string) {
  const canonicalPath = await realpath(path);
  const file = await open(canonicalPath, 'r');
  let text: string;
  try {
    const info = await file.stat();
    if (!info.isFile() || info.size > MAX_IMPORT_BYTES)
      throw new Error('Profile input must be a snapshot JSON file of at most 2 MiB.');
    const buffer = Buffer.alloc(MAX_IMPORT_BYTES + 1);
    let length = 0;
    while (length < buffer.length) {
      const { bytesRead } = await file.read(buffer, length, buffer.length - length, null);
      if (bytesRead === 0) break;
      length += bytesRead;
    }
    if (length > MAX_IMPORT_BYTES) throw new Error('Profile snapshot exceeds 2 MiB.');
    text = buffer.subarray(0, length).toString('utf8');
  } finally {
    await file.close();
  }
  const snapshot = parseSnapshot(text);
  const scene = parseWorldScene(
    buildWorld({
      snapshot,
      repositories: [],
      settings: { ...defaultWorldSettings(snapshot), layout: 'seasonal-circle' },
    }),
  );
  return { snapshot, scene, canonicalPath, sha256: sha256(text) };
}

export type ProfileInput = Awaited<ReturnType<typeof readProfileInput>>;
