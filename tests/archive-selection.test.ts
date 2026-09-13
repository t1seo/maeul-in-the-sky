import { describe, expect, it, vi } from 'vitest';
import { createArchiveGenerator } from '../src/archive.js';
import { renderArchiveComparison } from '../src/archive/comparison.js';
import { createArchive } from '../src/core/archive/comparison.js';
import { parseArchive } from '../src/core/archive/parse.js';
import type { Theme } from '../src/core/types.js';
import { harness, snapshot } from './cli/fixtures.js';

describe('archive comparison selection', () => {
  it('renders only comparison years when the archive stores additional snapshots', () => {
    // Given
    const test = harness();
    const archive = createArchive([snapshot(2023), snapshot(2024), snapshot(2025)], [2024, 2025]);
    const theme = test.dependencies.getTheme('custom');
    if (theme === undefined) throw new TypeError('Archive test theme is required');

    // When
    const comparison = renderArchiveComparison(archive, theme, 'shared-p90');

    // Then
    expect(test.render).toHaveBeenCalledTimes(2);
    expect(comparison.dark).not.toContain('>2023</text>');
    expect(comparison.dark).toContain('>2024</text>');
    expect(comparison.dark).toContain('>2025</text>');
  });

  it('public generation emits annual outputs only for selected comparison years', async () => {
    // Given
    const test = harness();
    const archive = createArchive([snapshot(2023), snapshot(2024), snapshot(2025)], [2024, 2025]);

    // When
    const result = await createArchiveGenerator(test.dependencies)({
      input: archive,
      outputDir: 'selected',
    });

    // Then
    expect(result.years).toEqual([2024, 2025]);
    expect(result.outputs.map((output) => output.darkPath)).toEqual([
      'selected/2024/maeul-in-the-sky-dark.svg',
      'selected/2025/maeul-in-the-sky-dark.svg',
    ]);
    expect(test.files.has('selected/2023/maeul-in-the-sky-dark.svg')).toBe(false);
    expect(
      parseArchive(test.files.get(result.archivePath)).snapshots.map((entry) => entry.year),
    ).toEqual([2023, 2024, 2025]);
  });

  it('positions and namespaces custom SVGs independent of quote and root whitespace style', () => {
    // Given
    const archive = createArchive([snapshot(2024), snapshot(2025)]);
    const customSvg = `<svg
xmlns='http://www.w3.org/2000/svg' aria-labelledby='title details'>
<style>#tile { fill: url(#marker) }</style>
<defs><linearGradient id='marker'><stop offset='1'/></linearGradient></defs>
<title id='title'>Village</title><desc id='details'>Details</desc>
<use id='tile' href='#marker'/>
</svg>`;
    const theme: Theme = {
      name: 'single-quoted',
      displayName: 'Single quoted',
      description: 'Custom SVG syntax fixture',
      render: vi.fn(() => ({ dark: customSvg, light: customSvg })),
    };

    // When
    const comparison = renderArchiveComparison(archive, theme, 'shared-p90');

    // Then
    expect(comparison.dark).toMatch(/<svg\b(?=[^>]*\bx=['"]0['"])(?=[^>]*\by=['"]94['"])[^>]*>/);
    expect(comparison.dark).toMatch(/<svg\b(?=[^>]*\bx=['"]0['"])(?=[^>]*\by=['"]484['"])[^>]*>/);
    const ids = [...comparison.dark.matchAll(/\sid=(['"])([^'"]+)\1/g)].map((match) => match[2]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(comparison.dark).toContain("id='archive-dark-0-marker'");
    expect(comparison.dark).toContain("href='#archive-dark-0-marker'");
    expect(comparison.dark).toContain('#archive-dark-0-tile');
    expect(comparison.dark).toContain('url(#archive-dark-0-marker)');
    expect(comparison.dark).toContain(
      "aria-labelledby='archive-dark-0-title archive-dark-0-details'",
    );
  });
});
