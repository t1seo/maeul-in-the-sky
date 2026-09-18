import type { SceneCell, TerrainScene } from '../../../core/scene-types.js';
import type { ContributionData } from '../../../core/types.js';
import type { TerrainRenderOptions } from './options.js';
import { computeStats } from '../../../core/stats.js';
import { InputValidationError } from '../../../core/settings/errors.js';
import { resolveRenderSettings } from '../../../core/settings/resolve.js';
import { computeP90Max } from '../../../core/settings/normalization.js';
import { contributionGrid, enrichGridCells100 } from '../../shared.js';
import { getTerrainPalette100 } from '../palette.js';
import { toIsoCells } from '../blocks.js';
import { selectAssetPlacements } from '../assets/selection.js';
import { selectEpicBuildings } from '../epics.js';
import { generateBiomeMap } from '../biomes.js';
import { hash } from '../../../utils/math.js';
import { assetScenePlacement, gardenPlacements } from './placements.js';
import { wonderScenePlacements } from './wonders.js';
import { neighborhoodPaths } from './neighborhood.js';
import { sceneBounds } from './bounds.js';
import { dailyRewardPlacements } from './rewards.js';
import { getDailyRewardTier } from '../assets/progression.js';

export function prepareTerrainScene(
  data: ContributionData,
  options: TerrainRenderOptions = {},
): TerrainScene {
  const { width: _width, height: _height, namespace: _namespace, ...inputSettings } = options;
  const settings = resolveRenderSettings(inputSettings, {}, data.username);
  const grid = contributionGrid(data, { cellSize: 1, gap: 0, offsetX: 0, offsetY: 0 });
  for (const cell of grid) {
    if (
      !Number.isInteger(cell.count) ||
      cell.count < 0 ||
      !Number.isInteger(cell.level) ||
      cell.level < 0 ||
      cell.level > 4
    ) {
      throw new InputValidationError([
        {
          path: `days.${cell.date}`,
          message: 'Expected a nonnegative integer count and level 0–4',
        },
      ]);
    }
  }
  const stats = computeStats(data.weeks);
  const maxCount =
    settings.normalization.kind === 'fixed'
      ? settings.normalization.maxCount
      : computeP90Max(grid.map((cell) => cell.count));
  const enriched = enrichGridCells100(grid, data, { kind: 'fixed', maxCount });
  const isoCells = toIsoCells(enriched, getTerrainPalette100('light'), 0, 0);
  const cells: SceneCell[] = isoCells.map((cell) => {
    if (cell.date === undefined || cell.count === undefined || cell.absoluteWeek === undefined) {
      throw new InputValidationError([
        { path: 'cells', message: 'Expected date-positioned contribution cells' },
      ]);
    }
    return {
      date: cell.date,
      count: cell.count,
      week: cell.week,
      day: cell.day,
      absoluteWeek: cell.absoluteWeek,
      level100: cell.level100,
      rewardTier: getDailyRewardTier(cell.count),
      height: cell.height,
      isoX: cell.isoX,
      isoY: cell.isoY,
    };
  });
  const root = `layout-v2:${data.username.trim().toLowerCase()}:${settings.layoutSeed ?? ''}`;
  const seed = hash(root);
  const firstAbsoluteWeek = Math.min(...cells.map((cell) => cell.absoluteWeek));
  const weekCount = cells.length ? Math.max(...cells.map((cell) => cell.week)) + 1 : 0;
  const biomeMap = generateBiomeMap(weekCount, 7, hash(`${root}:biome`), firstAbsoluteWeek);
  const epics = selectEpicBuildings(isoCells, hash(`${root}:wonder`), stats, biomeMap);
  const wonders = wonderScenePlacements(epics.placed, isoCells, stats);
  const selected = selectAssetPlacements(isoCells, seed, {
    variantSeed: hash(`${root}:variant`),
    biomeMap,
    hemisphere: settings.hemisphere,
    density: settings.density,
    excludeCells: epics.epicCells,
    villageStyle: settings.style,
  });
  const placements = [
    ...selected.filter((asset) => asset.cell.count !== 0).map(assetScenePlacement),
    ...gardenPlacements(cells, seed, settings, biomeMap),
  ].sort((a, b) => a.id.localeCompare(b.id));
  const paths = neighborhoodPaths(cells, placements, biomeMap);
  const rewards = dailyRewardPlacements(cells);
  return {
    schemaVersion: 1,
    layoutVersion: 2,
    username: data.username,
    year: data.year,
    fromDate: stats.fromDate,
    toDate: stats.toDate,
    settings,
    normalization: {
      kind: settings.normalization.kind,
      maxCount,
      source: settings.normalization.kind === 'fixed' ? 'explicit-fixed' : 'relative-p90',
    },
    stats,
    seed: { root, policy: 'username-date-v2' },
    cells,
    biomes: cells.flatMap((cell) => {
      const biome = biomeMap.get(`${cell.week},${cell.day}`);
      return biome ? [{ week: cell.week, day: cell.day, biome }] : [];
    }),
    placements,
    wonders,
    rewards,
    neighborhoodPaths: paths,
    bounds: sceneBounds(cells, [...placements, ...wonders, ...rewards], paths),
  };
}
