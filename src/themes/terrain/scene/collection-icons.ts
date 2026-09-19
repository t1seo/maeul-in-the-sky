import { withMotionContext } from '../../../core/animation.js';
import type { ArtStyle } from '../../../core/render-options.js';
import type { SceneBounds } from '../../../core/scene-types.js';
import { escapeXml, svgElement, svgNumber } from '../../../core/svg.js';
import type { EpicCatalogEntry } from '../epics/catalog.js';
import { renderCatalogEpic } from '../epics/rendering.js';
import { CONSISTENCY_GLYPHS, CONSISTENCY_STROKE } from '../effects/consistency-geometry.js';
import type { TerrainPalette100 } from '../palette.js';
import type { CollectionSeason } from './collection-data.js';

export function renderCollectionArtwork(
  entry: EpicCatalogEntry,
  palette: TerrainPalette100,
  box: SceneBounds,
  artStyle: ArtStyle,
): string {
  const bounds = entry.bounds;
  const scale = Math.min((box.width - 2) / bounds.width, (box.height - 2) / bounds.height);
  const x = box.x + (box.width - bounds.width * scale) / 2 - bounds.x * scale;
  const y = box.y + (box.height - bounds.height * scale) / 2 - bounds.y * scale;
  const artwork = withMotionContext({ mode: 'off', namespace: '' }, () =>
    renderCatalogEpic(entry.id, palette.assets, artStyle),
  );
  return svgElement(
    'g',
    {
      class: 'collection-artwork',
      'aria-hidden': 'true',
      transform: `translate(${svgNumber(x)} ${svgNumber(y)}) scale(${scale.toFixed(6)})`,
    },
    artwork,
  );
}

export function renderCollectionSeason(
  season: CollectionSeason,
  palette: TerrainPalette100,
  x: number,
  y: number,
  radius: number,
): string {
  const glyph = CONSISTENCY_GLYPHS[season.kind];
  const earned = season.state === 'discovered';
  const colors = {
    springPetals: palette.assets.cherryPetalPink,
    summerFireflies: palette.assets.epicGold,
    autumnLeaves: palette.assets.autumnRust,
    winterFrost: palette.assets.epicCrystal,
  };
  const color = earned ? colors[season.kind] : palette.text.secondary;
  const status = {
    discovered: 'discovered in this landscape',
    unseen: 'not seen in this landscape',
    unrecorded: 'not recorded in this landscape',
  }[season.state];
  const label = `${season.name}, ${status}`;
  const ring = svgElement('circle', {
    cx: x,
    cy: y,
    r: radius,
    fill: earned ? color : 'none',
    'fill-opacity': 0.12,
    stroke: color,
    'stroke-opacity': earned ? 0.7 : 0.35,
    'stroke-width': 0.6,
    ...(!earned ? { 'stroke-dasharray': '1.5 1.5' } : {}),
  });
  const artwork = svgElement(
    'g',
    {
      transform: `translate(${x} ${y}) scale(${radius / 2.8})`,
      opacity: earned ? 1 : 0.35,
    },
    svgElement('path', { d: glyph.body, fill: color }) +
      svgElement('path', {
        d: glyph.detail,
        fill: 'none',
        stroke: earned ? palette.text.primary : color,
        'stroke-width': CONSISTENCY_STROKE,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
  );
  return svgElement(
    'g',
    {
      class: 'collection-season',
      'data-kind': season.kind,
      'data-state': season.state,
      role: 'img',
      'aria-label': label,
    },
    svgElement('title', {}, escapeXml(label)) + ring + artwork,
  );
}
