import { readFile } from 'node:fs/promises';
import { parseArchive } from '../core/archive/parse.js';
import { createArchive } from '../core/archive/comparison.js';
import { selectComparisonSnapshots } from '../core/archive/selection.js';
import { createSnapshot, parseSnapshot } from '../core/settings/parse.js';
import { resolveRenderSettings } from '../core/settings/resolve.js';
import { parseBoundary } from '../core/settings/boundary.js';
import { usernameSchema } from '../core/settings/schema.js';
import { loadConfiguration } from '../generate/input.js';
import {
  invalidOption,
  parseGenerationSettings,
  parseGenerationYears,
  parseOutputOptions,
} from '../generate/options.js';
import type { TerrainGeneratorDependencies } from '../generate/types.js';
import type { TerrainArchiveRequest } from './types.js';

export async function resolveArchiveInput(
  request: TerrainArchiveRequest,
  dependencies: TerrainGeneratorDependencies,
) {
  if (typeof request.writeSnapshot === 'string') {
    invalidOption(
      'writeSnapshot',
      'archive snapshots are written inside each year directory; omit the path',
    );
  }
  if (request.year !== undefined && request.year !== '')
    invalidOption('year', 'cannot be combined with years or archive input');
  const { input, snapshots: supplied, ...singleRequest } = request;
  const explicit = parseGenerationSettings(singleRequest, true);
  parseOutputOptions(singleRequest);
  const config = await loadConfiguration(singleRequest, dependencies);
  if (input !== undefined && supplied !== undefined)
    invalidOption('input', 'cannot be combined with snapshots');
  const loaded =
    input === undefined
      ? undefined
      : parseArchive(
          typeof input === 'string'
            ? await (dependencies.readFile ?? ((path) => readFile(path, 'utf-8')))(input)
            : input,
        );
  const snapshots = supplied?.map((snapshot) => parseSnapshot(snapshot)) ?? loaded?.snapshots;
  const years =
    parseGenerationYears(request.years) ??
    loaded?.comparison.years ??
    snapshots?.map((snapshot) => snapshot.year);
  if (years === undefined) invalidOption('years', 'an archive requires 2–5 years');
  const selected = snapshots ? selectComparisonSnapshots(snapshots, years) : undefined;
  const username = request.username?.trim() || selected?.[0]?.username || config?.username;
  if (!username) invalidOption('username', 'GitHub username is required');
  parseBoundary(usernameSchema, username, 'username');
  if (selected?.some((snapshot) => snapshot.username.toLowerCase() !== username.toLowerCase()))
    invalidOption('username', 'does not match archive snapshots');
  const settings = resolveRenderSettings(explicit, config?.settings ?? {}, username);
  const normalization =
    request.normalization === 'shared'
      ? ({ kind: 'relative' } as const)
      : (explicit.normalization ??
        config?.settings.normalization ??
        loaded?.comparison.normalization ??
        settings.normalization);
  const fetched = [];
  if (!selected) {
    for (const year of years) {
      request.onProgress?.(`Fetching contributions for @${username} (${year})...`);
      const data = await dependencies.fetchContributions(
        username,
        year,
        request.token || undefined,
      );
      fetched.push(createSnapshot(data, settings, { kind: 'github' }));
    }
  }
  const archive = createArchive(snapshots ?? fetched, years, normalization);
  return {
    archive,
    explicit,
    config,
    source: normalization.kind === 'fixed' ? 'explicit-fixed' : 'shared-p90',
  };
}
