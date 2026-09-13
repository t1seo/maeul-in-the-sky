import { describe, expect, it } from 'vitest';
import { createArchiveGenerator } from '../src/archive.js';
import { parseArchive } from '../src/core/archive/parse.js';
import { InputValidationError } from '../src/core/settings/errors.js';
import { executeGeneration } from '../src/generate/operation.js';
import type { Theme } from '../src/core/types.js';
import { harness, snapshot } from './cli/fixtures.js';

describe('Node archive generation', () => {
  it('C13-archive writes year folders, an honest manifest and common-scale cards', async () => {
    const test = harness();
    const result = await createArchiveGenerator(test.dependencies)({
      snapshots: [snapshot(2025, 3), snapshot(2024, 10)],
      outputDir: 'archive',
    });
    expect(test.fetchContributions).not.toHaveBeenCalled();
    expect(result.years).toEqual([2024, 2025]);
    expect(result.normalization).toEqual({ kind: 'fixed', maxCount: 10 });
    expect(result.outputs.map((entry) => entry.darkPath)).toEqual([
      'archive/2024/maeul-in-the-sky-dark.svg',
      'archive/2025/maeul-in-the-sky-dark.svg',
    ]);
    const archive = parseArchive(test.files.get(result.archivePath));
    expect(archive.snapshots.every((entry) => entry.source.kind === 'sample')).toBe(true);
    expect(
      archive.snapshots.every((entry) => entry.settings.normalization.kind === 'relative'),
    ).toBe(true);
    expect(test.files.get(result.comparisonDarkPath)).toContain('Pooled nonzero P90: 10');
    expect(test.files.get(result.comparisonDarkPath)).toContain('data-asset-id="tile"');
    expect(test.files.get(result.comparisonDarkPath)).toContain('#archive-dark-0-tile {fill:#fff}');
    const comparisons = test.render.mock.calls.filter(([, options]) => options.layout === 'card');
    expect(comparisons).toHaveLength(2);
    expect(comparisons.every(([, options]) => options.normalization?.kind === 'fixed')).toBe(true);
    const ids = [
      ...(test.files.get(result.comparisonDarkPath) ?? '').matchAll(/\sid="([^"]+)"/g),
    ].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('accepts explicit fixed maximum and archive input without fetching', async () => {
    const test = harness();
    const generate = createArchiveGenerator(test.dependencies);
    const first = await generate({
      snapshots: [snapshot(2024), snapshot(2025)],
      outputDir: 'archive',
    });
    const result = await executeGeneration(
      { input: first.archivePath, normalization: 'fixed', maxCount: '25', outputDir: 'copy' },
      test.dependencies,
    );
    expect(result.kind).toBe('archive');
    expect(test.fetchContributions).not.toHaveBeenCalled();
    expect(test.files.get('copy/maeul-in-the-sky-comparison-light.svg')).toContain(
      'Fixed common maximum: 25',
    );
  });
  it('fetches each requested year once using a single identity', async () => {
    const test = harness();
    await createArchiveGenerator(test.dependencies)({
      username: 'testuser',
      token: 'secret',
      years: '2024,2025',
      normalization: 'shared',
    });
    expect(test.fetchContributions.mock.calls).toEqual([
      ['testuser', 2024, 'secret'],
      ['testuser', 2025, 'secret'],
    ]);
  });
  it.each([
    { years: '2024,2024' },
    { years: '2025' },
    { years: '2024,2025', year: 2025 },
    { snapshots: [snapshot(2024), snapshot(2025, 3, 'other')] },
  ])('rejects bad archive selection before writing %j', async (options) => {
    const test = harness();
    await expect(
      createArchiveGenerator(test.dependencies)({ username: 'testuser', ...options }),
    ).rejects.toThrow();
    expect(test.dependencies.writeFile).not.toHaveBeenCalled();
  });

  it('rejects malformed custom Theme SVG before writing any annual or comparison artifact', async () => {
    // Given
    const test = harness();
    const malformedTheme: Theme = {
      name: 'malformed',
      displayName: 'Malformed',
      description: 'Malformed XML regression fixture',
      render: () => ({ dark: '<svg><g></svg>', light: '<svg><g></svg>' }),
    };
    const dependencies = {
      ...test.dependencies,
      getTheme: () => malformedTheme,
      getDefaultTheme: () => malformedTheme.name,
    };

    // When
    const generation = createArchiveGenerator(dependencies)({
      snapshots: [snapshot(2024), snapshot(2025)],
      outputDir: 'malformed',
    });

    // Then
    await expect(generation).rejects.toBeInstanceOf(InputValidationError);
    expect(dependencies.makeDirectory).not.toHaveBeenCalled();
    expect(dependencies.writeFile).not.toHaveBeenCalled();
  });

  it('rejects selector value collisions before writing any archive artifact', async () => {
    // Given
    const test = harness();
    const collisionTheme: Theme = {
      name: 'selector-collision',
      displayName: 'Selector collision',
      description: 'Unrepresentable selector mapping regression fixture',
      render: () => ({
        dark: `<svg xmlns='http://www.w3.org/2000/svg'><style>[href="#shape"] { opacity: .4 }</style><path id='shape'/><use href='#shape'/><use href='#archive-dark-0-shape'/></svg>`,
        light: `<svg xmlns='http://www.w3.org/2000/svg'><path id='shape'/></svg>`,
      }),
    };
    const dependencies = {
      ...test.dependencies,
      getTheme: () => collisionTheme,
      getDefaultTheme: () => collisionTheme.name,
    };

    // When
    const generation = createArchiveGenerator(dependencies)({
      snapshots: [snapshot(2024), snapshot(2025)],
      outputDir: 'selector-collision',
    });

    // Then
    await expect(generation).rejects.toBeInstanceOf(InputValidationError);
    expect(dependencies.makeDirectory).not.toHaveBeenCalled();
    expect(dependencies.writeFile).not.toHaveBeenCalled();
  });
});
