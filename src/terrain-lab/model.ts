import type { ContributionDay } from '../core/types.js';
import { createHeightField } from './heightfield.js';
import { drainTerrain } from './hydrology.js';
import { buildSurface, createMesh } from './mesh.js';
import { createMoistureField, createSites, findLandmarks, placeDays } from './placement.js';
import type { TerrainModel, TerrainOptions } from './types.js';

export function buildTerrainModel(
  days: readonly ContributionDay[],
  options: TerrainOptions,
): TerrainModel {
  const field = createHeightField(options);
  const { mesh, rivers } = drainTerrain(createMesh(field, options.seed));
  const moisture = createMoistureField(field, rivers);
  const sites = createSites(mesh, moisture);
  return {
    options,
    ...buildSurface(mesh, moisture),
    rivers,
    plots: placeDays(days, sites, options.seed),
    sites,
    ...findLandmarks(sites),
  };
}
