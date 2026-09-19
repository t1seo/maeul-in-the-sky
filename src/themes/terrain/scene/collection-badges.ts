import type { ArtStyle, TerrainLayout } from '../../../core/render-options.js';
import { escapeXml, svgElement, svgText } from '../../../core/svg.js';
import type { EpicCatalogEntry } from '../epics/catalog.js';
import type { TerrainPalette100 } from '../palette.js';
import { COLLECTION_RARITIES } from './collection-data.js';
import { renderCollectionArtwork } from './collection-icons.js';

const FONT = "'Segoe UI', system-ui, sans-serif";

export function renderCollectionBadge(
  entry: EpicCatalogEntry | undefined,
  index: number,
  layout: TerrainLayout,
  palette: TerrainPalette100,
  artStyle: ArtStyle,
): string {
  const card = layout === 'card';
  const x = 32 + index * (card ? 76 : 58);
  const y = card ? 332 : 78;
  const width = card ? 72 : 54;
  const height = card ? 19 : 37;
  const rarity = entry ? COLLECTION_RARITIES[entry.tier] : '';
  const color = entry
    ? {
        rare: palette.assets.epicGold,
        epic: palette.assets.epicMagic,
        legendary: palette.assets.epicJade,
      }[entry.tier]
    : palette.text.secondary;
  const label = entry
    ? `${entry.displayName} (${rarity}), discovered in this landscape`
    : 'Undiscovered Wonder placeholder; not seen in this landscape';
  const frame = svgElement('rect', {
    x,
    y,
    width,
    height,
    rx: card ? 4 : 5,
    fill: color,
    'fill-opacity': entry ? 0.06 : 0.02,
    stroke: color,
    'stroke-opacity': entry ? 0.45 : 0.18,
    'stroke-width': 0.6,
    ...(!entry ? { 'stroke-dasharray': '2 2' } : {}),
  });
  const font = { 'font-family': FONT, fill: palette.text.secondary };
  const name = entry?.displayName ?? 'Undiscovered';
  const limit = card ? 10 : 12;
  const shortName = name.length > limit ? `${name.slice(0, limit - 1)}…` : name;
  const artwork = entry
    ? renderCollectionArtwork(
        entry,
        palette,
        {
          x: x + (card ? 2 : 16),
          y: y + 1,
          width: card ? 19 : 22,
          height: card ? 17 : 23,
        },
        artStyle,
      )
    : svgText(x + (card ? 11 : 27), y + (card ? 13 : 20), '?', {
        ...font,
        'font-size': card ? 12 : 19,
        'text-anchor': 'middle',
        opacity: 0.38,
      });
  const nameText = svgText(x + (card ? 24 : 27), y + (card ? 8 : 29), shortName, {
    ...font,
    'font-size': card ? 6.8 : 7,
    'text-anchor': card ? 'start' : 'middle',
    fill: entry ? palette.text.primary : palette.text.secondary,
  });
  const rarityText = entry
    ? svgText(x + (card ? 24 : 27), y + (card ? 16 : 35), rarity, {
        ...font,
        'font-size': 6,
        'text-anchor': card ? 'start' : 'middle',
      })
    : '';
  return svgElement(
    'g',
    {
      class: entry ? 'collection-badge' : 'collection-placeholder',
      role: 'img',
      'aria-label': label,
      ...(entry ? { 'data-collection-id': entry.id, 'data-rarity': entry.tier } : {}),
    },
    svgElement('title', {}, escapeXml(label)) + frame + artwork + nameText + rarityText,
  );
}

export function renderCollectionRemainder(
  unseenCount: number,
  layout: TerrainLayout,
  palette: TerrainPalette100,
): string {
  const card = layout === 'card';
  const x = card ? 260 : 206;
  const y = card ? 332 : 78;
  const width = card ? 40 : 54;
  const label = `${unseenCount} not seen here; catalog types absent from this landscape`;
  const font = { 'font-family': FONT, fill: palette.text.secondary, 'text-anchor': 'middle' };
  const shape = svgElement('rect', {
    x,
    y,
    width,
    height: card ? 19 : 37,
    rx: card ? 4 : 5,
    fill: 'none',
    stroke: palette.text.secondary,
    'stroke-opacity': 0.28,
    'stroke-width': 0.6,
    'stroke-dasharray': '2 2',
  });
  return svgElement(
    'g',
    {
      class: 'collection-unseen',
      role: 'img',
      'aria-label': label,
    },
    svgElement('title', {}, escapeXml(label)) +
      shape +
      svgText(x + width / 2, y + (card ? 8 : 20), unseenCount ? '?' : '·', {
        ...font,
        'font-size': card ? 10 : 19,
        opacity: 0.5,
      }) +
      svgText(x + width / 2, y + (card ? 16 : 31), `${unseenCount} not here`, {
        ...font,
        'font-size': card ? 6 : 7,
      }),
  );
}
