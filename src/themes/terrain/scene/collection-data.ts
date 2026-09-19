import type { ConsistencyEffectKind, TerrainScene } from '../../../core/scene-types.js';
import { EPIC_CATALOG, type EpicCatalogEntry } from '../epics/catalog.js';
import type { EpicTier } from '../epics/types.js';

export const COLLECTION_BADGE_LIMIT = 3;
export const COLLECTION_RARITIES = {
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
} as const satisfies Record<EpicTier, string>;

const TIER_ORDER = { legendary: 0, epic: 1, rare: 2 } as const;
const SEASONAL_AURAS = [
  { kind: 'springPetals', name: 'Spring petals', label: 'Petals' },
  { kind: 'summerFireflies', name: 'Summer fireflies', label: 'Fireflies' },
  { kind: 'autumnLeaves', name: 'Autumn leaves', label: 'Leaves' },
  { kind: 'winterFrost', name: 'Winter frost', label: 'Frost' },
] as const;

export type CollectionSeason = {
  readonly kind: ConsistencyEffectKind;
  readonly name: string;
  readonly label: string;
  readonly state: 'discovered' | 'unseen' | 'unrecorded';
};

export type LandscapeCollection = {
  readonly wonders: readonly EpicCatalogEntry[];
  readonly catalogCount: number;
  readonly unseenCount: number;
  readonly seasons: readonly CollectionSeason[];
  readonly seasonsRecorded: boolean;
};

export function landscapeCollection(scene: TerrainScene): LandscapeCollection {
  const placed = new Set(scene.wonders.map((wonder) => wonder.catalogId));
  const wonders = EPIC_CATALOG.filter((entry) => placed.has(entry.id)).sort(
    (left, right) => TIER_ORDER[left.tier] - TIER_ORDER[right.tier],
  );
  const effects = new Set(scene.consistencyEffects?.map((effect) => effect.kind));
  const seasonsRecorded = scene.consistencyEffects !== undefined;
  return {
    wonders,
    catalogCount: EPIC_CATALOG.length,
    unseenCount: EPIC_CATALOG.length - wonders.length,
    seasonsRecorded,
    seasons: SEASONAL_AURAS.map((season) => ({
      ...season,
      state: !seasonsRecorded ? 'unrecorded' : effects.has(season.kind) ? 'discovered' : 'unseen',
    })),
  };
}

export function collectionDescription(scene: TerrainScene): string {
  const collection = landscapeCollection(scene);
  const names = collection.wonders
    .map((entry) => `${entry.displayName} (${COLLECTION_RARITIES[entry.tier]})`)
    .join('; ');
  const seasons = collection.seasons
    .filter((season) => season.state === 'discovered')
    .map((season) => season.name);
  const auras = collection.seasonsRecorded
    ? `Seasonal auras in this landscape: ${seasons.length ? seasons.join('; ') : 'none'}.`
    : 'Seasonal auras not recorded in this landscape.';
  return (
    `Village collection. In this landscape: ${collection.wonders.length} unique Wonders. ` +
    `${collection.catalogCount} catalog types; ${collection.unseenCount} not seen here. ` +
    `${names ? `Discovered: ${names}. ` : 'No Wonders discovered here. '}${auras}`
  );
}
