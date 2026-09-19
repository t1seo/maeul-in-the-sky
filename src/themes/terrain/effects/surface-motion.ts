import { currentMotionContext, motionId } from '../../../core/animation.js';
import type { IsoCell } from '../blocks.js';
import type { BiomeContext } from '../biomes.js';
import { movingSurfaceCells } from './surface-water.js';
import { renderSeasonalWeatherCSS } from './seasonal-weather.js';

export function renderSurfaceMotionCSS(
  cells: readonly IsoCell[],
  biomes?: ReadonlyMap<string, BiomeContext>,
): string {
  const mode = currentMotionContext().mode;
  if (mode === 'off') return '';
  const count = movingSurfaceCells(cells, biomes).length;
  const name = motionId('surface-flow');
  const water = count
    ? `@keyframes ${name}{from{stroke-dashoffset:6}to{stroke-dashoffset:0}}` +
      Array.from(
        { length: Math.min(3, count) },
        (_, phase) =>
          `.${motionId('surface-current-' + phase)}{animation:${name} ${mode === 'subtle' ? 24 + phase * 3 : 10 + phase * 2}s linear -${phase * 3}s infinite}`,
      ).join('')
    : '';
  return water + renderSeasonalWeatherCSS(cells);
}
