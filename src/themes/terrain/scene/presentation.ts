import type { TerrainScene } from '../../../core/scene-types.js';
import type { ThemePalette } from '../../../core/types.js';
import type { TerrainPalette100 } from '../palette.js';
import { formatNumber, svgText } from '../../../core/svg.js';
import { renderTitle, renderSubtitle, renderStatsBar } from '../../shared.js';
import { renderCalendarTimeline } from './calendar-timeline.js';
import { renderHeightLegend } from './legend.js';

const FONT = "'Segoe UI', system-ui, sans-serif";

function bridge(palette: TerrainPalette100): ThemePalette {
  const color = (level: number) => ({
    hex: palette.getElevation(level).top,
    opacity: level ? 1 : 0.5,
  });
  return {
    text: palette.text,
    background: palette.bg,
    contribution: { levels: [color(0), color(20), color(45), color(70), color(95)] },
  };
}

export function renderPresentation(scene: TerrainScene, palette: TerrainPalette100): string {
  const themePalette = bridge(palette);
  const card = scene.settings.layout === 'card';
  const font = { 'font-family': FONT, fill: palette.text.primary };
  const compactTitle =
    scene.settings.title.length > 44
      ? `${scene.settings.title.slice(0, 43)}…`
      : scene.settings.title;
  const range = scene.fromDate
    ? `${scene.fromDate} to ${scene.toDate}`
    : 'No contribution dates supplied';
  const sparseNote =
    scene.stats.total === 0 && scene.cells.length ? 'Garden decorations · 0 contributions' : '';
  if (!card) {
    return (
      renderTitle(compactTitle, themePalette) +
      renderSubtitle(scene.stats, scene.wonders.length, themePalette) +
      renderStatsBar(scene.stats, themePalette) +
      renderHeightLegend(scene, palette) +
      renderCalendarTimeline(scene, palette) +
      (sparseNote ? svgText(24, 148, sparseNote, { ...font, 'font-size': 10 }) : '') +
      (!scene.cells.length ? svgText(24, 148, range, { ...font, 'font-size': 10 }) : '')
    );
  }
  const stats = [
    { value: formatNumber(scene.stats.total), label: 'Contributions', x: 24 },
    { value: formatNumber(scene.stats.activeDays), label: 'Active days', x: 163 },
    { value: `${scene.stats.longestStreak}d`, label: 'Best streak', x: 292 },
  ];
  return (
    svgText(24, 28, compactTitle, { ...font, 'font-size': 18, 'font-weight': 600 }) +
    svgText(24, 49, range, { ...font, fill: palette.text.secondary, 'font-size': 12 }) +
    renderCalendarTimeline(scene, palette) +
    `<g class="stats-bar">${stats
      .map(
        (stat) =>
          svgText(stat.x, 280, stat.value, { ...font, 'font-size': 26, 'font-weight': 600 }) +
          svgText(stat.x, 302, stat.label, {
            ...font,
            'font-size': 16,
            fill: palette.text.secondary,
          }),
      )
      .join('')}</g>` +
    renderHeightLegend(scene, palette)
  );
}
