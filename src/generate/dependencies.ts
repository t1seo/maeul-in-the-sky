import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fetchContributions } from '../api/client.js';
import { getDefaultTheme, getTheme, listThemes } from '../themes/registry.js';
import { renderPng } from '../output/png.js';
import type { TerrainGeneratorDependencies } from './types.js';

export const nodeGeneratorDependencies: TerrainGeneratorDependencies = {
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
  readFile: async (path) => readFile(path, 'utf-8'),
  writeBinaryFile: async (path, content) => {
    await writeFile(path, content);
  },
  renderPng,
};
