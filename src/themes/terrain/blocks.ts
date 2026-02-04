import type { GridCell100 } from '../shared.js';
import type { TerrainPalette100, ElevationColors } from './palette.js';

// ── Isometric Constants ──────────────────────────────────────

/** Half-width of one isometric tile (x-axis) */
const THW = 7;
/** Half-height of one isometric tile (y-axis) */
const THH = 3;

// ── Isometric Projection ─────────────────────────────────────

export interface IsoCell {
  /** Grid week index (0–51) */
  week: number;
  /** Grid day index (0–6) */
  day: number;
  /** 100-level intensity (0–99) */
  level100: number;
  /** Block height in pixels */
  height: number;
  /** Screen X of the isometric diamond center */
  isoX: number;
  /** Screen Y of the isometric diamond center */
  isoY: number;
  /** Pre-computed elevation colors for this cell */
  colors: ElevationColors;
}

/**
 * Convert grid cells to isometric coordinates with elevation.
 * Cells are sorted in drawing order (back to front).
 */
export function toIsoCells(
  cells: GridCell100[],
  palette: TerrainPalette100,
  originX: number,
  originY: number,
): IsoCell[] {
  const isoCells: IsoCell[] = [];
  let cellIndex = 0;
  const numWeeks = Math.ceil(cells.length / 7);

  for (let week = 0; week < numWeeks; week++) {
    for (let day = 0; day < 7; day++) {
      if (cellIndex >= cells.length) break;
      const cell = cells[cellIndex++];

      const isoX = originX + (week - day) * THW;
      const isoY = originY + (week + day) * THH;
      const height = palette.getHeight(cell.level100);
      const colors = palette.getElevation(cell.level100);

      isoCells.push({
        week,
        day,
        level100: cell.level100,
        height,
        isoX,
        isoY,
        colors,
      });
    }
  }

  // Sort by drawing order: back to front
  isoCells.sort((a, b) => {
    const sumA = a.week + a.day;
    const sumB = b.week + b.day;
    if (sumA !== sumB) return sumA - sumB;
    return a.week - b.week;
  });

  return isoCells;
}

// ── Block Rendering ──────────────────────────────────────────

function renderBlock(cell: IsoCell): string {
  const { isoX: cx, isoY: cy, height: h, colors } = cell;

  if (h === 0) {
    const topPoints = [
      `${cx},${cy - THH}`,
      `${cx + THW},${cy}`,
      `${cx},${cy + THH}`,
      `${cx - THW},${cy}`,
    ].join(' ');
    return `<polygon points="${topPoints}" fill="${colors.top}" stroke="${colors.left}" stroke-width="0.3"/>`;
  }

  const parts: string[] = [];

  // Left face
  const leftPoints = [
    `${cx - THW},${cy}`,
    `${cx},${cy + THH}`,
    `${cx},${cy + THH + h}`,
    `${cx - THW},${cy + h}`,
  ].join(' ');
  parts.push(`<polygon points="${leftPoints}" fill="${colors.left}"/>`);

  // Right face
  const rightPoints = [
    `${cx + THW},${cy}`,
    `${cx},${cy + THH}`,
    `${cx},${cy + THH + h}`,
    `${cx + THW},${cy + h}`,
  ].join(' ');
  parts.push(`<polygon points="${rightPoints}" fill="${colors.right}"/>`);

  // Top face (drawn last)
  const topPoints = [
    `${cx},${cy - THH}`,
    `${cx + THW},${cy}`,
    `${cx},${cy + THH}`,
    `${cx - THW},${cy}`,
  ].join(' ');
  parts.push(`<polygon points="${topPoints}" fill="${colors.top}" stroke="${colors.left}" stroke-width="0.3"/>`);

  return parts.join('');
}

// ── Public API ───────────────────────────────────────────────

/**
 * Render all isometric terrain blocks.
 */
export function renderTerrainBlocks(
  cells: GridCell100[],
  palette: TerrainPalette100,
  originX: number,
  originY: number,
): string {
  const isoCells = toIsoCells(cells, palette, originX, originY);
  const blocks = isoCells.map(cell => renderBlock(cell));
  return `<g class="terrain-blocks">${blocks.join('')}</g>`;
}

/**
 * Get the computed isometric cells (for use by effects and assets).
 */
export function getIsoCells(
  cells: GridCell100[],
  palette: TerrainPalette100,
  originX: number,
  originY: number,
): IsoCell[] {
  return toIsoCells(cells, palette, originX, originY);
}

export { THW, THH };
