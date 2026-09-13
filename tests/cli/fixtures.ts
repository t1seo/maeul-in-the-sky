import { vi } from 'vitest';
import { createSnapshot } from '../../src/core/settings/parse.js';
import { computeStats } from '../../src/core/stats.js';
import type { ContributionData, Theme, ThemeOptions } from '../../src/core/types.js';
import type { TerrainGeneratorDependencies } from '../../src/generate/types.js';

export function snapshot(year = 2025, count = 3, username = 'testuser') {
  const weeks = [
    { firstDay: `${year}-01-05`, days: [{ date: `${year}-01-08`, count, level: 2 as const }] },
  ];
  return createSnapshot(
    { username, year, weeks, stats: computeStats(weeks) },
    {},
    { kind: 'sample' },
  );
}

export function harness() {
  const render = vi.fn((_data: ContributionData, options: ThemeOptions) => ({
    dark: `<svg xmlns="http://www.w3.org/2000/svg" width="${options.width}" height="${options.height}" viewBox="0 0 ${options.width} ${options.height}"><style>#tile {fill:#fff}</style><title id="title">dark</title><path id="tile" data-asset-id="tile" d="M0 0h10v10z"/></svg>`,
    light: `<svg xmlns="http://www.w3.org/2000/svg" width="${options.width}" height="${options.height}" viewBox="0 0 ${options.width} ${options.height}"><title id="title">light</title><path id="tile" d="M0 0h10v10z"/></svg>`,
  }));
  const theme: Theme = { name: 'custom', displayName: 'Custom', description: 'fixture', render };
  const files = new Map<string, string>();
  const fetchContributions = vi.fn(async (username: string, year = 2025) => {
    const sample = snapshot(year, year === 2024 ? 10 : 3, username);
    const weeks = sample.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => ({ ...day })),
    }));
    return { username, year, weeks, stats: computeStats(weeks) };
  });
  const dependencies: TerrainGeneratorDependencies = {
    fetchContributions,
    getTheme: () => theme,
    getDefaultTheme: () => 'custom',
    listThemes: () => ['custom'],
    makeDirectory: vi.fn(async () => undefined),
    writeFile: vi.fn(async (path, content) => {
      files.set(path, content);
    }),
    writeBinaryFile: vi.fn(async () => undefined),
    renderPng: vi.fn(async () => new Uint8Array([137, 80, 78, 71])),
    readFile: vi.fn(async (path) => {
      const file = files.get(path);
      if (file === undefined) throw new Error(`Fixture file missing: ${path}`);
      return file;
    }),
  };
  return { dependencies, render, files, fetchContributions };
}
