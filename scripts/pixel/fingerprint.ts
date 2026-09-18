import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import { diagnosticPalette } from './paints.js';
import type { PixelSource } from './sources.js';

export const PIXEL_ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const PIXEL_OUTPUT = resolve(PIXEL_ROOT, 'src/themes/terrain/pixel/generated');

function files(directory: string): readonly string[] {
  return readdirSync(resolve(PIXEL_ROOT, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? files(path) : path.endsWith('.ts') ? [path] : [];
  });
}

export function pixelSourceFingerprint(): string {
  const directories = [
    'src/themes/terrain/assets/renderers',
    'src/themes/terrain/epics/renderers',
    'src/themes/terrain/palette',
  ];
  const paths = [
    ...directories.flatMap(files),
    ...['assets', 'epics'].flatMap((group) =>
      ['catalog', 'renderers', 'bounds', 'types'].map(
        (file) => `src/themes/terrain/${group}/${file}.ts`,
      ),
    ),
    ...['paints', 'sample', 'sources', 'fingerprint', 'generate', 'output'].map(
      (name) => `scripts/pixel/${name}.ts`,
    ),
    ...['colors', 'types', 'encode'].map((name) => `src/themes/terrain/pixel/${name}.ts`),
    'src/themes/terrain/assets/asset-types.ts',
    'src/themes/terrain/epics/definitions.ts',
    'src/core/animation.ts',
    'src/utils/color.ts',
    'src/utils/math.ts',
    'package-lock.json',
  ].sort();
  const hash = createHash('sha256');
  for (const path of paths)
    hash
      .update(path)
      .update('\0')
      .update(readFileSync(resolve(PIXEL_ROOT, path)))
      .update('\0');
  return hash.digest('hex');
}

export function pixelRenderedFingerprint(sources: readonly PixelSource[]): string {
  const hash = createHash('sha256');
  const palettes = [
    getTerrainPalette100('light').assets,
    getTerrainPalette100('dark').assets,
    diagnosticPalette(),
  ];
  for (const source of sources) {
    hash.update(source.id).update(source.group).update(JSON.stringify(source.bounds));
    for (let variant = 0; variant < source.variants; variant++) {
      for (const palette of palettes) hash.update(source.render(palette, variant));
    }
  }
  return hash.digest('hex');
}
