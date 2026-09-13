import type { ContributionData, Theme } from '../../core/types.js';
import type { TerrainRenderResult } from '../../core/scene-types.js';
import type { TerrainRenderOptions } from './scene/options.js';
import { prepareTerrainScene } from './scene/prepare.js';
import { renderTerrainScene } from './scene/render.js';
import { terrainMetadata } from './scene/metadata.js';

export { prepareTerrainScene } from './scene/prepare.js';
export { renderTerrainScene } from './scene/render.js';
export type { TerrainRenderOptions, TerrainSceneRenderOptions } from './scene/options.js';

export function renderTerrain(
  data: ContributionData,
  options: TerrainRenderOptions = {},
): TerrainRenderResult {
  const scene = prepareTerrainScene(data, options);
  const display = { width: options.width, height: options.height, namespace: options.namespace };
  return {
    dark: renderTerrainScene(scene, 'dark', display),
    light: renderTerrainScene(scene, 'light', display),
    metadata: terrainMetadata(scene),
  };
}

export const terrainTheme: Theme = {
  name: 'terrain',
  displayName: 'Terrain',
  description: 'Your contributions build a living world with forests, homes and Wonders',
  render(data, options) {
    const { dark, light } = renderTerrain(data, options);
    return { dark, light };
  },
};
