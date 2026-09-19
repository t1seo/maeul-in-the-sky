import type { TerrainScene } from '../../../core/scene-types.js';
import type { ColorMode } from '../../../core/types.js';
import type { TerrainSceneRenderOptions } from './options.js';
import { formatNumber, svgRoot, svgStyle, svgNumber } from '../../../core/svg.js';
import { InputValidationError } from '../../../core/settings/errors.js';
import { resolveRenderSettings } from '../../../core/settings/resolve.js';
import { getSeasonalPalette100, getTerrainPalette100 } from '../palette.js';
import { renderPreparedTerrainBlocks } from '../blocks.js';
import { renderAssetCSS } from '../assets.js';
import { renderEpicGlowDefs, renderEpicCSS } from '../epics.js';
import { renderMotionBranches } from '../motion/index.js';
import { motionId, withMotionContext } from '../../../core/animation.js';
import {
  renderTerrainCSS,
  renderAnimatedOverlays,
  renderClouds,
  renderWaterOverlays,
  renderWaterRipples,
  renderCelestials,
  renderSeasonalParticles,
} from '../effects.js';
import { hash } from '../../../utils/math.js';
import { fitScene, sceneViewport, unionBounds } from './bounds.js';
import { dateSeasonPosition } from './season.js';
import { renderDepthLayer } from './depth.js';
import { renderPresentation } from './presentation.js';
import { renderDailyRewards } from './rewards.js';
import { renderConsistencyEffects } from '../effects/consistency.js';
import { AssetSymbols } from './asset-symbols.js';
import { withSurfaceContext } from './surface-context.js';
import { reserveSurfaceMotion } from '../effects/surface-budget.js';
import { waterfallOutlets } from '../effects/water-topology.js';
import { renderWaterfalls, waterfallBounds } from '../effects/waterfalls.js';

export function renderTerrainScene(
  scene: TerrainScene,
  mode: ColorMode,
  options: TerrainSceneRenderOptions = {},
): string {
  const supported = new Set([
    'width',
    'height',
    'namespace',
    'title',
    'motion',
    'layout',
    'artStyle',
  ]);
  for (const key of Object.keys(options)) {
    if (!supported.has(key))
      throw new InputValidationError([
        { path: key, message: 'Prepare a new terrain scene to change geometry settings' },
      ]);
  }
  const { width, height, namespace: customNamespace, ...overrides } = options;
  for (const [key, value] of [
    ['width', width],
    ['height', height],
  ] as const) {
    if (value !== undefined && (!Number.isFinite(value) || value <= 0)) {
      throw new InputValidationError([
        { path: key, message: 'Expected a positive finite display size' },
      ]);
    }
  }
  const settings = resolveRenderSettings(overrides, scene.settings, scene.username);
  const presented = { ...scene, settings };
  const card = settings.layout === 'card';
  const viewWidth = card ? 420 : 840;
  const viewHeight = card ? 360 : 240;
  const namespace = `${customNamespace ?? `maeul-${hash(JSON.stringify(scene))}`}-${mode}-${settings.layout}`;
  const accessibilityNamespace = withMotionContext({ mode: 'off', namespace }, () =>
    motionId('svg'),
  );
  const reference = getTerrainPalette100(mode);
  const symbols = settings.motion === 'off' ? undefined : new AssetSymbols(accessibilityNamespace);
  const weekCount = scene.cells.length ? Math.max(...scene.cells.map((cell) => cell.week)) + 1 : 1;
  const firstSunday = scene.fromDate
    ? Date.parse(scene.fromDate) - new Date(scene.fromDate).getUTCDay() * 86400000
    : 0;
  const palettes = Array.from({ length: weekCount }, (_, week) => {
    const date = new Date(firstSunday + week * 604800000).toISOString().slice(0, 10);
    return getSeasonalPalette100(mode, 0, dateSeasonPosition(date, settings.hemisphere));
  });
  const isoCells = scene.cells.map((cell) => ({
    ...cell,
    colors: palettes[cell.week].getElevation(cell.level100),
  }));
  const biomes = new Map(scene.biomes.map((entry) => [`${entry.week},${entry.day}`, entry.biome]));
  const outlets =
    settings.artStyle === 'miniature'
      ? waterfallOutlets(isoCells, biomes, settings.hemisphere)
      : [];
  const transform = fitScene(
    unionBounds([scene.bounds, ...waterfallBounds(outlets)]),
    sceneViewport(settings.layout),
  );
  const seed = hash(scene.seed.root);
  const rotation = dateSeasonPosition(scene.fromDate, settings.hemisphere);
  const body = withSurfaceContext(settings, () =>
    renderMotionBranches({ mode: settings.motion, namespace }, () => {
      const townSparkles = scene.layoutVersion < 3;
      const css =
        renderTerrainCSS(isoCells, biomes, townSparkles) + renderAssetCSS() + renderEpicCSS();
      const definitions = scene.wonders.length ? `<defs>${renderEpicGlowDefs(mode)}</defs>` : '';
      const sky =
        renderCelestials(seed, reference, mode === 'dark') + renderClouds(seed, reference);
      const assets =
        renderDepthLayer(scene, isoCells, palettes, settings.artStyle, symbols) +
        renderDailyRewards(presented, palettes);
      const overlays =
        renderAnimatedOverlays(
          settings.artStyle === 'miniature'
            ? isoCells.filter((cell) => cell.level100 < 10 || cell.level100 > 22)
            : isoCells,
          reference,
          townSparkles,
        ) + renderConsistencyEffects(scene.consistencyEffects ?? [], mode);
      reserveSurfaceMotion(sky + assets + overlays, css, isoCells);
      const terrain =
        renderPreparedTerrainBlocks(isoCells, palettes, rotation, biomes, settings.hemisphere) +
        renderWaterOverlays(isoCells, reference, biomes) +
        renderWaterRipples(isoCells, reference, biomes) +
        renderWaterfalls(outlets, reference) +
        assets +
        renderSeasonalParticles(isoCells, seed, reference, rotation) +
        overlays;
      return (
        (css ? svgStyle(css) : '') +
        definitions +
        `<svg x="0" y="0" width="${viewWidth}" height="${card ? 240 : viewHeight}" viewBox="0 0 840 240" aria-hidden="true">${sky}</svg>` +
        `<g class="terrain-fit" transform="translate(${svgNumber(transform.x)} ${svgNumber(transform.y)}) scale(${transform.scale.toFixed(6)})">${terrain}</g>`
      );
    }),
  );
  const description =
    `Isometric contribution terrain for @${scene.username} ${scene.fromDate ? `from ${scene.fromDate} to ${scene.toDate}` : 'with no supplied contribution dates'}. ` +
    `${formatNumber(scene.stats.total)} contributions across ${formatNumber(scene.stats.activeDays)} active days. ` +
    `${scene.wonders.length} wonders discovered. ${scene.normalization.kind} normalization, maximum ${scene.normalization.maxCount}.`;
  const content =
    `<rect width="${viewWidth}" height="${viewHeight}" rx="10" fill="${mode === 'dark' ? '#0d1117' : '#ffffff'}"/>` +
    (symbols?.definitions() ?? '') +
    body +
    renderPresentation(presented, reference);
  return svgRoot(
    {
      width: width ?? viewWidth,
      height: height ?? viewHeight,
      viewBox: `0 0 ${viewWidth} ${viewHeight}`,
      'data-layout': settings.layout,
      'data-scene': scene.seed.root,
      'data-color-mode': mode,
      'data-art-style': settings.artStyle,
    },
    content,
    { title: settings.title, description, namespace: accessibilityNamespace },
  );
}
