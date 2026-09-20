import type { LandscapeModel, LandscapeOptions } from './types.js';
import { createHeightField } from './heightfield.js';
import { drainLandscape } from './hydrology.js';
import { buildSurface, createMesh } from './mesh.js';
import { createMoistureField, createSites, findLandmarks, placeDays } from './placement.js';

export function buildLandscapeModel(
  days: readonly { readonly date: string; readonly count: number }[],
  options: LandscapeOptions,
): LandscapeModel {
  const field = createHeightField(options);
  const { mesh, rivers } = drainLandscape(createMesh(field, options.seed), options.relief);
  const moisture = createMoistureField(field, rivers);
  const surface = buildSurface(mesh, moisture, options.relief);
  const sites = createSites(mesh, moisture, options.relief);
  return {
    options,
    ...surface,
    rivers,
    sites,
    plots: placeDays(days, surface.triangles, options.seed),
    ...findLandmarks(sites, rivers, options.relief),
  };
}
