import { currentMotionContext, motionId, motionMarkup } from '../../../core/animation.js';
import { renderMotionBranches } from '../motion/index.js';
import type { LandscapeModel, LandscapePoint } from './types.js';
import { depth, number, type DrawItem, type Projection } from './projection.js';
import type { LandscapePalette } from './palette.js';
import { surfaceRibbons } from './ribbon.js';

function waterfall(
  point: LandscapePoint,
  width: number,
  projection: Projection,
  palette: LandscapePalette,
  index: number,
): string {
  const context = currentMotionContext();
  return renderMotionBranches(
    { ...context, namespace: `${context.namespace}-fall-${index}` },
    () => {
      const top = projection.point(point),
        bottom = projection.point({ ...point, elevation: -3.4 });
      const gradient = motionId('waterfall');
      return `<defs><linearGradient id="${gradient}" x2="0" y2="1"><stop stop-color="${palette.waterLight}"/><stop offset="1" stop-color="${palette.water}" stop-opacity="0"/></linearGradient></defs><g class="landscape-waterfall"><path d="M${number(top.x)},${number(top.y)}Q${number(top.x + 2)},${number((top.y + bottom.y) / 2)} ${number(bottom.x)},${number(bottom.y)}" fill="none" stroke="url(#${gradient})" stroke-width="${number(width)}"/><path d="M${number(top.x - 1)},${number(top.y + 1)}L${number(bottom.x - 1)},${number(bottom.y - 9)}" stroke="${palette.waterLight}" stroke-width=".9" opacity=".7"/><ellipse cx="${number(bottom.x)}" cy="${number(bottom.y)}" rx="${number(width * 1.15)}" ry="2" fill="${palette.foam}" opacity=".2">${motionMarkup('<animate attributeName="opacity" values=".16;.32;.16" dur="4s" repeatCount="indefinite"/>')}</ellipse></g>`;
    },
  );
}

export function waterItems(
  model: LandscapeModel,
  projection: Projection,
  palette: LandscapePalette,
): readonly DrawItem[] {
  const items: DrawItem[] = [];
  for (const [riverIndex, river] of model.rivers.entries()) {
    const ribbons = surfaceRibbons(
      river.points,
      projection,
      (index, total) =>
        Math.max(1, river.width * (0.56 + (index / total) * 0.65) * 11 * projection.scale),
      2.7 * projection.scale,
    );
    for (let index = 1; index < river.points.length; index++) {
      const a = river.points[index - 1],
        b = river.points[index];
      const ribbon = ribbons[index - 1];
      items.push({
        depth: Math.max(depth(a), depth(b)) + 1.1 + river.width * 0.5,
        layer: 1,
        markup: `<g class="landscape-river"><polygon points="${ribbon.border}" fill="${palette.bank}"/><polygon points="${ribbon.body}" fill="${palette.water}" stroke="${palette.water}" stroke-width=".55" stroke-linejoin="round"/><polygon points="${ribbon.center}" fill="${palette.waterLight}" opacity=".45"/></g>`,
      });
    }
    const outlet = river.points.at(-1);
    if (outlet && depth(outlet) > -2 && riverIndex < 4) {
      items.push({
        depth: depth(outlet) + 0.8,
        layer: 2,
        markup: waterfall(
          outlet,
          river.width * 9 * projection.scale,
          projection,
          palette,
          riverIndex,
        ),
      });
    }
  }
  return items;
}
