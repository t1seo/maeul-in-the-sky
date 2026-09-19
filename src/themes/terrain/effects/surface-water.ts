import { currentMotionContext, motionId } from '../../../core/animation.js';
import { svgNumber } from '../../../core/svg.js';
import type { IsoCell } from '../blocks.js';
import type { BiomeContext } from '../biomes.js';
import type { TerrainPalette100 } from '../palette.js';
import { dateSeasonZone } from '../scene/season.js';
import { currentSurfaceContext } from '../scene/surface-context.js';
import { selectEvenly } from './selection.js';

export function liquidSurfaceCells(
  cells: readonly IsoCell[],
  biomes?: ReadonlyMap<string, BiomeContext>,
): IsoCell[] {
  const hemisphere = currentSurfaceContext()?.hemisphere ?? 'north';
  return cells.filter((cell) => {
    const natural = cell.level100 >= 9 && cell.level100 <= 22;
    if (natural && cell.date) {
      const zone = dateSeasonZone(cell.date, hemisphere);
      if (zone === 0 || zone === 1 || zone === 7) return false;
    }
    const biome = biomes?.get(`${cell.week},${cell.day}`);
    return natural || biome?.isRiver || biome?.isPond;
  });
}

export function movingSurfaceCells(
  cells: readonly IsoCell[],
  biomes?: ReadonlyMap<string, BiomeContext>,
): IsoCell[] {
  return selectEvenly(
    liquidSurfaceCells(cells, biomes),
    currentMotionContext().mode === 'subtle'
      ? 4
      : (currentSurfaceContext()?.waterMotionLimit ?? 15),
  );
}

export function renderSurfaceWater(
  cells: readonly IsoCell[],
  palette: TerrainPalette100,
  biomes: ReadonlyMap<string, BiomeContext>,
): string {
  const shapes = liquidSurfaceCells(cells, biomes).flatMap((cell) => {
    const biome = biomes.get(`${cell.week},${cell.day}`);
    if (!biome?.isRiver && !biome?.isPond) return [];
    const { isoX: x, isoY: y } = cell;
    const color = biome.isPond ? palette.assets.pondOverlay : palette.assets.riverOverlay;
    return [
      `<path transform="translate(${svgNumber(x)} ${svgNumber(y)})" d="M-7,0Q-3,-1.9 0,-3L7,0Q3,1.9 0,3Z" fill="${color}" opacity=".72"/>`,
      `<path transform="translate(${svgNumber(x)} ${svgNumber(y)})" d="M-5.8,-.2Q-2,-1.3 1,-2.2L4,-.7Q0,-1.1 -3,.4Z" fill="${palette.assets.waterLight}" opacity=".12"/>`,
    ];
  });
  return shapes.length ? `<g class="water-overlays">${shapes.join('')}</g>` : '';
}

export function renderSurfaceRipples(
  cells: readonly IsoCell[],
  palette: TerrainPalette100,
  biomes: ReadonlyMap<string, BiomeContext>,
): string {
  const moving = new Set(movingSurfaceCells(cells, biomes));
  const enabled = currentMotionContext().mode !== 'off';
  let index = 0;
  const paths = liquidSurfaceCells(cells, biomes).map((cell) => {
    const animation =
      enabled && moving.has(cell) ? ` class="${motionId('surface-current-' + (index++ % 3))}"` : '';
    return (
      `<path data-water-current="true" transform="translate(${svgNumber(cell.isoX)} ${svgNumber(cell.isoY)})"` +
      ` d="M-4,-.3Q-.8,-1.2 3.8,-.2M-2,1Q.7,.3 3,.8" fill="none" stroke="${palette.assets.waterLight}"` +
      ` stroke-width=".28" stroke-linecap="round" stroke-dasharray="2 4" opacity=".3"${animation}/>`
    );
  });
  return paths.length ? `<g class="water-ripples">${paths.join('')}</g>` : '';
}
