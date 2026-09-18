import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { format } from 'prettier';
import { z } from 'zod';
import type { PixelSprite } from '../../src/themes/terrain/pixel/types.js';
import {
  PIXEL_ALPHA_THRESHOLD,
  PIXEL_GRID_STEP,
  PIXEL_PALETTE_LIMIT,
} from '../../src/themes/terrain/pixel/types.js';
import { PIXEL_OUTPUT } from './fingerprint.js';
import { PixelCompileError } from './paints.js';

export type CompiledPixelSource = {
  readonly id: string;
  readonly group: string;
  readonly sprites: readonly PixelSprite[];
};

const manifestSchema = z.object({
  sourceFingerprint: z.string(),
  renderedFingerprint: z.string(),
  provisional: z.boolean(),
  files: z.record(z.string(), z.string()),
});

export function checkPixelOutput(
  sourceFingerprint: string,
  renderedFingerprint: string,
  directory = PIXEL_OUTPUT,
): void {
  const manifest = manifestSchema.parse(
    JSON.parse(readFileSync(resolve(directory, 'manifest.json'), 'utf8')),
  );
  if (
    manifest.sourceFingerprint !== sourceFingerprint ||
    manifest.renderedFingerprint !== renderedFingerprint
  ) {
    throw new PixelCompileError('Source fingerprint drift; run npx tsx scripts/pixel/generate.ts');
  }
  if (manifest.provisional)
    throw new PixelCompileError('Provisional data needs final artwork regeneration');
  for (const [file, expected] of Object.entries(manifest.files)) {
    const hash = createHash('sha256')
      .update(readFileSync(resolve(directory, file)))
      .digest('hex');
    if (hash !== expected) throw new PixelCompileError(`Generated output drift: ${file}`);
  }
}

export async function writePixelOutput(
  compiled: readonly CompiledPixelSource[],
  sourceFingerprint: string,
  renderedFingerprint: string,
  provisional: boolean,
): Promise<void> {
  mkdirSync(PIXEL_OUTPUT, { recursive: true });
  const output = new Map<string, string>();
  for (const source of compiled) {
    const unique = [...new Set(source.sprites.map((sprite) => JSON.stringify(sprite)))];
    const variantNames = source.sprites.map(
      (sprite) => `variant${unique.indexOf(JSON.stringify(sprite))}`,
    );
    output.set(
      `${source.id}.ts`,
      `import type { PixelSprite } from '../types.js';\n` +
        unique
          .map((sprite, index) => `const variant${index}: PixelSprite = ${sprite};`)
          .join('\n') +
        `\nexport const sprites: readonly PixelSprite[] = [${variantNames.join(',')}];\n`,
    );
  }
  const groups = [...new Set(compiled.map((source) => source.group))].sort();
  for (const group of groups) {
    const members = compiled.filter((source) => source.group === group);
    output.set(
      `group-${group}.ts`,
      `import type { PixelSprite } from '../types.js';\n` +
        members.map(({ id }) => `import { sprites as ${id} } from './${id}.js';`).join('\n') +
        `\nexport const sprites: Readonly<Record<string, readonly PixelSprite[]>> = {${members.map(({ id }) => id).join(',')}};\n`,
    );
  }
  output.set(
    'index.ts',
    `import type { PixelSprite } from '../types.js';\n` +
      groups
        .map((group, index) => `import { sprites as group${index} } from './group-${group}.js';`)
        .join('\n') +
      `\nexport const PIXEL_SPRITES: Readonly<Record<string, readonly PixelSprite[]>> = {${groups.map((_, index) => `...group${index}`).join(',')}};\n`,
  );
  const hashes: Record<string, string> = {};
  for (const [file, code] of output) {
    const formatted = await format(code, {
      parser: 'typescript',
      singleQuote: true,
      printWidth: 100,
      trailingComma: 'all',
    });
    writeFileSync(resolve(PIXEL_OUTPUT, file), formatted);
    hashes[file] = createHash('sha256').update(formatted).digest('hex');
  }
  for (const file of readdirSync(PIXEL_OUTPUT)) {
    if (file.endsWith('.ts') && !output.has(file)) unlinkSync(resolve(PIXEL_OUTPUT, file));
  }
  writeFileSync(
    resolve(PIXEL_OUTPUT, 'manifest.json'),
    JSON.stringify(
      {
        sourceFingerprint,
        renderedFingerprint,
        provisional,
        gridStep: PIXEL_GRID_STEP,
        alphaThreshold: PIXEL_ALPHA_THRESHOLD,
        paletteLimit: PIXEL_PALETTE_LIMIT,
        assets: compiled.length,
        variants: compiled.reduce((sum, item) => sum + item.sprites.length, 0),
        files: hashes,
      },
      null,
      2,
    ) + '\n',
  );
}
