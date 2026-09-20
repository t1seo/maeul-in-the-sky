import type { TerrainScene } from '../../../core/scene-types.js';
import type { AssetType } from '../assets/types.js';
import { hash, seededRandom } from '../../../utils/math.js';
import { sampleLandscape } from './sampling.js';
import { villageScenery } from './village-scenery.js';
import { groundDistance, riverDistance } from './settlement-geometry.js';
import { isLandscapeBuilding, landscapeFootRadius, landscapeSpriteScale } from './sprite-size.js';
import type {
  LandscapeField,
  LandscapeModel,
  LandscapeRoad,
  LandscapeSite,
  LandscapeSprite,
  LandscapeTown,
} from './types.js';

function tree(site: LandscapeSite, random: number, korean: boolean): AssetType {
  switch (site.biome) {
    case 'snow':
      return random < 0.75 ? 'snowPine' : 'snowCoveredRock';
    case 'rock':
      return random < 0.7 ? 'pine' : 'alpineRocks';
    case 'wetland':
      return random < 0.55 ? 'willow' : 'reedMarsh';
    case 'dry':
      return random < 0.55 ? 'oliveTree' : 'boulder';
    case 'sand':
      return random < 0.55 ? 'tallGrass' : 'boulder';
    case 'forest':
      return korean && random < 0.25 ? 'bambooThicket' : random < 0.5 ? 'pine' : 'cedarGrove';
    case 'meadow':
      return random < 0.42 ? 'deciduous' : random < 0.7 ? 'birch' : 'ancientOak';
  }
}

export function landscapeScenery(
  model: LandscapeModel,
  scene: TerrainScene,
  towns: readonly LandscapeTown[],
  fields: readonly LandscapeField[],
  facts: readonly LandscapeSprite[],
  roads: readonly LandscapeRoad[],
): readonly LandscapeSprite[] {
  const village = villageScenery(model, scene, towns, fields, roads, facts);
  const random = seededRandom(hash(`forest:${model.options.seed}`));
  const protectedSprites = [...facts, ...village].filter(
    (sprite) => sprite.kind === 'wonder' || isLandscapeBuilding(sprite.catalogId),
  );
  const fieldsCenters = fields.map((field) => ({
    x: field.points.reduce((sum, point) => sum + point.x, 0) / field.points.length,
    z: field.points.reduce((sum, point) => sum + point.z, 0) / field.points.length,
    elevation: 0,
  }));
  const clear = (point: LandscapeSite): boolean =>
    point.elevation > 0.2 &&
    point.slope < 1.6 &&
    riverDistance(model, point) > 0.4 &&
    towns.every((town) => groundDistance(town.center, point) > 8.3) &&
    fieldsCenters.every((center) => groundDistance(center, point) > 3.5) &&
    protectedSprites.every(
      (sprite) =>
        groundDistance(sprite.position, point) > landscapeFootRadius(sprite.catalogId) + 2,
    );
  const centers: LandscapeSite[] = [];
  const candidates = model.sites
    .filter(clear)
    .map((site) => ({ site, score: random() + (site.biome === 'forest' ? 1 : 0) }))
    .sort((a, b) => b.score - a.score);
  for (const { site } of candidates) {
    if (centers.every((center) => groundDistance(center, site) > 7.5)) centers.push(site);
    if (centers.length === 7) break;
  }
  const result: LandscapeSprite[] = [];
  for (const [cluster, center] of centers.entries()) {
    for (let slot = 0; slot < 30; slot++) {
      const chance = random(),
        angle = random() * Math.PI * 2,
        radius = Math.sqrt(random()) * 4.5;
      const variety = random();
      if (chance > 0.18 + scene.settings.density * 0.067) continue;
      const position = sampleLandscape(
        model,
        center.x + Math.cos(angle) * radius,
        center.z + Math.sin(angle) * radius,
      );
      if (
        !position ||
        position.component !== center.component ||
        !clear(position) ||
        result.some((other) => groundDistance(other.position, position) < 0.75)
      )
        continue;
      const catalogId = tree(position, variety, scene.settings.style === 'korean');
      result.push({
        id: `scenery:forest:${cluster}:${slot}`,
        kind: 'scenery',
        catalogId,
        position,
        scale: landscapeSpriteScale(catalogId) * (0.86 + variety * 0.24),
        variant: slot % 3,
      });
    }
  }
  return [...village, ...result];
}
