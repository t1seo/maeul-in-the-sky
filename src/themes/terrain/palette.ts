import type { ColorMode } from '../../core/types.js';
import { getTerrainPalette100 } from './palette/cache.js';
import type { TerrainPalette } from './palette/types.js';

export { getTerrainPalette100, getSeasonalPalette100 } from './palette/cache.js';
export type { AssetColors } from './palette/asset-colors.js';
export type {
  ElevationColors,
  CloudColors,
  TerrainPalette100,
  TerrainPalette,
} from './palette/types.js';

/** @deprecated Use getTerrainPalette100 instead */
export function getTerrainPalette(mode: ColorMode): TerrainPalette {
  const p100 = getTerrainPalette100(mode);
  return {
    elevations: p100.elevations,
    heights: p100.heights,
    text: p100.text,
    bg: p100.bg,
    cloud: mode === 'dark' ? 'rgba(200,210,220,0.10)' : 'rgba(255,255,255,0.45)',
    assets: p100.assets,
  };
}
