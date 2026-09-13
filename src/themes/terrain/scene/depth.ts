import type {
  NeighborhoodPath,
  ScenePlacement,
  SceneWonderPlacement,
  TerrainScene,
} from '../../../core/scene-types.js';
import type { IsoCell } from '../blocks.js';
import type { TerrainPalette100 } from '../palette.js';
import { escapeXml, svgElement } from '../../../core/svg.js';
import { isAssetType } from '../assets/catalog.js';
import { renderAssetPlacements } from '../assets/rendering.js';
import { isEpicBuildingType } from '../epics/catalog.js';
import { renderEpicBuildings } from '../epics.js';

export type SceneDrawable =
  | { readonly kind: 'path'; readonly value: NeighborhoodPath }
  | { readonly kind: 'asset'; readonly value: ScenePlacement }
  | { readonly kind: 'wonder'; readonly value: SceneWonderPlacement };

export function sceneDrawList(
  scene: Pick<TerrainScene, 'placements' | 'wonders' | 'neighborhoodPaths'>,
): SceneDrawable[] {
  const items: SceneDrawable[] = [
    ...scene.placements.map((value) => ({ kind: 'asset' as const, value })),
    ...scene.wonders.map((value) => ({ kind: 'wonder' as const, value })),
    ...scene.neighborhoodPaths.map((value) => ({ kind: 'path' as const, value })),
  ];
  return items.sort(
    (a, b) =>
      a.value.drawOrder - b.value.drawOrder ||
      a.value.week - b.value.week ||
      a.value.day - b.value.day ||
      (a.kind === 'path' ? 0 : 1) - (b.kind === 'path' ? 0 : 1) ||
      a.value.id.localeCompare(b.value.id),
  );
}

function renderDrawable(
  item: SceneDrawable,
  cells: ReadonlyMap<string, IsoCell>,
  palettes: TerrainPalette100[],
): string {
  const value = item.value;
  const palette = palettes[value.week];
  switch (item.kind) {
    case 'path': {
      const deck = value.catalogId === 'neighborhood:deck';
      return svgElement('polyline', {
        points: item.value.points.map((point) => `${point.x},${point.y}`).join(' '),
        fill: 'none',
        stroke: deck ? palette.assets.driftwood : palette.text.secondary,
        'stroke-width': deck ? 3.2 : 1.4,
        'stroke-linecap': 'round',
        ...(deck ? {} : { 'stroke-dasharray': '1.3 1.1' }),
        opacity: deck ? 0.85 : 0.65,
      });
    }
    case 'asset': {
      const cell = cells.get(item.value.anchorDate);
      if (!cell || !isAssetType(item.value.catalogId)) return '';
      return renderAssetPlacements(
        [
          {
            id: item.value.id,
            date: item.value.anchorDate,
            type: item.value.catalogId,
            catalogId: item.value.catalogId,
            cell,
            cx: item.value.cx,
            cy: item.value.cy,
            ox: 0,
            oy: 0,
            variant: item.value.variant,
            animated: item.value.animated,
          },
        ],
        palettes,
      );
    }
    case 'wonder':
      if (!isEpicBuildingType(item.value.catalogId)) return '';
      return renderEpicBuildings(
        [
          {
            id: item.value.id,
            date: item.value.anchorDate,
            catalogId: item.value.catalogId,
            type: item.value.catalogId,
            tier: item.value.tier,
            week: item.value.week,
            day: item.value.day,
            cx: item.value.cx,
            cy: item.value.cy,
          },
        ],
        palettes,
      );
    default: {
      const exhaustive: never = item;
      return exhaustive;
    }
  }
}

export function renderDepthLayer(
  scene: TerrainScene,
  isoCells: readonly IsoCell[],
  palettes: TerrainPalette100[],
): string {
  const cells = new Map(
    isoCells.flatMap((cell) => (cell.date ? [[cell.date, cell] as const] : [])),
  );
  return `<g class="terrain-assets terrain-drawables">${sceneDrawList(scene)
    .map(
      (item) =>
        `<g data-placement-id="${escapeXml(item.value.id)}" data-catalog-id="${escapeXml(item.value.catalogId)}"` +
        ` data-anchor-date="${item.value.anchorDate}" data-draw-order="${item.value.drawOrder}"` +
        (item.kind === 'asset' && item.value.decorative ? ' data-decorative="true"' : '') +
        `>${renderDrawable(item, cells, palettes)}</g>`,
    )
    .join('')}</g>`;
}
