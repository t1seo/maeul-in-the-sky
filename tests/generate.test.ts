import { describe, expect, it, vi } from 'vitest';

import { createTerrainGenerator } from '../src/generate.js';
import type { ContributionData, Theme } from '../src/core/types.js';

const contributionData: ContributionData = {
  weeks: [
    {
      firstDay: '2025-01-05',
      days: [{ date: '2025-01-08', count: 3, level: 2 }],
    },
  ],
  stats: {
    total: 3,
    longestStreak: 1,
    currentStreak: 1,
    mostActiveDay: 'Wednesday',
    activeDays: 1,
    busiestMonth: '2025-01',
    fromDate: '2025-01-08',
    toDate: '2025-01-08',
  },
  year: 2025,
  username: 'testuser',
};

function createHarness() {
  const render = vi.fn(() => ({ dark: '<svg>dark</svg>', light: '<svg>light</svg>' }));
  const terrainTheme: Theme = {
    name: 'terrain',
    displayName: 'Terrain',
    description: 'test terrain',
    render,
  };
  const fetchContributions = vi.fn(async () => contributionData);
  const makeDirectory = vi.fn(async () => undefined);
  const writeFile = vi.fn(async () => undefined);
  const generator = createTerrainGenerator({
    fetchContributions,
    getTheme: (name) => (name === 'terrain' ? terrainTheme : undefined),
    listThemes: () => ['terrain'],
    getDefaultTheme: () => 'terrain',
    makeDirectory,
    writeFile,
  });

  return { generator, fetchContributions, makeDirectory, writeFile, render };
}

describe('generateTerrain', () => {
  it('owns validation, fetching, rendering, and writing behind one interface', async () => {
    const harness = createHarness();
    const progress = vi.fn();

    const result = await harness.generator({
      username: 'testuser',
      token: 'token',
      year: '2025',
      outputDir: 'nested/output',
      hemisphere: 'south',
      preset: 'civilization',
      density: '7',
      onProgress: progress,
    });

    expect(harness.fetchContributions).toHaveBeenCalledWith('testuser', 2025, 'token');
    expect(harness.render).toHaveBeenCalledWith(contributionData, {
      title: '@testuser',
      width: 840,
      height: 240,
      hemisphere: 'south',
      density: 7,
    });
    expect(harness.makeDirectory).toHaveBeenCalledWith('nested/output');
    expect(harness.writeFile).toHaveBeenNthCalledWith(
      1,
      'nested/output/maeul-in-the-sky-dark.svg',
      '<svg>dark</svg>',
    );
    expect(harness.writeFile).toHaveBeenNthCalledWith(
      2,
      'nested/output/maeul-in-the-sky-light.svg',
      '<svg>light</svg>',
    );
    expect(harness.makeDirectory.mock.invocationCallOrder[0]).toBeLessThan(
      harness.writeFile.mock.invocationCallOrder[0],
    );
    expect(progress).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      darkPath: 'nested/output/maeul-in-the-sky-dark.svg',
      lightPath: 'nested/output/maeul-in-the-sky-light.svg',
      themeName: 'terrain',
      themeDisplayName: 'Terrain',
      presetName: 'civilization',
      density: 7,
    });
  });

  it.each([
    [{ username: '' }, 'GitHub username is required'],
    [{ username: 'testuser', year: 'not-a-year' }, 'Invalid year'],
    [{ username: 'testuser', hemisphere: 'east' }, 'Invalid hemisphere'],
    [{ username: 'testuser', preset: 'city' }, 'Invalid preset'],
    [{ username: 'testuser', density: '0' }, 'Invalid density'],
    [{ username: 'testuser', density: '11' }, 'Invalid density'],
  ])('rejects invalid request %#', async (request, message) => {
    const { generator } = createHarness();

    await expect(generator(request)).rejects.toThrow(message);
  });

  it('reports available themes when selection fails', async () => {
    const { generator } = createHarness();

    await expect(generator({ username: 'testuser', theme: 'missing' })).rejects.toThrow(
      'Unknown theme "missing". Available themes: terrain',
    );
  });

  it.each([
    ['nature', 2],
    ['balanced', 5],
    ['civilization', 9],
  ])('maps the %s preset to density %i', async (preset, density) => {
    const harness = createHarness();

    const result = await harness.generator({ username: 'testuser', preset });

    expect(harness.render).toHaveBeenCalledWith(
      contributionData,
      expect.objectContaining({ density }),
    );
    expect(result).toEqual(expect.objectContaining({ presetName: preset, density }));
  });

  it('lets an explicit density override the selected preset', async () => {
    const harness = createHarness();

    const result = await harness.generator({
      username: 'testuser',
      preset: 'nature',
      density: 8,
    });

    expect(harness.render).toHaveBeenCalledWith(
      contributionData,
      expect.objectContaining({ density: 8 }),
    );
    expect(result.density).toBe(8);
  });

  it('treats an empty Action density input as unspecified', async () => {
    const harness = createHarness();

    const result = await harness.generator({
      username: 'testuser',
      preset: 'civilization',
      density: '',
    });

    expect(harness.render).toHaveBeenCalledWith(
      contributionData,
      expect.objectContaining({ density: 9 }),
    );
    expect(result.density).toBe(9);
  });
});
