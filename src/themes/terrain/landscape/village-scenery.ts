import type { TerrainScene } from '../../../core/scene-types.js';
import type { AssetType } from '../assets/types.js';
import { landscapeHouseLots } from './parcels.js';
import { groundDistance, segmentDistance } from './settlement-geometry.js';
import { isLandscapeBuilding, landscapeFootRadius, landscapeSpriteScale } from './sprite-size.js';
import type {
  LandscapeField,
  LandscapeModel,
  LandscapeRoad,
  LandscapeSprite,
  LandscapeTown,
} from './types.js';

export function villageScenery(
  model: LandscapeModel,
  scene: TerrainScene,
  towns: readonly LandscapeTown[],
  fields: readonly LandscapeField[],
  roads: readonly LandscapeRoad[],
  facts: readonly LandscapeSprite[],
): readonly LandscapeSprite[] {
  const active = scene.cells.filter((cell) => cell.count > 0).length;
  if (!active) return [];
  const result: LandscapeSprite[] = [];
  const buildings = facts.filter(
    (sprite) => sprite.kind === 'wonder' || isLandscapeBuilding(sprite.catalogId),
  );
  const fieldCenters = fields.map((field) => ({
    x: field.points.reduce((sum, point) => sum + point.x, 0) / field.points.length,
    z: field.points.reduce((sum, point) => sum + point.z, 0) / field.points.length,
    elevation: 0,
  }));
  for (const [townIndex, town] of towns.entries()) {
    if (townIndex > 0 && active < 20) continue;
    const target = Math.max(
      2,
      Math.round(
        (townIndex === 0 ? 10 : 6) *
          (0.6 + scene.settings.density * 0.04) *
          Math.min(1, active / 90),
      ),
    );
    const existing = buildings.filter(
      (sprite) => groundDistance(sprite.position, town.center) < 7,
    ).length;
    const candidates = landscapeHouseLots(model, [town]);
    let placed = 0;
    for (const position of candidates) {
      if (placed + existing >= target) break;
      if (
        groundDistance(position, town.center) > 7.2 ||
        fieldCenters.some((center) => groundDistance(center, position) < 3.4)
      )
        continue;
      if (
        [...buildings, ...result].some(
          (sprite) =>
            groundDistance(sprite.position, position) <
            landscapeFootRadius(sprite.catalogId) + 1.08,
        )
      )
        continue;
      if (
        roads.some((road) =>
          road.points.some(
            (point, index) =>
              index > 0 &&
              segmentDistance(position, road.points[index - 1], point) < 1.15 + road.width * 0.5,
          ),
        )
      )
        continue;
      const catalogId: AssetType =
        scene.settings.style === 'korean'
          ? placed === 6
            ? 'pavilion'
            : placed % 3 === 1
              ? 'choga'
              : 'hanok'
          : placed === 6
            ? 'tavern'
            : placed % 2
              ? 'houseB'
              : 'house';
      result.push({
        id: `scenery:${town.id}:home:${placed}`,
        kind: 'scenery',
        catalogId,
        position,
        scale: landscapeSpriteScale(catalogId),
        variant: placed % 3,
      });
      placed++;
    }
    if (
      placed + existing > 0 &&
      buildings.every((sprite) => groundDistance(sprite.position, town.center) > 3)
    ) {
      const catalogId: AssetType = scene.settings.style === 'korean' ? 'onggi' : 'well';
      result.push({
        id: `scenery:${town.id}:square`,
        kind: 'scenery',
        catalogId,
        position: town.center,
        scale: landscapeSpriteScale(catalogId),
        variant: townIndex % 3,
      });
    }
  }
  return result;
}
