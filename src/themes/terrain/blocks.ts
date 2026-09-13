import type { GridCell100 } from '../shared.js';
import type { TerrainPalette100, ElevationColors } from './palette.js';
import type { BiomeContext } from './biomes.js';
import type { Hemisphere } from '../../core/render-options.js';
import { escapeXml } from '../../core/svg.js';
import { getSeasonZone } from './seasons.js';
import { dateSeasonZone } from './scene/season.js';
import { toIsoCells, type IsoCell } from './scene/projection.js';
import { renderBlock } from './scene/block-shape.js';
import { blendWithWater } from './scene/block-colors.js';

export { THW, THH, toIsoCells } from './scene/projection.js';
export type { IsoCell } from './scene/projection.js';
export { toIsoCells as getIsoCells } from './scene/projection.js';

export function renderTerrainBlocks(
  cells: GridCell100[],
  palette: TerrainPalette100,
  originX: number,
  originY: number,
  biomeMap?: Map<string, BiomeContext>,
): string {
  const isDark = palette.text.primary.startsWith('#e');
  const blocks = toIsoCells(cells, palette, originX, originY).map((cell) => {
    const biome = biomeMap?.get(`${cell.week},${cell.day}`);
    const water = biome?.isRiver || biome?.isPond || (cell.level100 >= 9 && cell.level100 <= 22);
    return renderBlock(
      water
        ? { ...cell, colors: blendWithWater(cell.colors, isDark, cell.level100, biome?.isRiver) }
        : cell,
      !!water,
    );
  });
  return `<g class="terrain-blocks">${blocks.join('')}</g>`;
}

export function renderPreparedTerrainBlocks(
  isoCells: readonly IsoCell[],
  weekPalettes: readonly TerrainPalette100[],
  seasonRotation: number,
  biomeMap?: ReadonlyMap<string, BiomeContext>,
  hemisphere?: Hemisphere,
): string {
  const blocks = isoCells.map((cell) => {
    const palette = weekPalettes[Math.min(cell.week, weekPalettes.length - 1)];
    const zone =
      hemisphere && cell.date
        ? dateSeasonZone(cell.date, hemisphere)
        : getSeasonZone(cell.week, seasonRotation);
    const colors = palette.getElevation(cell.level100);
    const biome = biomeMap?.get(`${cell.week},${cell.day}`);
    const naturalWater = cell.level100 >= 9 && cell.level100 <= 22;
    const water = biome?.isRiver || biome?.isPond || naturalWater;
    let shadedColors: ElevationColors = colors;
    let liquid = !!water;
    if (water && naturalWater && (zone === 0 || zone === 7 || zone === 1)) {
      shadedColors = {
        top: palette.assets.ice || colors.top,
        left: palette.assets.frozenWater || colors.left,
        right: palette.assets.frozenWater || colors.right,
      };
      liquid = false;
    } else if (water) {
      shadedColors = blendWithWater(
        colors,
        palette.text.primary.startsWith('#e'),
        cell.level100,
        biome?.isRiver,
      );
    }
    const shape = renderBlock({ ...cell, colors: shadedColors }, liquid);
    if (!cell.date) return shape;
    return (
      `<g data-date="${escapeXml(cell.date)}" data-count="${cell.count ?? 0}"` +
      ` data-level="${cell.level100}"><title>${escapeXml(cell.date)}: ${cell.count ?? 0} contributions</title>${shape}</g>`
    );
  });
  return `<g class="terrain-blocks">${blocks.join('')}</g>`;
}

export function renderSeasonalTerrainBlocks(
  cells: GridCell100[],
  weekPalettes: TerrainPalette100[],
  originX: number,
  originY: number,
  seasonRotation: number,
  biomeMap?: Map<string, BiomeContext>,
): string {
  return renderPreparedTerrainBlocks(
    toIsoCells(cells, weekPalettes[26] || weekPalettes[0], originX, originY),
    weekPalettes,
    seasonRotation,
    biomeMap,
  );
}
