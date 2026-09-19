import { currentMotionContext, motionId } from '../../../core/animation.js';
import { svgNumber, svgStyle } from '../../../core/svg.js';
import type { SceneBounds } from '../../../core/scene-types.js';
import type { TerrainPalette100 } from '../palette.js';
import { currentSurfaceContext } from '../scene/surface-context.js';
import type { WaterfallOutlet } from './water-topology.js';

export function movingWaterfallCount(outlets: readonly WaterfallOutlet[]): number {
  const mode = currentMotionContext().mode;
  return mode === 'off'
    ? 0
    : Math.min(
        outlets.length,
        mode === 'subtle' ? 2 : (currentSurfaceContext()?.waterMotionLimit ?? 15),
      );
}

export function waterfallBounds(outlets: readonly WaterfallOutlet[]): SceneBounds[] {
  return outlets.map(({ x, y, drop }) => ({ x: x - 9, y: y - 2, width: 18, height: drop + 8 }));
}

export function renderWaterfalls(
  outlets: readonly WaterfallOutlet[],
  palette: TerrainPalette100,
): string {
  if (!outlets.length) return '';
  const moving = movingWaterfallCount(outlets);
  const id = motionId('waterfall-water');
  const flow = motionId('waterfall-flow');
  const foam = palette.text.primary.startsWith('#e') ? '#c3f1ee' : '#efffff';
  const css = moving
    ? svgStyle(
        `@keyframes ${flow}{from{stroke-dashoffset:10}to{stroke-dashoffset:0}}.${flow}{animation:${flow} ${currentMotionContext().mode === 'subtle' ? 5 : 1.25}s linear infinite}`,
      )
    : '';
  const definitions = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${palette.assets.waterLight}" stop-opacity=".9"/><stop offset=".5" stop-color="#66c8d1" stop-opacity=".66"/><stop offset="1" stop-color="#a9e6e9" stop-opacity="0"/></linearGradient></defs>`;
  const falls = outlets.map(({ cell, edge, x, y, drop }, index) => {
    const tilt = edge === 'left' ? 0.95 : -0.95;
    const drift = edge === 'left' ? -2 : 2;
    const end = svgNumber(drop);
    const middle = svgNumber(drop * 0.5);
    return (
      `<g data-waterfall="true" data-week="${cell.week}" data-day="${cell.day}" transform="translate(${svgNumber(x)} ${svgNumber(y)})">` +
      `<path d="M-2.2,${-tilt}L2.2,${tilt}C2.5,7 ${2.5 + drift},${middle} ${2.8 + drift},${end}L${-2.8 + drift},${end}C${-2.5 + drift},${middle} -2.5,7 -2.2,${-tilt}Z" fill="url(#${id})"/>` +
      `<path d="M-2.6,${-tilt}Q0,-1 2.6,${tilt}M-1,1Q-1,7 ${drift * 0.3 - 1},${svgNumber(drop * 0.72)}M1,2Q1,8 ${drift * 0.3 + 1},${svgNumber(drop * 0.63)}" fill="none" stroke="${foam}" stroke-width=".5" opacity=".52"/>` +
      `<path data-waterfall-current="true" d="M-1,1Q-1,8 ${drift - 1},${end}M1,2Q1,8 ${drift + 1},${end}" fill="none" stroke="${foam}" stroke-width=".7" stroke-dasharray="2 8" opacity=".72"${index < moving ? ` class="${flow}"` : ''}/>` +
      `<path data-waterfall-mist="true" d="M${drift - 6},${end}a6,1.8 0 1,0 12,0a6,1.8 0 1,0 -12,0M${drift - 3},${svgNumber(drop + 3)}a4,1 0 1,0 8,0a4,1 0 1,0 -8,0" fill="${foam}" opacity=".12"/>` +
      '</g>'
    );
  });
  return `${css}${definitions}<g class="sky-waterfalls">${falls.join('')}</g>`;
}
