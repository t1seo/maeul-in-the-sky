import { entityOnTile } from './assets.js';
import { CIRCLE_SEASONS, circleKey, circleSeason } from './circular-layout.js';
import { hashKey } from './math.js';
import { settlementEntities } from './settlement.js';
import type { WorldGeography } from './terrain.js';
import type {
  WorldDay,
  WorldEntity,
  WorldModelFamily,
  WorldSeason,
  WorldSettings,
  WorldTile,
} from './types.js';

const VEGETATION = {
  spring: [
    ['blossoms', 'cherryBlossom'],
    ['broadleaf', 'deciduous'],
    ['grove', 'birch'],
    ['meadow', 'wildflowerMeadow'],
  ],
  summer: [
    ['grove', 'cedarGrove'],
    ['bamboo', 'bambooThicket'],
    ['broadleaf', 'ancientOak'],
    ['meadow', 'wildflowerMeadow'],
  ],
  autumn: [
    ['broadleaf', 'deciduous'],
    ['grove', 'cedarGrove'],
    ['orchard', 'orchard'],
    ['rocks', 'alpineRocks'],
  ],
  winter: [
    ['conifer', 'snowPine'],
    ['grove', 'cedarGrove'],
    ['conifer', 'pine'],
    ['rocks', 'alpineRocks'],
  ],
} as const satisfies Readonly<
  Record<WorldSeason, readonly (readonly [WorldModelFamily, string])[]>
>;

function footprint(tile: WorldTile): readonly string[] {
  return [-1, 0, 1].flatMap((x) =>
    [-1, 0, 1].map((z) => circleKey({ x: tile.position.x + x, z: tile.position.z + z })),
  );
}

export function circularSettlement(
  geography: WorldGeography,
  days: readonly WorldDay[],
  settings: WorldSettings,
  seed: string,
): { readonly entities: readonly WorldEntity[]; readonly projectTiles: readonly WorldTile[] } {
  const candidates = (geography.projectTiles ?? []).filter((tile) =>
    tile.regionId.endsWith(':nature'),
  );
  const available = new Set(candidates.map((tile) => circleKey(tile.position)));
  const used = new Set<string>();
  const woodland = CIRCLE_SEASONS.map((season) => {
    const ranked = candidates
      .filter((tile) => circleSeason(tile.position) === season)
      .sort(
        (a, b) =>
          hashKey(`${seed}:${a.id}:base`) - hashKey(`${seed}:${b.id}:base`) ||
          a.id.localeCompare(b.id),
      );
    const groves: WorldTile[] = [];
    for (const tile of ranked) {
      const cells = footprint(tile);
      if (!cells.every((key) => available.has(key) && !used.has(key))) continue;
      groves.push(tile);
      for (const key of cells) used.add(key);
      if (groves.length === 6) break;
    }
    return { season, ranked, groves };
  });
  const months = geography.months.map((month) => ({
    ...month,
    reservedTileIds: new Set([
      ...(month.reservedTileIds ?? []),
      ...month.tiles.filter((tile) => used.has(circleKey(tile.position))).map((tile) => tile.id),
    ]),
  }));
  const settlement = settlementEntities(months, days, settings, seed);
  const occupied = new Set(settlement.map((entity) => circleKey(entity.position)));
  const scenery = woodland.flatMap(({ season, ranked, groves }) => {
    const nearGrove = (tile: WorldTile): number =>
      Math.min(
        ...groves.map(
          (grove) =>
            (tile.position.x - grove.position.x) ** 2 + (tile.position.z - grove.position.z) ** 2,
        ),
      );
    const plants = ranked
      .filter(
        (tile) => !used.has(circleKey(tile.position)) && !occupied.has(circleKey(tile.position)),
      )
      .sort((a, b) => nearGrove(a) - nearGrove(b))
      .slice(0, 24 - groves.length);
    for (const tile of plants) used.add(circleKey(tile.position));
    return [...groves, ...plants].map((tile, index) => {
      const hash = hashKey(`${seed}:${tile.id}:vegetation`);
      const large = index < groves.length;
      const choices = VEGETATION[season];
      const [family, catalogId]: readonly [WorldModelFamily, string] = large
        ? choices[index % choices.length]
        : ['conifer', season === 'winter' ? 'snowPine' : 'pine'];
      const entity = entityOnTile(
        `scenery:circle:${tile.position.x}:${tile.position.z}`,
        'scenery',
        tile,
        family,
        '0001-01-01',
        seed,
        { catalogId },
      );
      return {
        ...entity,
        variant: 0,
        modelKey: `${family}:0`,
        scale: large ? { x: 2.4, y: 4.2, z: 2.4 } : { x: 0.85, y: 1.8 + (hash % 3) * 0.2, z: 0.85 },
      };
    });
  });
  return {
    entities: [...settlement, ...scenery],
    projectTiles: (geography.projectTiles ?? []).filter(
      (tile) => !used.has(circleKey(tile.position)),
    ),
  };
}
