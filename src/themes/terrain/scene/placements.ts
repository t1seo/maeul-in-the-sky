import type { ScenePlacement, SceneCell } from '../../../core/scene-types.js';
import type { PlacedAsset, AssetType } from '../assets.js';
import { getAssetCatalogEntry } from '../assets/catalog.js';
import { hash, seededRandom } from '../../../utils/math.js';
import { dateSeasonZone } from './season.js';
import type { ResolvedRenderSettings } from '../../../core/render-options.js';
import type { BiomeContext } from '../biomes.js';

export function assetScenePlacement(placed: PlacedAsset): ScenePlacement {
  const bounds = getAssetCatalogEntry(placed.type).bounds;
  const cx = placed.cx + placed.ox;
  const cy = placed.cy + placed.oy;
  return {
    id: placed.id,
    catalogId: placed.catalogId,
    anchorDate: placed.date ?? '',
    week: placed.cell.week,
    day: placed.cell.day,
    cx,
    cy,
    footprint: { ...bounds, x: cx + bounds.x, y: cy + bounds.y },
    drawOrder: placed.cell.week + placed.cell.day,
    variant: placed.variant,
    animated: placed.animated,
  };
}

export function gardenPlacements(
  cells: readonly SceneCell[],
  seed: number,
  settings: ResolvedRenderSettings,
  biomes: ReadonlyMap<string, BiomeContext>,
): ScenePlacement[] {
  return cells
    .filter((cell) => cell.count === 0)
    .flatMap((cell) => {
      const rng = seededRandom(hash(`${seed}:${cell.date}:garden`));
      if (rng() > 0.28) return [];
      const biome = biomes.get(`${cell.week},${cell.day}`);
      const winter = dateSeasonZone(cell.date, settings.hemisphere) === 0;
      const types: readonly AssetType[] =
        biome?.isRiver || biome?.isPond
          ? winter
            ? ['snowCoveredRock']
            : ['pondLily', 'reeds']
          : winter
            ? ['snowdrift', 'bareBush', 'snowCoveredRock']
            : ['flower', 'rock', 'bush', 'wildflowerPatch'];
      const type = types[Math.floor(rng() * types.length)];
      const bounds = getAssetCatalogEntry(type).bounds;
      const cx = cell.isoX + (rng() - 0.5) * 2;
      const cy = cell.isoY + (rng() - 0.5);
      return [
        {
          id: `garden-${cell.date}`,
          catalogId: type,
          anchorDate: cell.date,
          week: cell.week,
          day: cell.day,
          cx,
          cy,
          footprint: { ...bounds, x: cx + bounds.x, y: cy + bounds.y },
          drawOrder: cell.week + cell.day,
          variant: Math.floor(rng() * 3),
          animated: false,
          decorative: true,
        },
      ];
    });
}
