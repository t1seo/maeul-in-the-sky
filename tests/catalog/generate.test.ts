import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { generateCatalog } from '../../scripts/generate-catalog.js';
import { verifyGeneratedCatalog } from '../../scripts/catalog/check-generated.js';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

// Each integration case rasterizes six PNG sheets, including under CI coverage.
describe('catalog regeneration', { timeout: 30_000 }, () => {
  it('C04-generate: preserves existing sheets and creates the interactive gallery', async () => {
    // Given
    const outputDirectory = await mkdtemp(join(tmpdir(), 'maeul-catalog-'));
    temporaryDirectories.push(outputDirectory);

    // When
    await generateCatalog(outputDirectory);

    // Then
    for (const name of [
      'assets-dark.svg',
      'assets-light.svg',
      'wonders-dark.svg',
      'wonders-light.svg',
      'korean-dark.svg',
      'korean-light.svg',
      'catalog.json',
      'index.html',
      'catalog.css',
      'catalog.js',
      'catalog-sprite-dark.svg',
      'catalog-sprite-light.svg',
    ]) {
      expect((await readFile(join(outputDirectory, name))).byteLength).toBeGreaterThan(0);
    }
    await expect(verifyGeneratedCatalog(outputDirectory)).resolves.toEqual({
      assets: 193,
      wonders: 30,
      records: 223,
    });
  });

  it('C04-generate: rejects stale generated browser assets', async () => {
    // Given
    const outputDirectory = await mkdtemp(join(tmpdir(), 'maeul-catalog-drift-'));
    temporaryDirectories.push(outputDirectory);
    await generateCatalog(outputDirectory);

    // When
    await writeFile(join(outputDirectory, 'catalog.css'), 'stale\n');

    // Then
    await expect(verifyGeneratedCatalog(outputDirectory)).rejects.toThrowError(
      'catalog.css: generated output differs from current catalog sources',
    );
  });
});
