import type { NeighborhoodPath, SceneCell, TerrainScene } from '../../../core/scene-types.js';
import { hash } from '../../../utils/math.js';
import { unionBounds } from '../scene/bounds.js';
import { consistencyEffectPlacements } from '../scene/consistency.js';
import { buildLandscapeModel } from './model.js';
import { createLandscapeProjection } from './projection.js';
import { planLandscapeSettlements } from './settlements.js';
import { projectedSprite, reprojectPlacement } from './scene-placement.js';
import { riverDistance } from './settlement-geometry.js';
import type { LandscapeRoad, LandscapeSite } from './types.js';
import type { Projection } from './projection.js';

function prepareRoad(
  road: LandscapeRoad,
  cells: readonly SceneCell[],
  projection: Projection,
): NeighborhoodPath | undefined {
  const points = road.points.map(projection.point);
  const start = points[0];
  if (!start || !cells.length) return undefined;
  const nearest = cells.reduce((closest, cell) =>
    Math.hypot(cell.isoX - start.x, cell.isoY - start.y) <
    Math.hypot(closest.isoX - start.x, closest.isoY - start.y)
      ? cell
      : closest,
  );
  const padding = Math.max((road.width * 11 * projection.scale) / 2 + 1, 4) + 4;
  return {
    id: road.id,
    catalogId: 'cobblePath',
    anchorDate: nearest.date,
    week: nearest.week,
    day: nearest.day,
    points,
    drawOrder: Math.max(...road.points.map((point) => point.x + point.z)) + 1.5,
    footprint: unionBounds(
      points.map(({ x, y }) => ({
        x: x - padding,
        y: y - padding,
        width: padding * 2,
        height: padding * 2,
      })),
    ),
  };
}

export function prepareLandscapeScene(scene: TerrainScene): TerrainScene {
  const layout = scene.settings.landscapeLayout ?? 'island';
  const model = buildLandscapeModel(scene.cells, {
    layout,
    seed: hash(`${scene.seed.root}:landscape-v1:${layout}`),
    relief: 1,
    roughness: 0.55,
  });
  const projection = createLandscapeProjection(model);
  const positions = new Map(model.plots.map((plot) => [plot.date, plot.position]));
  const positionFor = (date: string): LandscapeSite => {
    const point = positions.get(date);
    if (!point) throw new Error(`Missing landscape date: ${date}`);
    return point;
  };
  const cells = scene.cells.map((cell) => {
    const position = positionFor(cell.date);
    const point = projection.point(position);
    return { ...cell, isoX: point.x, isoY: point.y, height: position.elevation };
  });
  const settlement = planLandscapeSettlements(model, scene);
  const sprites = new Map(settlement.sprites.map((sprite) => [sprite.id, sprite]));
  const placements = scene.placements.map((placement) =>
    reprojectPlacement(placement, sprites, projection),
  );
  const wonders = scene.wonders.map((placement) =>
    reprojectPlacement(placement, sprites, projection),
  );
  const rewards = scene.rewards?.map((placement) =>
    reprojectPlacement(placement, sprites, projection),
  );
  const consistencyEffects = consistencyEffectPlacements(
    cells.map((cell) => ({ ...cell, height: 0 })),
    scene.seed.root,
    scene.settings.hemisphere,
  );
  const neighborhoodPaths = settlement.roads.flatMap((road) => {
    const path = prepareRoad(road, cells, projection);
    return path ? [path] : [];
  });
  const points = [
    ...model.triangles.flatMap((triangle) => triangle.points),
    ...model.coast.map(({ a }) => ({ ...a, elevation: -8 })),
  ].map(projection.point);
  return {
    ...scene,
    cells,
    biomes: cells.map((cell) => {
      const position = positionFor(cell.date);
      const distanceToRiver = riverDistance(model, position);
      return {
        week: cell.week,
        day: cell.day,
        biome: {
          isRiver: distanceToRiver <= 0,
          isPond: false,
          nearWater: distanceToRiver < 1.5,
          forestDensity: position.biome === 'forest' ? 0.85 : 0.1,
          landscapeBiome: position.biome,
        },
      };
    }),
    placements,
    wonders,
    rewards,
    consistencyEffects,
    neighborhoodPaths,
    bounds: unionBounds([
      ...points.map(({ x, y }) => ({ x, y, width: 1, height: 1 })),
      ...settlement.sprites.map((sprite) => projectedSprite(sprite, projection).footprint),
      ...consistencyEffects.map(({ footprint }) => footprint),
    ]),
    geography: { version: 1, model, settlement },
  };
}
