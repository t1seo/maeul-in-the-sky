import type { SceneBounds, ScenePlacement, SceneScenery } from '../../../core/scene-types.js';
import { isAssetType } from '../assets/catalog.js';
import { ASSET_BOUNDS } from '../assets/bounds.js';
import { isEpicBuildingType } from '../epics/catalog.js';
import { EPIC_BOUNDS } from '../epics/bounds.js';
import type { LandscapeSprite } from './types.js';
import type { Projection } from './projection.js';

export function projectedSprite(sprite: LandscapeSprite, projection: Projection): SceneScenery {
  const local =
    sprite.kind === 'reward'
      ? { x: -3.6, y: 2, width: 7.2, height: 3 }
      : isAssetType(sprite.catalogId)
        ? ASSET_BOUNDS[sprite.catalogId]
        : isEpicBuildingType(sprite.catalogId)
          ? EPIC_BOUNDS[sprite.catalogId]
          : undefined;
  if (!local) throw new Error(`Unknown landscape sprite: ${sprite.catalogId}`);
  const { x: cx, y: cy } = projection.point(sprite.position);
  const scale = sprite.scale * projection.scale;
  const footprint: SceneBounds = {
    x: cx + local.x * scale,
    y: cy + local.y * scale,
    width: local.width * scale,
    height: local.height * scale,
  };
  return { id: sprite.id, catalogId: sprite.catalogId, cx, cy, footprint };
}

export function reprojectPlacement<T extends ScenePlacement>(
  placement: T,
  sprites: ReadonlyMap<string, LandscapeSprite>,
  projection: Projection,
): T {
  const sprite = sprites.get(placement.id);
  if (!sprite) throw new Error(`Missing landscape placement: ${placement.id}`);
  return {
    ...placement,
    ...projectedSprite(sprite, projection),
    drawOrder: sprite.position.x + sprite.position.z,
  };
}
