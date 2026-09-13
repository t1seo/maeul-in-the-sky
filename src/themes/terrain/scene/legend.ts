import type { TerrainLayout } from '../../../core/render-options.js';
import type { TerrainScene } from '../../../core/scene-types.js';
import { formatNumber, svgElement, svgText } from '../../../core/svg.js';
import type { TerrainPalette100 } from '../palette.js';

const FONT = "'Segoe UI', system-ui, sans-serif";
const LEGEND_BINS = [
  { label: 'Empty', level: 0 },
  { label: 'Low', level: 20 },
  { label: 'Mid', level: 45 },
  { label: 'High', level: 70 },
  { label: 'Max', level: 99 },
] as const;

function scaleName(scene: TerrainScene): string {
  return scene.normalization.kind === 'fixed' ? 'Fixed scale' : 'Relative P90 scale';
}

function renderSwatches(palette: TerrainPalette100, layout: TerrainLayout): string {
  const card = layout === 'card';
  const startX = 24;
  const y = card ? 327 : 69;
  const width = card ? 64 : 34;
  const gap = card ? 13 : 5;
  const labelY = card ? 354 : 94;
  return LEGEND_BINS.map((bin, index) => {
    const x = startX + index * (width + gap);
    return (
      svgElement('rect', {
        class: 'height-legend-swatch',
        x,
        y,
        width,
        height: card ? 11 : 10,
        rx: 2,
        fill: palette.getElevation(bin.level).top,
        stroke: palette.text.secondary,
        'stroke-opacity': 0.38,
        'stroke-width': 0.6,
        'data-level': bin.level,
        'data-bin': bin.label.toLowerCase(),
        role: 'img',
        'aria-label':
          `${bin.label} contribution height; ` + `representative elevation ${bin.level} of 99`,
      }) +
      svgText(x + width / 2, labelY, bin.label, {
        'font-family': FONT,
        'font-size': card ? 9 : 8,
        'text-anchor': 'middle',
        fill: palette.text.secondary,
      })
    );
  }).join('');
}

export function renderHeightLegend(scene: TerrainScene, palette: TerrainPalette100): string {
  const card = scene.settings.layout === 'card';
  const scale = scaleName(scene);
  const maximum = formatNumber(scene.normalization.maxCount);
  const ariaLabel =
    `Contribution height legend. ${scale} from 0 to ${maximum} contributions. ` +
    'Five palette bins from low to high.';
  const heading = card
    ? `Height · Low → High · ${scale} 0–${maximum}`
    : 'Contribution height · Low → High';
  const visibleScale = `${scale} · 0–${maximum} contributions`;
  return svgElement(
    'g',
    { class: 'height-legend', role: 'group', 'aria-label': ariaLabel },
    svgText(24, card ? 318 : 59, heading, {
      'font-family': FONT,
      'font-size': card ? 10 : 11,
      'font-weight': 600,
      fill: palette.text.primary,
    }) +
      renderSwatches(palette, scene.settings.layout) +
      (card
        ? ''
        : svgText(24, 111, visibleScale, {
            'font-family': FONT,
            'font-size': 9,
            fill: palette.text.secondary,
          })),
  );
}
