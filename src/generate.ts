import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { fetchContributions } from './api/client.js';
import {
  DEFAULT_VILLAGE_PRESET,
  isVillagePreset,
  VILLAGE_PRESETS,
  type VillagePreset,
} from './core/presets.js';
import type { Theme } from './core/types.js';
import { getDefaultTheme, getTheme, listThemes } from './themes/registry.js';

export interface TerrainGenerationRequest {
  username: string;
  token?: string;
  theme?: string;
  title?: string;
  outputDir?: string;
  year?: string | number;
  hemisphere?: string;
  preset?: string;
  density?: string | number;
  onProgress?: (message: string) => void;
}

export interface TerrainGenerationResult {
  darkPath: string;
  lightPath: string;
  themeName: string;
  themeDisplayName: string;
  presetName: VillagePreset;
  density: number;
}

interface TerrainGeneratorDependencies {
  fetchContributions: typeof fetchContributions;
  getTheme: (name: string) => Theme | undefined;
  listThemes: () => string[];
  getDefaultTheme: () => string;
  makeDirectory: (path: string) => Promise<void>;
  writeFile: (path: string, content: string) => Promise<void>;
}

function parseOptionalInteger(
  value: string | number | undefined,
  name: string,
): number | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Invalid ${name}: "${value}"`);
  }
  return parsed;
}

function parseYear(value: TerrainGenerationRequest['year']): number | undefined {
  const year = parseOptionalInteger(value, 'year');
  if (year !== undefined && (year < 1 || year > 9999)) {
    throw new Error(`Invalid year: "${value}"`);
  }
  return year;
}

function parseDensity(value: TerrainGenerationRequest['density']): number {
  const density = parseOptionalInteger(value, 'density');
  if (density === undefined) {
    throw new Error('Density must be resolved from a preset before validation');
  }
  if (density < 1 || density > 10) {
    throw new Error(`Invalid density: "${value}". Expected an integer from 1 to 10`);
  }
  return density;
}

function parsePreset(value: TerrainGenerationRequest['preset']): VillagePreset {
  const preset = value?.trim() || DEFAULT_VILLAGE_PRESET;
  if (!isVillagePreset(preset)) {
    throw new Error(
      `Invalid preset: "${value}". Available presets: ${Object.keys(VILLAGE_PRESETS).join(', ')}`,
    );
  }
  return preset;
}

function parseHemisphere(value: TerrainGenerationRequest['hemisphere']): 'north' | 'south' {
  if (value === undefined || value === '') return 'north';
  if (value !== 'north' && value !== 'south') {
    throw new Error(`Invalid hemisphere: "${value}". Expected "north" or "south"`);
  }
  return value;
}

export function createTerrainGenerator(dependencies: TerrainGeneratorDependencies) {
  return async function generateTerrain(
    request: TerrainGenerationRequest,
  ): Promise<TerrainGenerationResult> {
    const username = request.username.trim();
    if (!username) {
      throw new Error('GitHub username is required');
    }

    const themeName = request.theme?.trim() || dependencies.getDefaultTheme();
    const theme = dependencies.getTheme(themeName);
    if (!theme) {
      throw new Error(
        `Unknown theme "${themeName}". Available themes: ${dependencies.listThemes().join(', ')}`,
      );
    }

    const year = parseYear(request.year);
    const hemisphere = parseHemisphere(request.hemisphere);
    const presetName = parsePreset(request.preset);
    const density = parseDensity(
      request.density === undefined || request.density === ''
        ? VILLAGE_PRESETS[presetName].density
        : request.density,
    );
    const title = request.title || `@${username}`;
    const outputDir = request.outputDir?.trim() || './';
    const yearLabel = year ?? 'last 52 weeks';

    request.onProgress?.(`Fetching contributions for @${username} (${yearLabel})...`);
    const data = await dependencies.fetchContributions(username, year, request.token || undefined);

    request.onProgress?.(`Rendering with ${theme.displayName} theme...`);
    const output = theme.render(data, {
      title,
      width: 840,
      height: 240,
      hemisphere,
      density,
    });

    await dependencies.makeDirectory(outputDir);
    const darkPath = join(outputDir, 'maeul-in-the-sky-dark.svg');
    const lightPath = join(outputDir, 'maeul-in-the-sky-light.svg');
    await dependencies.writeFile(darkPath, output.dark);
    await dependencies.writeFile(lightPath, output.light);

    return {
      darkPath,
      lightPath,
      themeName: theme.name,
      themeDisplayName: theme.displayName,
      presetName,
      density,
    };
  };
}

export const generateTerrain = createTerrainGenerator({
  fetchContributions,
  getTheme,
  listThemes,
  getDefaultTheme,
  makeDirectory: async (path) => {
    await mkdir(path, { recursive: true });
  },
  writeFile: async (path, content) => {
    await writeFile(path, content, 'utf-8');
  },
});
