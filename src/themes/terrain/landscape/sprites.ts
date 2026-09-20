import { currentMotionContext, motionId, withMotionContext } from '../../../core/animation.js';
import type { SceneDailyReward, TerrainScene } from '../../../core/scene-types.js';
import type { ColorMode } from '../../../core/types.js';
import { escapeXml, svgStyle } from '../../../core/svg.js';
import { InputValidationError } from '../../../core/settings/errors.js';
import { isAssetType } from '../assets/catalog.js';
import { ASSET_BOUNDS } from '../assets/bounds.js';
import { renderCatalogAsset } from '../assets/rendering.js';
import { isEpicBuildingType } from '../epics/catalog.js';
import { EPIC_BOUNDS } from '../epics/bounds.js';
import { renderCatalogEpic } from '../epics/rendering.js';
import { renderMotionBranches } from '../motion/index.js';
import { getSeasonalPalette100, getTerrainPalette100 } from '../palette.js';
import { dateSeasonPosition } from '../scene/season.js';
import { renderDailyRewards } from '../scene/rewards.js';
import type { LandscapeSprite } from './types.js';
import { depth, number, type DrawItem, type Projection } from './projection.js';
import { createLandscapeMotionBudget } from './motion.js';

const ANIMATED_ASSETS = new Set([
  'windmill',
  'koreanWatermill',
  'windmillGrand',
  'blacksmith',
  'campfire',
  'laundry',
  'sakuraEternal',
  'worldTree',
  'ancientPortal',
  'aurora',
  'bioluminescentPool',
]);

function spriteArt(
  sprite: LandscapeSprite,
  scene: TerrainScene,
  mode: ColorMode,
  reward?: SceneDailyReward,
): string {
  const palette = sprite.anchorDate
    ? getSeasonalPalette100(
        mode,
        0,
        dateSeasonPosition(sprite.anchorDate, scene.settings.hemisphere),
      )
    : getTerrainPalette100(mode);
  if (sprite.kind === 'reward') {
    if (!reward)
      throw new InputValidationError([
        { path: 'geography.settlement.sprites', message: `Missing daily reward ${sprite.id}` },
      ]);
    return renderDailyRewards({ ...scene, rewards: [{ ...reward, cx: 0, cy: 0 }] }, palette);
  }
  const colors = palette.assets;
  if (isAssetType(sprite.catalogId))
    return renderCatalogAsset(sprite.catalogId, colors, sprite.variant, scene.settings.artStyle);
  if (isEpicBuildingType(sprite.catalogId))
    return renderCatalogEpic(sprite.catalogId, colors, scene.settings.artStyle);
  throw new InputValidationError([
    { path: 'geography.settlement.sprites', message: `Unknown catalog ID ${sprite.catalogId}` },
  ]);
}

function activeSprite(sprite: LandscapeSprite, scene: TerrainScene, mode: ColorMode): string {
  const art = spriteArt(sprite, scene, mode);
  if (currentMotionContext().mode !== 'full') return art;
  const id = motionId('sprite'),
    pulse = motionId('pulse'),
    sway = motionId('sway'),
    swirl = motionId('swirl');
  const css = `@keyframes ${pulse}{0%,100%{opacity:.45}50%{opacity:.9}}@keyframes ${sway}{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1deg)}}@keyframes ${swirl}{to{transform:rotate(360deg)}}#${id} .epic-glow-pulse{animation:${pulse} 4s ease-in-out infinite}#${id} .epic-portal-swirl{animation:${swirl} 10s linear infinite;transform-origin:center}#${id} .sway-gentle,#${id} .sway-slow{animation:${sway} 6s ease-in-out infinite;transform-origin:bottom}`;
  return `<g id="${id}">${svgStyle(css)}${art}</g>`;
}

export function spriteItems(
  sprites: readonly LandscapeSprite[],
  scene: TerrainScene,
  mode: ColorMode,
  projection: Projection,
): readonly DrawItem[] {
  const context = currentMotionContext();
  const rewards = new Map(scene.rewards?.map((reward) => [reward.id, reward]));
  const budget = createLandscapeMotionBudget();
  return sprites.map((sprite) => {
    const bounds =
      sprite.kind === 'reward'
        ? { x: -3.6, y: 2, width: 7.2, height: 3 }
        : isAssetType(sprite.catalogId)
          ? ASSET_BOUNDS[sprite.catalogId]
          : isEpicBuildingType(sprite.catalogId)
            ? EPIC_BOUNDS[sprite.catalogId]
            : undefined;
    if (!bounds)
      throw new InputValidationError([
        { path: 'geography.settlement.sprites', message: `Unknown catalog ID ${sprite.catalogId}` },
      ]);
    const position = projection.point(sprite.position),
      scale = sprite.scale * projection.scale;
    const namespace = `${context.namespace}-sprite-${sprite.id}`;
    const moving =
      context.mode === 'full' &&
      ANIMATED_ASSETS.has(sprite.catalogId) &&
      budget.reserve(
        sprite.catalogId,
        withMotionContext({ ...context, namespace }, () => spriteArt(sprite, scene, mode)),
      );
    const art = moving
      ? renderMotionBranches({ ...context, namespace }, () => activeSprite(sprite, scene, mode))
      : withMotionContext({ mode: 'off', namespace }, () =>
          spriteArt(sprite, scene, mode, rewards.get(sprite.id)),
        );
    const kindAttribute =
      sprite.kind === 'wonder'
        ? 'data-wonder-id'
        : sprite.kind === 'reward'
          ? 'data-landscape-reward'
          : sprite.kind === 'scenery'
            ? 'data-scenery-id'
            : 'data-asset-id';
    const date = sprite.anchorDate ? ` data-date="${escapeXml(sprite.anchorDate)}"` : '';
    return {
      depth:
        depth(sprite.position) +
        (Math.max(0, bounds.y + bounds.height) * sprite.scale) / 5.5 +
        1.25,
      layer: 4,
      markup: `<g ${kindAttribute}="${escapeXml(sprite.id)}" data-catalog-id="${escapeXml(sprite.catalogId)}"${date} transform="translate(${number(position.x)} ${number(position.y)}) scale(${number(scale)})">${sprite.kind === 'reward' ? '' : `<ellipse cx=".5" cy=".4" rx="${number(bounds.width * 0.31)}" ry="${number(bounds.width * 0.09)}" fill="#273d34" opacity=".14"/>`}${art}</g>`,
    };
  });
}
