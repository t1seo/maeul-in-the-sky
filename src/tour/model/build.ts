import type { TerrainScene } from '../../core/scene-types.js';
import {
  liquidSurfaceCells,
  waterfallOutlets,
} from '../../themes/terrain/effects/water-topology.js';
import { getTerrainPalette100 } from '../../themes/terrain/palette.js';
import { datePeakSeason } from '../../themes/terrain/scene/season.js';
import type { TourCell, TourModel, TourPlacement } from '../types.js';
import { assertTourDates } from './capacity.js';
import { TOUR_CELL_SIZE, TOUR_DEPTH_SCALE, tourPoint } from './projection.js';
import { seasonalStops } from './stops.js';

export function buildTourModel(scene: TerrainScene): TourModel {
  assertTourDates(scene.cells.map((cell) => cell.date));
  const hemisphere = scene.settings.hemisphere;
  const palette = getTerrainPalette100('light');
  const isoCells = scene.cells.map((cell) => ({
    ...cell,
    colors: palette.getElevation(cell.level100),
  }));
  const biomes = new Map(scene.biomes.map((entry) => [`${entry.week},${entry.day}`, entry.biome]));
  const liquid = new Set(liquidSurfaceCells(isoCells, biomes, hemisphere).map((cell) => cell.date));
  const cells: readonly TourCell[] = scene.cells.map((source) => {
    const season = datePeakSeason(source.date, hemisphere);
    const surface = liquid.has(source.date)
      ? 'water'
      : source.level100 >= 9 && source.level100 <= 22
        ? 'ice'
        : season === 'winter'
          ? 'snow'
          : source.level100 < 9
            ? 'earth'
            : 'grass';
    return {
      source,
      x: source.week * TOUR_CELL_SIZE,
      z: source.day * TOUR_CELL_SIZE,
      depth: source.height * TOUR_DEPTH_SCALE,
      surface,
      season,
    };
  });
  const placements = [
    ...scene.placements.map<TourPlacement>((source) => ({
      source,
      position: tourPoint(source.cx, source.cy),
      season: datePeakSeason(source.anchorDate, hemisphere),
      kind: 'asset',
    })),
    ...scene.wonders.map<TourPlacement>((source) => ({
      source,
      position: tourPoint(source.cx, source.cy),
      season: datePeakSeason(source.anchorDate, hemisphere),
      kind: 'wonder',
    })),
  ];
  const half = TOUR_CELL_SIZE / 2;
  return {
    scene,
    cellSize: TOUR_CELL_SIZE,
    cells,
    placements,
    paths: scene.neighborhoodPaths.map((source) => ({
      source,
      points: source.points.map((point) => tourPoint(point.x, point.y)),
    })),
    falls: waterfallOutlets(isoCells, biomes, hemisphere).flatMap((outlet) =>
      outlet.cell.date
        ? [
            {
              position: tourPoint(outlet.x, outlet.y),
              edge: outlet.edge,
              drop: outlet.drop * TOUR_DEPTH_SCALE,
              date: outlet.cell.date,
            },
          ]
        : [],
    ),
    stops: seasonalStops(scene, cells),
    bounds: {
      minX: Math.min(...cells.map((cell) => cell.x)) - half,
      maxX: Math.max(...cells.map((cell) => cell.x)) + half,
      minZ: Math.min(...cells.map((cell) => cell.z)) - half,
      maxZ: Math.max(...cells.map((cell) => cell.z)) + half,
    },
  };
}
