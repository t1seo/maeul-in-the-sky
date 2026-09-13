import type { SceneWonderPlacement, WonderThreshold } from '../../../core/scene-types.js';
import type { ContributionStats } from '../../../core/types.js';
import type { IsoCell } from '../blocks.js';
import type { PlacedEpicBuilding } from '../epics.js';
import { TIER_CONFIG } from '../epics.js';
import { getEpicCatalogEntry } from '../epics/catalog.js';
import { getEpicGateThresholds } from '../epics/gates.js';
import { computeRichness } from '../assets.js';

export function wonderScenePlacements(
  placed: readonly PlacedEpicBuilding[],
  cells: readonly IsoCell[],
  stats: ContributionStats,
): SceneWonderPlacement[] {
  const cellMap = new Map(cells.map((cell) => [`${cell.week},${cell.day}`, cell]));
  return placed.flatMap((wonder) => {
    const cell = cellMap.get(`${wonder.week},${wonder.day}`);
    if (!cell?.date) return [];
    const catalog = getEpicCatalogEntry(wonder.type);
    const gate = TIER_CONFIG[wonder.tier];
    const richness = computeRichness(cell, cellMap);
    const thresholds: WonderThreshold[] = [
      {
        metric: 'level100',
        required: gate.minLevel,
        current: cell.level100,
        achieved: cell.level100 >= gate.minLevel,
      },
      {
        metric: 'richness',
        required: gate.minRichness,
        current: richness,
        achieved: richness >= gate.minRichness,
      },
      ...getEpicGateThresholds(wonder.tier, stats),
    ];
    return [
      {
        id: `wonder-${cell.date}-${wonder.type}`,
        catalogId: wonder.type,
        anchorDate: cell.date,
        week: cell.week,
        day: cell.day,
        cx: wonder.cx,
        cy: wonder.cy,
        footprint: {
          ...catalog.bounds,
          x: wonder.cx + catalog.bounds.x,
          y: wonder.cy + catalog.bounds.y,
        },
        drawOrder: cell.week + cell.day,
        variant: 0,
        animated: true,
        tier: wonder.tier,
        thresholds,
        explanation: `Level ${cell.level100} ≥ ${gate.minLevel}; neighborhood richness ${richness.toFixed(2)} ≥ ${gate.minRichness}; ${catalog.gate.statsDescription}. Selected by the deterministic rarity draw, spacing and three-Wonder budget.`,
      },
    ];
  });
}
