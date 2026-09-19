import { currentMotionContext, motionId } from '../../../core/animation.js';
import type { IsoCell } from '../blocks.js';
import type { TerrainPalette100 } from '../palette.js';
import { THW, THH } from '../blocks.js';
import { selectEvenly } from './selection.js';
const MAX_WATER = 15;
const MAX_SPARKLE = 10;
export function renderAnimatedOverlays(
  isoCells: IsoCell[],
  palette: TerrainPalette100,
  townSparkles = true,
): string {
  const overlays: string[] = [];
  const mode = currentMotionContext().mode;

  // Water shimmer overlays (level 0-5)
  const waterCells = isoCells.filter((c) => c.level100 >= 10 && c.level100 <= 22);
  const selectedWater = selectEvenly(waterCells, MAX_WATER);
  for (let i = 0; i < selectedWater.length; i++) {
    const cell = selectedWater[i];
    const { isoX: cx, isoY: cy } = cell;
    const points = [
      `${cx},${cy - THH + 1}`,
      `${cx + THW - 2},${cy}`,
      `${cx},${cy + THH - 1}`,
      `${cx - THW + 2},${cy}`,
    ].join(' ');
    overlays.push(
      `<polygon points="${points}" fill="${palette.text.accent}" opacity="0.15" class="${motionId('water-' + i)}"/>`,
    );
  }

  // Town sparkle overlays (level 90+)
  const townCells = townSparkles ? isoCells.filter((c) => c.level100 >= 90) : [];
  const selectedTown = selectEvenly(townCells, MAX_SPARKLE);
  for (let i = 0; i < selectedTown.length; i++) {
    const cell = selectedTown[i];
    const { isoX: cx, isoY: cy, height: h } = cell;
    overlays.push(
      `<circle cx="${cx}" cy="${cy - h - 1}" r="1" fill="#ffe080" opacity="0.7" ${mode === 'full' ? `class="${motionId('sparkle-' + i)}"` : ''}/>`,
    );
  }

  return `<g class="terrain-overlays">${overlays.join('')}</g>`;
}
