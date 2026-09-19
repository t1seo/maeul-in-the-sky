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
    ? `@keyframes ${name}{from{stroke-dashoffset:6.7}to{stroke-dashoffset:0}}` +
      Array.from(
        { length: Math.min(3, count) },
        (_, phase) =>
          `.${motionId('surface-current-' + phase)}{animation:${name} ${mode === 'subtle' ? 14 + phase * 2 : 3.4 + phase * 0.5}s linear -${phase}s infinite}`,
      ).join('')
    : '';
  return water + renderSeasonalWeatherCSS(cells);
}
