import type { TerrainScene } from '../../../core/scene-types.js';
import type { ColorMode } from '../../../core/types.js';
import type { TerrainSceneRenderOptions } from '../scene/options.js';
import { currentMotionContext, motionId, withMotionContext } from '../../../core/animation.js';
import { resolveDisplaySize } from '../../../core/display-size.js';
import { resolveRenderSettings } from '../../../core/settings/resolve.js';
import { InputValidationError } from '../../../core/settings/errors.js';
import { escapeXml, formatNumber, svgRoot, svgStyle } from '../../../core/svg.js';
import { hash } from '../../../utils/math.js';
import { renderMotionBranches } from '../motion/index.js';
import { renderConsistencyEffects } from '../effects/consistency.js';
import { createLandscapeProjection, number, type Projection } from './projection.js';
import { landscapePalette } from './palette.js';
import { landscapeBackdrop, landscapePresentation } from './presentation.js';
import { coastalWater, surfaceItems } from './surface.js';
import { waterItems } from './water.js';
import { groundItems } from './ground.js';
import { spriteItems } from './sprites.js';
import type { LandscapeModel } from './types.js';

function dateMarkers(model: LandscapeModel, projection: Projection): string {
  const id = motionId('dates');
  const css = `#${id} [data-date]{outline:none}#${id} [data-date]:hover .date-outline,#${id} [data-date]:focus .date-outline{stroke-opacity:1;fill-opacity:.15}`;
  const markers = model.plots
    .map((plot) => {
      const point = projection.point(plot.position),
        date = escapeXml(plot.date);
      const label = `${date} · ${plot.count} contributions`;
      return `<g data-date="${date}" data-count="${plot.count}" transform="translate(${number(point.x)} ${number(point.y)})" aria-label="${label}"><title>${label}</title><ellipse rx="7" ry="4.5" fill="transparent"/><ellipse class="date-outline" rx="8" ry="4.5" fill="#fff3c7" fill-opacity="0" stroke="#f7da89" stroke-width="1.5" stroke-opacity="0"/></g>`;
    })
    .join('');
  return `<g class="terrain-blocks" id="${id}">${svgStyle(css)}${markers}</g>`;
}

function validateOptions(options: TerrainSceneRenderOptions): void {
  const supported = new Set([
    'width',
    'height',
    'namespace',
    'title',
    'motion',
    'layout',
    'artStyle',
  ]);
  for (const key of Object.keys(options))
    if (!supported.has(key)) {
      throw new InputValidationError([
        { path: key, message: 'Prepare a new terrain scene to change geometry settings' },
      ]);
    }
  for (const [key, value] of [
    ['width', options.width],
    ['height', options.height],
  ] as const) {
    if (value !== undefined && (!Number.isFinite(value) || value <= 0)) {
      throw new InputValidationError([
        { path: key, message: 'Expected a positive finite display size' },
      ]);
    }
  }
}

export function renderLandscapeScene(
  scene: TerrainScene,
  mode: ColorMode,
  options: TerrainSceneRenderOptions = {},
): string {
  validateOptions(options);
  const geography = scene.geography;
  if (!geography)
    throw new InputValidationError([
      { path: 'geography', message: 'Expected prepared landscape geography' },
    ]);
  const { width, height, namespace: customNamespace, ...overrides } = options;
  const settings = resolveRenderSettings(
    { ...overrides, terrainMode: 'landscape' },
    scene.settings,
    scene.username,
  );
  const presented = { ...scene, settings };
  const display = resolveDisplaySize(settings);
  const namespace = `${customNamespace ?? `maeul-${hash(JSON.stringify(scene))}`}-${mode}-${settings.layout}-landscape`;
  const context = { mode: settings.motion, namespace };
  const accessibility = withMotionContext(context, () => motionId('svg'));
  const palette = landscapePalette(mode);
  const projection = createLandscapeProjection(geography.model);
  const content = withMotionContext(context, () => {
    const items = [
      ...surfaceItems(geography.model, projection, palette),
      ...waterItems(geography.model, projection, palette),
      ...groundItems(geography.settlement, projection, palette),
      ...spriteItems(geography.settlement.sprites, presented, mode, projection),
    ].sort((a, b) => a.depth - b.depth || a.layer - b.layer);
    const effects = scene.consistencyEffects?.length
      ? renderMotionBranches(
          { ...currentMotionContext(), namespace: `${namespace}-consistency` },
          () => renderConsistencyEffects(scene.consistencyEffects ?? [], mode),
        )
      : '';
    const mapTransform =
      settings.layout === 'card' ? 'translate(0 100) scale(.7)' : 'translate(0 0)';
    const artwork = `<g class="landscape-map" transform="${mapTransform}"><ellipse cx="600" cy="685" rx="360" ry="30" fill="${palette.cliff}" opacity=".055"/>${coastalWater(geography.model, projection, palette)}<g class="landscape-geography">${items.map((item) => item.markup).join('')}</g>${effects}${dateMarkers(geography.model, projection)}</g>`;
    return (
      landscapeBackdrop(display.width, palette) +
      artwork +
      landscapePresentation(presented, palette, display.width)
    );
  });
  const description = `Geographic contribution terrain for @${scene.username} ${scene.fromDate ? `from ${scene.fromDate} to ${scene.toDate}` : 'with no supplied contribution dates'}. ${formatNumber(scene.stats.total)} contributions across ${formatNumber(scene.stats.activeDays)} active days. ${scene.wonders.length} wonders discovered. Height describes geography; dated assets reflect contributions. All supplied dates, including observed zeros, remain inspectable.`;
  return svgRoot(
    {
      width: width ?? display.width,
      height: height ?? display.height,
      viewBox: `0 0 ${display.width} ${display.height}`,
      'data-layout': settings.layout,
      'data-landscape-layout': geography.model.options.layout,
      'data-terrain-mode': 'landscape',
      'data-scene': scene.seed.root,
      'data-color-mode': mode,
      'data-art-style': settings.artStyle,
    },
    content,
    { title: settings.title, description, namespace: accessibility },
  );
}
