import { escapeXml } from '../../../core/svg.js';
import { motionMarkup, motionId } from '../../../core/animation.js';
import type { ColorMode } from '../../../core/types.js';
import type { AssetColors, TerrainPalette100 } from '../palette.js';
import type { EpicBuildingType, PlacedEpicBuilding } from './types.js';
import { EPIC_RENDERERS } from './renderers.js';
import type { ArtStyle } from '../../../core/render-options.js';
import { renderPixelAsset } from '../pixel/render.js';

export function renderCatalogEpic(
  type: EpicBuildingType,
  colors: AssetColors,
  artStyle: ArtStyle = 'miniature',
): string {
  return artStyle === 'pixel'
    ? renderPixelAsset(type, 0, 0, colors)
    : EPIC_RENDERERS[type](0, 0, colors);
}

export function renderEpicGlowDefs(mode: ColorMode): string {
  const tiers: { id: string; color: string; darkOuter: number; lightOuter: number }[] = [
    { id: 'epic-glow-rare', color: '#FFD700', darkOuter: 0, lightOuter: 0 },
    { id: 'epic-glow-epic', color: '#9B59B6', darkOuter: 0, lightOuter: 0 },
    { id: 'epic-glow-legendary', color: '#00CED1', darkOuter: 0, lightOuter: 0 },
  ];

  return tiers
    .map(
      (t) =>
        `<radialGradient id="${motionId(t.id)}">` +
        `<stop offset="0%" stop-color="${t.color}" stop-opacity="${mode === 'dark' ? 0.4 : 0.3}"/>` +
        `<stop offset="100%" stop-color="${t.color}" stop-opacity="0"/>` +
        `</radialGradient>`,
    )
    .join('');
}

export function renderEpicCSS(): string {
  return motionMarkup(
    [
      `@keyframes epic-pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.9; } }`,
      `.epic-glow-pulse { animation: epic-pulse 3s ease-in-out infinite; }`,
      `@keyframes epic-swirl { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`,
      `.epic-portal-swirl { animation: epic-swirl 8s linear infinite; transform-origin: center; }`,
    ].join('\n'),
  );
}

export function renderEpicBuildings(
  placed: PlacedEpicBuilding[],
  weekPalettes: TerrainPalette100[],
  artStyle: ArtStyle = 'miniature',
): string {
  if (placed.length === 0) return '';

  const parts = placed.map((epic) => {
    const weekIdx = Math.min(epic.week, weekPalettes.length - 1);
    const palette = weekPalettes[weekIdx];
    const c = palette.assets;
    const renderer = EPIC_RENDERERS[epic.type];

    const glowId = `epic-glow-${epic.tier}`;
    const glow =
      artStyle === 'pixel'
        ? ''
        : `<ellipse cx="${epic.cx}" cy="${epic.cy}" rx="8" ry="4" fill="url(#${motionId(glowId)})" opacity="0.6"/>`;

    const building =
      artStyle === 'pixel'
        ? renderPixelAsset(epic.type, epic.cx, epic.cy, c)
        : renderer(epic.cx, epic.cy, c);
    return `<g data-catalog-id="${epic.type}" data-date="${escapeXml(epic.date ?? '')}" data-wonder-id="${escapeXml(epic.id ?? `wonder:${epic.week},${epic.day}`)}">${glow}${building}</g>`;
  });

  return `<g class="epic-buildings">${parts.join('')}</g>`;
}
