import { escapeXml } from '../../../core/svg.js';
import type { IsoCell } from '../blocks.js';
import type { AssetColors, TerrainPalette100 } from '../palette.js';
import type { BiomeContext } from '../biomes.js';
import type { AssetSelectionOptions, AssetType, PlacedAsset } from './types.js';
import { currentMotionContext, withMotionContext, motionMarkup } from '../../../core/animation.js';
import { ASSET_RENDERERS } from './renderers.js';
import { selectAssets } from './selection.js';

export function renderCatalogAsset(
  type: AssetType,
  colors: AssetColors,
  variant: number = 0,
): string {
  return ASSET_RENDERERS[type](0, 0, colors, variant);
}

export function renderAssetPlacements(
  placed: readonly PlacedAsset[],
  palettes: TerrainPalette100 | readonly TerrainPalette100[],
): string {
  const paletteFor = (week: number): TerrainPalette100 => {
    if ('assets' in palettes) return palettes;
    return palettes[Math.min(week, palettes.length - 1)];
  };
  const context = currentMotionContext();
  const parts = placed.map((asset) => {
    const palette = paletteFor(asset.cell.week);
    const art = withMotionContext({ ...context, mode: asset.animated ? context.mode : 'off' }, () =>
      ASSET_RENDERERS[asset.type](
        asset.cx + asset.ox,
        asset.cy + asset.oy,
        palette.assets,
        asset.variant,
      ),
    );
    return `<g data-asset-id="${escapeXml(asset.id)}" data-catalog-id="${asset.catalogId}" data-date="${escapeXml(asset.date ?? '')}">${art}</g>`;
  });
  return `<g class="terrain-assets">${parts.join('')}</g>`;
}

export function renderTerrainAssets(
  isoCells: IsoCell[],
  seed: number,
  palette: TerrainPalette100,
  variantSeed?: number,
  biomeMap?: Map<string, BiomeContext>,
  density: number = 5,
  options: AssetSelectionOptions = {},
): string {
  return renderAssetPlacements(
    selectAssets(isoCells, seed, variantSeed, biomeMap, undefined, density, undefined, options),
    palette,
  );
}

export function renderSeasonalTerrainAssets(
  isoCells: IsoCell[],
  seed: number,
  weekPalettes: TerrainPalette100[],
  variantSeed?: number,
  biomeMap?: Map<string, BiomeContext>,
  seasonRotation?: number,
  density: number = 5,
  excludeCells?: Set<string>,
  options: AssetSelectionOptions = {},
): string {
  return renderAssetPlacements(
    selectAssets(
      isoCells,
      seed,
      variantSeed,
      biomeMap,
      seasonRotation,
      density,
      excludeCells,
      options,
    ),
    weekPalettes,
  );
}

export function renderAssetCSS(): string {
  return motionMarkup(
    '@keyframes tree-sway { 0% { transform: rotate(-1.5deg); } 50% { transform: rotate(1.5deg); } 100% { transform: rotate(-1.5deg); } }',
  );
}
