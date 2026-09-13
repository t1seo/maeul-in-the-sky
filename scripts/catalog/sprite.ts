import type { ColorMode } from '../../src/core/types.js';
import { getSeasonalPalette100, getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import type { AssetSeason } from '../../src/themes/terrain/assets.js';
import type { GalleryItem } from './gallery-items.js';
import { escapeMarkup } from './markup.js';

const SEASON_WEEKS: Readonly<Record<AssetSeason, number>> = {
  all: 28,
  winter: 0,
  spring: 16,
  summer: 28,
  autumn: 42,
};

export function spriteSymbolId(item: GalleryItem): string {
  return `${item.record.kind}-${item.record.id}`;
}

export function renderCatalogSprite(items: readonly GalleryItem[], mode: ColorMode): string {
  const symbols = items.map((item) => {
    const palette =
      item.record.season === 'all'
        ? getTerrainPalette100(mode)
        : getSeasonalPalette100(mode, SEASON_WEEKS[item.record.season], 0);
    return `<g id="${escapeMarkup(spriteSymbolId(item))}">${item.render(palette.assets)}</g>`;
  });
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:none">` +
    symbols.join('') +
    '</svg>\n'
  );
}
