import { currentMotionContext, motionId } from '../../../core/animation.js';
import { svgNumber } from '../../../core/svg.js';
import { lerpColor } from '../../../utils/color.js';
import type { IsoCell } from '../blocks.js';
import type { BiomeContext } from '../biomes.js';
import type { TerrainPalette100 } from '../palette.js';
import { currentSurfaceContext } from '../scene/surface-context.js';
import { selectEvenly } from './selection.js';
import { liquidSurfaceCells, waterfallOutlets } from './water-topology.js';
import { movingWaterfallCount } from './waterfalls.js';
import { renderRiverBanks, renderRiverDepths, riverArtwork } from './river-art.js';

export function movingSurfaceCells(
  cells: readonly IsoCell[],
  biomes?: ReadonlyMap<string, BiomeContext>,
): IsoCell[] {
  const limit =
    currentMotionContext().mode === 'subtle'
      ? 4
      : (currentSurfaceContext()?.waterMotionLimit ?? 15);
  return selectEvenly(
    liquidSurfaceCells(cells, biomes),
    Math.max(0, limit - movingWaterfallCount(waterfallOutlets(cells, biomes))),
  );
}

export function renderSurfaceWater(
  cells: readonly IsoCell[],
  palette: TerrainPalette100,
  biomes: ReadonlyMap<string, BiomeContext>,
): string {
  const observed = new Map(cells.map((cell) => [`${cell.week},${cell.day}`, cell]));
  const water = lerpColor(palette.assets.water, '#48aa9e', 0.62);
  let hasRiver = false;
  const shapes = liquidSurfaceCells(cells, biomes).flatMap((cell) => {
    const biome = biomes.get(`${cell.week},${cell.day}`);
    if (!biome?.isRiver && !biome?.isPond) return [];
    const { isoX: x, isoY: y } = cell;
    if (biome.isRiver) {
      hasRiver = true;
      return [
        `<g transform="translate(${svgNumber(x)} ${svgNumber(y)})">` +
          '<path d="M-8,0 0,-3.5 8,0 0,3.5Z"/>' +
          `<use href="#${riverArtwork(cell).depthId}"/>` +
          renderRiverBanks(cell, observed, biomes) +
          '</g>',
      ];
    }
    const color = palette.assets.pondOverlay;
    const channel = 'M-5.8,-.2Q-2,-1.3 1,-2.2L4,-.7Q0,-1.1 -3,.4Z';
    return [
      `<path transform="translate(${svgNumber(x)} ${svgNumber(y)})" d="M-8,0Q-4,-1.75 0,-3.5L8,0Q4,1.75 0,3.5Z" fill="${color}" opacity=".8"/>`,
      `<path transform="translate(${svgNumber(x)} ${svgNumber(y)})" d="${channel}" fill="${palette.assets.waterLight}" stroke="${palette.assets.waterLight}" stroke-width="2.4" opacity=".24"/>`,
    ];
  });
  const definitions = hasRiver ? renderRiverDepths() : '';
  return shapes.length
    ? `${definitions}<g class="water-overlays" fill="${water}">${shapes.join('')}</g>`
    : '';
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
    const river = biomes.get(`${cell.week},${cell.day}`)?.isRiver;
    const path = river ? riverArtwork(cell).ripples : 'M-4,-.3Q-.8,-1.2 3.8,-.2M-2,1Q.7,.3 3,.8';
    const animation =
      enabled && moving.has(cell) ? ` class="${motionId('surface-current-' + (index++ % 3))}"` : '';
    return (
      `<path data-water-current="true" transform="translate(${svgNumber(cell.isoX)} ${svgNumber(cell.isoY)})"` +
      ` d="${path}" fill="none" stroke="${river ? '#c4eff1' : palette.assets.waterLight}"` +
      ` stroke-width="${river ? '.28' : '.3'}" stroke-linecap="round" stroke-dasharray="${river ? '1.3 1.7 .5 3.2' : '2.2 4.5'}" opacity="${river ? '.62' : '.4'}"${animation}/>`
    );
  });
  return paths.length ? `<g class="water-ripples">${paths.join('')}</g>` : '';
}
