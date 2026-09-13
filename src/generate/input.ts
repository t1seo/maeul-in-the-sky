import { readFile } from 'node:fs/promises';
import type { SettingsV1, SnapshotV1 } from '../core/snapshot-types.js';
import { parseSettings, parseSnapshot } from '../core/settings/parse.js';
import { parseBoundary } from '../core/settings/boundary.js';
import { usernameSchema } from '../core/settings/schema.js';
import { resolveRenderSettings } from '../core/settings/resolve.js';
import {
  invalidOption,
  parseGenerationSettings,
  parseGenerationYear,
  parseOutputOptions,
} from './options.js';
import type { TerrainGenerationRequest, TerrainGeneratorDependencies } from './types.js';

export async function loadConfiguration(
  request: TerrainGenerationRequest,
  dependencies: TerrainGeneratorDependencies,
): Promise<SettingsV1 | undefined> {
  if (request.config === undefined) return undefined;
  return parseSettings(
    typeof request.config === 'string'
      ? await (dependencies.readFile ?? ((path) => readFile(path, 'utf-8')))(request.config)
      : request.config,
  );
}

export async function loadSnapshot(
  request: TerrainGenerationRequest,
  dependencies: TerrainGeneratorDependencies,
): Promise<SnapshotV1 | undefined> {
  if (request.input === undefined) return undefined;
  return parseSnapshot(
    typeof request.input === 'string'
      ? await (dependencies.readFile ?? ((path) => readFile(path, 'utf-8')))(request.input)
      : request.input,
  );
}

export async function resolveGenerationInput(
  request: TerrainGenerationRequest,
  dependencies: TerrainGeneratorDependencies,
) {
  if (request.years !== undefined && request.years !== '')
    invalidOption('years', 'use generateArchive for multiple years');
  const explicit = parseGenerationSettings(request);
  const output = parseOutputOptions(request);
  const config = await loadConfiguration(request, dependencies);
  const snapshot = await loadSnapshot(request, dependencies);
  const username = request.username?.trim() || snapshot?.username || config?.username;
  if (!username) invalidOption('username', 'GitHub username is required');
  parseBoundary(usernameSchema, username, 'username');
  if (snapshot && snapshot.username.toLowerCase() !== username.toLowerCase())
    invalidOption('username', 'does not match the input snapshot');
  const year = parseGenerationYear(request.year) ?? snapshot?.year ?? config?.year;
  if (snapshot && year !== snapshot.year)
    invalidOption('year', 'does not match the input snapshot');
  const settings = resolveRenderSettings(
    explicit,
    config?.settings ?? snapshot?.settings ?? {},
    username,
  );
  const advanced =
    snapshot !== undefined ||
    config !== undefined ||
    [
      request.motion,
      request.layout,
      request.style,
      request.villageStyle,
      request.normalization,
      request.layoutSeed,
    ].some((value) => value !== undefined && value !== '');
  return { username, year, settings, snapshot, advanced, ...output };
}
