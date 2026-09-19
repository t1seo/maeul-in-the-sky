import { motionId } from '../../../core/animation.js';
import type { SceneBounds } from '../../../core/scene-types.js';
import { svgNumber } from '../../../core/svg.js';
import { THH, THW, type IsoCell } from '../blocks.js';

export function clipSeasonalWeather(markup: string, bounds: SceneBounds): string {
  if (!markup) return '';
  const id = motionId('seasonal-weather-clip');
  return (
    `<defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse">` +
    `<rect x="${svgNumber(bounds.x)}" y="${svgNumber(bounds.y)}" width="${svgNumber(bounds.width)}" height="${svgNumber(bounds.height)}"/>` +
    `</clipPath></defs><g data-weather-clip="viewport" clip-path="url(#${id})">${markup}</g>`
  );
}

export function clipSeasonalWeatherToCells(
  markup: string,
  cells: readonly IsoCell[],
  kind: string,
): string {
  const id = motionId(`seasonal-${kind}-clip`);
  const airspace = cells
    .map(
      (cell) =>
        `M${svgNumber(cell.isoX - THW)},${svgNumber(cell.isoY - 28)}h${THW * 2}v${28 + THH}h${-THW * 2}Z`,
    )
    .join('');
  return (
    `<defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${airspace}"/></clipPath></defs>` +
    `<g data-weather-clip="${kind}" clip-path="url(#${id})">${markup}</g>`
  );
}
