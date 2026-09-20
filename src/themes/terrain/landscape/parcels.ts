import type { ScenePlacement, TerrainScene } from '../../../core/scene-types.js';
import { hash } from '../../../utils/math.js';
import { getAssetCatalogEntry, isAssetType } from '../assets/catalog.js';
import { sampleLandscape } from './sampling.js';
import { groundDistance } from './settlement-geometry.js';
import { createParcelClearance, landSuitability, nearestSite } from './parcel-index.js';
import { isLandscapeBuilding, landscapeFootRadius, landscapeSpriteScale } from './sprite-size.js';
import type { LandscapeModel, LandscapeSite, LandscapeSprite, LandscapeTown } from './types.js';

export function landscapeHouseLots(
  model: LandscapeModel,
  towns: readonly LandscapeTown[],
): readonly LandscapeSite[] {
  const land = landSuitability(model);
  return towns.flatMap((town) => {
    const candidates: LandscapeSite[] = [];
    for (let x = -3; x <= 3; x++) {
      for (let z = -3; z <= 3; z++) {
        if (x === 0 || z === 0) continue;
        const point = sampleLandscape(model, town.center.x + x * 2.2, town.center.z + z * 2.2);
        if (point && point.component === town.center.component && land.buildable(point, 1.2))
          candidates.push(point);
      }
    }
    return candidates.sort(
      (a, b) => groundDistance(a, town.center) - groundDistance(b, town.center),
    );
  });
}

function sprite(
  item: ScenePlacement,
  kind: LandscapeSprite['kind'],
  position: LandscapeSite,
): LandscapeSprite {
  return {
    id: item.id,
    catalogId: item.catalogId,
    kind,
    anchorDate: item.anchorDate,
    position,
    scale: landscapeSpriteScale(item.catalogId),
    variant: item.variant,
  };
}

export function placeLandscapeFacts(
  model: LandscapeModel,
  scene: TerrainScene,
  towns: readonly LandscapeTown[],
): readonly LandscapeSprite[] {
  const anchors = new Map(model.plots.map((plot) => [plot.date, plot.position]));
  const result: LandscapeSprite[] = [];
  const land = landSuitability(model);
  const occupied = createParcelClearance();
  const lots = landscapeHouseLots(model, towns);
  const exhausted = new Set<string>();
  const habitats = new Map<string, readonly LandscapeSite[]>();
  const place = (item: ScenePlacement, kind: LandscapeSprite['kind']): void => {
    const anchor = anchors.get(item.anchorDate);
    if (!anchor) return;
    let position = anchor;
    const radius = landscapeFootRadius(item.catalogId);
    if (kind === 'wonder') {
      const chosen = nearestSite(land.buildingSites(radius, anchor.component), anchor, (point) =>
        occupied.available(point, radius + 1.5),
      );
      position = chosen ?? anchor;
      occupied.reserve(position, radius + 1.5);
    } else if (isLandscapeBuilding(item.catalogId)) {
      const home = towns[hash(item.anchorDate) % towns.length]?.center ?? anchor;
      const pool = `${radius}:${home.component}`;
      if (!exhausted.has(pool)) {
        const free = (point: LandscapeSite): boolean =>
          point.component === home.component && occupied.available(point, radius);
        const chosen =
          nearestSite(lots, home, free) ??
          nearestSite(land.buildingSites(radius, home.component), home, free);
        if (chosen) {
          position = chosen;
          occupied.reserve(position, radius);
        } else exhausted.add(pool);
      }
    } else if (kind !== 'reward') {
      const water =
        isAssetType(item.catalogId) && getAssetCatalogEntry(item.catalogId).category === 'water';
      if (water || land.riverClearance(anchor) <= 0.35 || !occupied.available(anchor, radius)) {
        const key = `${anchor.component}:${water}:${radius}:${occupied.version()}`;
        let candidates = habitats.get(key);
        const habitat = land.habitatSites(anchor.component, water);
        if (!candidates) {
          candidates = habitat.filter((point) => occupied.available(point, water ? 0.3 : radius));
          habitats.set(key, candidates);
        }
        position = nearestSite(candidates, anchor) ?? nearestSite(habitat, anchor) ?? anchor;
      }
    }
    result.push(sprite(item, kind, position));
  };
  for (const item of scene.wonders) place(item, 'wonder');
  const assets = [...scene.placements].sort(
    (a, b) =>
      Number(Boolean(b.primary)) - Number(Boolean(a.primary)) ||
      Number(isLandscapeBuilding(b.catalogId)) - Number(isLandscapeBuilding(a.catalogId)) ||
      a.id.localeCompare(b.id),
  );
  for (const item of assets) place(item, 'asset');
  for (const item of scene.rewards ?? []) place(item, 'reward');
  return result;
}
