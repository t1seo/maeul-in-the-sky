import { escapeXml } from '../../../core/svg.js';
import type { LandscapeField, LandscapePoint, LandscapeSettlementPlan } from './types.js';
import {
  depth,
  number,
  pointsAttribute,
  segmentPath,
  type DrawItem,
  type Projection,
} from './projection.js';
import { shade, type LandscapePalette } from './palette.js';
import { surfaceRibbons } from './ribbon.js';

const FIELD_COLORS = {
  wheat: { soil: '#b3a069', row: '#d7c586', detail: '#8c945b' },
  rice: { soil: '#76a69a', row: '#a5b878', detail: '#cfca94' },
  vegetable: { soil: '#8a8c60', row: '#bac186', detail: '#6f965e' },
} as const;

function fieldMarkup(
  field: LandscapeField,
  projection: Projection,
  palette: LandscapePalette,
): string {
  const colors = FIELD_COLORS[field.crop];
  const rows = field.rows
    .map(
      (row) =>
        `<path d="${segmentPath(row, projection)}" stroke="${colors.row}" stroke-width="${number(1.65 * projection.scale)}"/><path d="${segmentPath(row, projection)}" stroke="${colors.detail}" stroke-width="${number(0.6 * projection.scale)}" stroke-dasharray="1.2 2.5"/>`,
    )
    .join('');
  const polygon = pointsAttribute(field.points, projection);
  return `<g data-field-id="${escapeXml(field.id)}" data-crop="${field.crop}"><polygon points="${polygon}" fill="${palette.roadEdge}" transform="translate(0 1.8)"/><polygon points="${polygon}" fill="${colors.soil}" stroke="${palette.road}" stroke-width="1.2" stroke-linejoin="round"/><g fill="none" stroke-linecap="round">${rows}</g></g>`;
}

function bridgeMarkup(
  points: readonly [LandscapePoint, LandscapePoint],
  width: number,
  projection: Projection,
  palette: LandscapePalette,
): string {
  const [a, b] = points.map(projection.point);
  const dx = b.x - a.x,
    dy = b.y - a.y,
    length = Math.hypot(dx, dy) || 1;
  const nx = ((-dy / length) * width) / 2,
    ny = ((dx / length) * width) / 2;
  const line = `M${number(a.x)},${number(a.y)}L${number(b.x)},${number(b.y)}`;
  const rails = [-1, 1]
    .map((side) => {
      const start = { x: a.x + nx * side, y: a.y + ny * side },
        end = { x: b.x + nx * side, y: b.y + ny * side };
      const posts = [0, 0.33, 0.66, 1]
        .map((t) => {
          const x = start.x + (end.x - start.x) * t,
            y = start.y + (end.y - start.y) * t;
          return `M${number(x)},${number(y)}v-3.5`;
        })
        .join('');
      return `<path d="M${number(start.x)},${number(start.y - 3.5)}L${number(end.x)},${number(end.y - 3.5)}${posts}"/>`;
    })
    .join('');
  return `<g data-bridge="true" fill="none" stroke-linecap="round"><path d="${line}" stroke="${palette.cliff}" stroke-width="${number(width + 2)}" transform="translate(0 2)"/><path d="${line}" stroke="${palette.road}" stroke-width="${number(width)}"/><path d="${line}" stroke="${palette.soil}" stroke-width="${number(width)}" stroke-dasharray=".65 2.7"/><g stroke="${shade(palette.cliff, 1.2)}" stroke-width="1.1">${rails}</g></g>`;
}

export function groundItems(
  plan: LandscapeSettlementPlan,
  projection: Projection,
  palette: LandscapePalette,
): readonly DrawItem[] {
  const items: DrawItem[] = plan.fields.map((field) => ({
    depth: Math.max(...field.points.map(depth)) + 0.75,
    layer: 1,
    markup: fieldMarkup(field, projection, palette),
  }));
  for (const town of plan.towns) {
    const crosslines = town.plaza
      .slice(0, 4)
      .map((point, index) => {
        const opposite = town.plaza.at(index + Math.floor(town.plaza.length / 2));
        return opposite ? segmentPath([point, opposite], projection) : '';
      })
      .join('');
    items.push({
      depth: Math.max(...town.plaza.map(depth)) + 0.8,
      layer: 1,
      markup: `<g data-town-id="${escapeXml(town.id)}"><polygon points="${pointsAttribute(town.plaza, projection)}" fill="${palette.paving}" stroke="${palette.roadEdge}" stroke-width="2"/><path d="${crosslines}" fill="none" stroke="${palette.road}" stroke-width=".65" opacity=".75"/></g>`,
    });
  }
  for (const road of plan.roads) {
    const width = road.width * 11 * projection.scale;
    const ribbons = surfaceRibbons(road.points, projection, () => width, 1.5);
    for (let index = 1; index < road.points.length; index++) {
      const a = road.points[index - 1],
        b = road.points[index];
      const path = segmentPath([a, b], projection);
      const ribbon = ribbons[index - 1];
      items.push({
        depth: Math.max(depth(a), depth(b)) + 1.1 + road.width * 0.5,
        layer: 2,
        markup: `<g data-road-id="${escapeXml(road.id)}"><polygon points="${ribbon.border}" fill="${palette.roadEdge}" opacity=".6"/><polygon points="${ribbon.body}" fill="${palette.road}" stroke="${palette.road}" stroke-width=".55" stroke-linejoin="round"/><path d="${path}" fill="none" stroke="${palette.paving}" stroke-width=".7" stroke-dasharray="1 3" opacity=".45"/></g>`,
      });
    }
    for (const crossing of road.bridges)
      items.push({
        depth: Math.max(...crossing.map(depth)) + 1.5,
        layer: 3,
        markup: bridgeMarkup(crossing, Math.max(width + 2, 5), projection, palette),
      });
  }
  return items;
}
