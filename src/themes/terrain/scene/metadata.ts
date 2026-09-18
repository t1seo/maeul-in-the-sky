import type { TerrainMetadata, TerrainScene } from '../../../core/scene-types.js';

export function terrainMetadata(scene: TerrainScene): TerrainMetadata {
  const biomes = new Map(scene.biomes.map((entry) => [`${entry.week},${entry.day}`, entry.biome]));
  const byDate = (placements: TerrainScene['placements']) => {
    const result = new Map<string, string[]>();
    for (const placement of placements) {
      const ids = result.get(placement.anchorDate) ?? [];
      ids.push(placement.id);
      result.set(placement.anchorDate, ids);
    }
    return result;
  };
  const assets = byDate(scene.placements);
  const wonders = byDate(scene.wonders);
  const rewards = byDate(scene.rewards ?? []);
  const span =
    scene.fromDate && scene.toDate
      ? Math.round((Date.parse(scene.toDate) - Date.parse(scene.fromDate)) / 86400000) + 1
      : 0;
  return {
    schemaVersion: 1,
    layoutVersion: scene.layoutVersion,
    username: scene.username,
    year: scene.year,
    fromDate: scene.fromDate,
    toDate: scene.toDate,
    dataDayCount: scene.cells.length,
    missingDayCount: span - scene.cells.length,
    stats: scene.stats,
    normalization: scene.normalization,
    seed: scene.seed,
    bounds: scene.bounds,
    cells: scene.cells.map((cell) => ({
      date: cell.date,
      count: cell.count,
      week: cell.week,
      day: cell.day,
      level100: cell.level100,
      ...(cell.rewardTier === undefined ? {} : { rewardTier: cell.rewardTier }),
      biome: biomes.get(`${cell.week},${cell.day}`) ?? {
        isRiver: false,
        isPond: false,
        nearWater: false,
        forestDensity: 0,
      },
      assetIds: assets.get(cell.date) ?? [],
      wonderIds: wonders.get(cell.date) ?? [],
      rewardIds: rewards.get(cell.date) ?? [],
    })),
    placements: scene.placements,
    wonders: scene.wonders,
    rewards: scene.rewards ?? [],
    neighborhoodPaths: scene.neighborhoodPaths,
  };
}
