import type { TerrainScene } from '../../../core/scene-types.js';
import { escapeXml, svgElement, svgText } from '../../../core/svg.js';
import type { TerrainPalette100 } from '../palette.js';
import {
  COLLECTION_BADGE_LIMIT,
  collectionDescription,
  landscapeCollection,
} from './collection-data.js';
import { renderCollectionBadge, renderCollectionRemainder } from './collection-badges.js';
import { renderCollectionSeason } from './collection-icons.js';

const FONT = "'Segoe UI', system-ui, sans-serif";

export function renderVillageCollection(scene: TerrainScene, palette: TerrainPalette100): string {
  const collection = landscapeCollection(scene);
  const card = scene.settings.layout === 'card';
  const description = collectionDescription(scene);
  const more = Math.max(0, collection.wonders.length - COLLECTION_BADGE_LIMIT);
  const font = { 'font-family': FONT, fill: palette.text.primary };
  const frame = svgElement('rect', {
    class: 'collection-panel',
    x: 24,
    y: card ? 318 : 50,
    width: card ? 372 : 246,
    height: card ? 36 : 80,
    rx: card ? 6 : 8,
    fill: palette.bg.subtle,
    stroke: palette.text.secondary,
    'stroke-opacity': 0.14,
    'stroke-width': 0.6,
  });
  const heading =
    svgText(32, card ? 328 : 62, 'Village collection', {
      ...font,
      'font-size': card ? 9 : 10,
      'font-weight': 600,
    }) +
    svgText(card ? 166 : 262, card ? 328 : 62, `${collection.wonders.length} unique`, {
      ...font,
      'font-size': 9,
      'font-weight': 600,
      'text-anchor': 'end',
    });
  const scope =
    svgText(card ? 178 : 32, card ? 328 : 72, 'In this landscape', {
      ...font,
      fill: palette.text.secondary,
      'font-size': card ? 7 : 7.5,
    }) +
    svgText(
      card ? 300 : 262,
      card ? 328 : 72,
      `${more ? `+${more} more · ` : ''}${collection.catalogCount} types`,
      {
        ...font,
        fill: palette.text.secondary,
        'font-size': card ? 6.5 : 7.5,
        'text-anchor': 'end',
      },
    );
  const badges =
    Array.from({ length: COLLECTION_BADGE_LIMIT }, (_, index) =>
      renderCollectionBadge(
        collection.wonders[index],
        index,
        scene.settings.layout,
        palette,
        scene.settings.artStyle,
      ),
    ).join('') + renderCollectionRemainder(collection.unseenCount, scene.settings.layout, palette);
  const auras =
    svgText(card ? 350 : 32, card ? 328 : 125, 'Seasonal auras', {
      ...font,
      fill: palette.text.secondary,
      'font-size': card ? 6.5 : 6.8,
      'text-anchor': card ? 'middle' : 'start',
    }) +
    collection.seasons
      .map((season, index) => {
        const x = card ? 319 + index * 20 : 87 + index * 44;
        const token = renderCollectionSeason(season, palette, x, card ? 342 : 123, card ? 7 : 4.5);
        return (
          token +
          (card
            ? ''
            : svgText(x + 7, 125, season.label, {
                ...font,
                fill: palette.text.secondary,
                'font-size': 6.3,
              }))
        );
      })
      .join('');
  return svgElement(
    'g',
    {
      class: 'village-collection',
      role: 'group',
      'aria-label': description,
      'data-discovered-count': collection.wonders.length,
      'data-catalog-count': collection.catalogCount,
    },
    svgElement('title', {}, escapeXml(description)) +
      svgElement('desc', {}, escapeXml(description)) +
      frame +
      heading +
      scope +
      badges +
      auras,
  );
}
