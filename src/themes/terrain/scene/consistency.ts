import type { Hemisphere } from '../../../core/render-options.js';
import type { SceneCell, SceneConsistencyEffect } from '../../../core/scene-types.js';
import { hash, seededRandom } from '../../../utils/math.js';
import {
  CONSISTENCY_DRIFT,
  CONSISTENCY_GLYPHS,
  CONSISTENCY_STROKE,
} from '../effects/consistency-geometry.js';
import { datePeakSeason } from './season.js';
import { unionBounds } from './bounds.js';

const MAX_CONSISTENCY_GROUPS = 10;
const SEASON_EFFECTS = {
  spring: 'springPetals',
  summer: 'summerFireflies',
  autumn: 'autumnLeaves',
  winter: 'winterFrost',
} as const;

export function consistencyEffectPlacements(
  cells: readonly SceneCell[],
  root: string,
  hemisphere: Hemisphere,
): SceneConsistencyEffect[] {
  const candidates = cells.flatMap((cell) => {
    const progress = cell.consistency;
    if (cell.count <= 0 || !progress || progress.tier === 0) return [];
    return [
      {
        cell,
        tier: progress.tier,
        activeDays: progress.activeDays,
        rank: hash(`${root}:${cell.date}:consistency-rank`),
      },
    ];
  });
  return candidates
    .sort((a, b) => a.rank - b.rank || a.cell.date.localeCompare(b.cell.date))
    .slice(0, MAX_CONSISTENCY_GROUPS)
    .map(({ cell, tier, activeDays }) => {
      const kind = SEASON_EFFECTS[datePeakSeason(cell.date, hemisphere)];
      const rng = seededRandom(hash(`${root}:${cell.date}:consistency-shape`));
      const phase = rng() * Math.PI * 2;
      const particles = Array.from({ length: 1 + tier * 2 }, (_, index) => ({
        x: Math.cos(phase + index * 2.4) * (4 + rng() * 3),
        y: -4 - rng() * 10,
        size: 0.65 + rng() * 0.4,
      }));
      const cx = cell.isoX;
      const cy = cell.isoY - cell.height - 1;
      const glyph = CONSISTENCY_GLYPHS[kind].bounds;
      const footprint = unionBounds(
        particles.map(({ x, y, size }) => ({
          x: cx + x + (glyph.x - CONSISTENCY_STROKE / 2) * size - CONSISTENCY_DRIFT.x,
          y: cy + y + (glyph.y - CONSISTENCY_STROKE / 2) * size - CONSISTENCY_DRIFT.y,
          width: (glyph.width + CONSISTENCY_STROKE) * size + CONSISTENCY_DRIFT.x * 2,
          height: (glyph.height + CONSISTENCY_STROKE) * size + CONSISTENCY_DRIFT.y * 2,
        })),
      );
      return {
        id: `consistency:${cell.date}`,
        kind,
        anchorDate: cell.date,
        week: cell.week,
        day: cell.day,
        cx,
        cy,
        tier,
        activeDays,
        particles,
        footprint,
      };
    })
    .sort((a, b) => a.anchorDate.localeCompare(b.anchorDate));
}
