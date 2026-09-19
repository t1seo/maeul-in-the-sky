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
  return scene.normalization.kind === 'fixed' ? 'Fixed scale' : 'Relative scale';
}

function renderHeightBars(palette: TerrainPalette100, layout: TerrainLayout): string {
  const card = layout === 'card';
  const startX = 24;
  const baseline = card ? 340 : 83;
  const slotWidth = card ? 64 : 34;
  const width = card ? 32 : 18;
  const gap = card ? 13 : 5;
  const labelY = card ? 354 : 97;
  return LEGEND_BINS.map((bin, index) => {
    const x = startX + index * (slotWidth + gap) + (slotWidth - width) / 2;
    const height = 2 + Math.round((bin.level / 99) * 14);
    return (
      svgElement('rect', {
        class: 'height-legend-swatch',
        x,
        y: baseline - height,
        width,
        height,
        rx: 1,
        fill: palette.text.secondary,
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
    'Five increasing bars represent terrain height. Terrain colors follow the seasons.';
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
      renderHeightBars(palette, scene.settings.layout) +
      (card
        ? ''
        : svgText(24, 114, visibleScale, {
            'font-family': FONT,
            'font-size': 9,
            fill: palette.text.secondary,
          })),
  );
}
