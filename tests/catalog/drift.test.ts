import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { generateCatalog } from '../../scripts/generate-catalog.js';
import { verifyGeneratedCatalog } from '../../scripts/catalog/check-generated.js';

describe('catalog pixel sprite drift', { timeout: 30_000 }, () => {
  let directory = '';

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), 'maeul-pixel-catalog-drift-'));
    await generateCatalog(directory);
  }, 30_000);

  afterAll(async () => {
    await rm(directory, { recursive: true });
  });

  it.each([
    ['dark', 'catalog-sprite-dark.svg'],
    ['light', 'catalog-sprite-light.svg'],
    ['dark', 'catalog-sprite-pixel-light.svg'],
    ['light', 'catalog-sprite-pixel-dark.svg'],
  ] as const)('rejects %s pixel sprites replaced by %s', async (mode, wrongFile) => {
    const target = join(directory, `catalog-sprite-pixel-${mode}.svg`);
    const original = await readFile(target);
    const wrong = await readFile(join(directory, wrongFile));
    try {
      await writeFile(target, wrong);
      await expect(verifyGeneratedCatalog(directory)).rejects.toThrowError(
        `pixel ${mode} sprite: generated output differs from current catalog sources`,
      );
    } finally {
      await writeFile(target, original);
    }
  });

  it.each(['dark', 'light'] as const)('rejects a missing %s pixel sprite', async (mode) => {
    const target = join(directory, `catalog-sprite-pixel-${mode}.svg`);
    const original = await readFile(target);
    try {
      await rm(target);
      await expect(verifyGeneratedCatalog(directory)).rejects.toThrowError(
        `catalog-sprite-pixel-${mode}.svg`,
      );
    } finally {
      await writeFile(target, original);
    }
  });
});
