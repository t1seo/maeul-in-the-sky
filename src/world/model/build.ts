import { dayEntities } from './assets.js';
import { assertSceneComplexity } from './complexity.js';
import { prepareDays } from './calendar.js';
import { prepareCircularTerrain } from './circular-terrain.js';
import { circularSettlement } from './circular-settlement.js';
import { circularTransit } from './circular-transit.js';
import { discoveriesFor, prepareRewards } from './events.js';
import { prepareInput } from './input.js';
import { boundsOf, digest } from './math.js';
import { collectRecipes } from './model-keys.js';
import { repositoryEntities } from './repositories.js';
import { settlementEntities } from './settlement.js';
import { prepareTerrain } from './terrain.js';
import { prepareTransit } from './transit.js';
import type { WorldInput, WorldScene } from './types.js';

export function buildWorld(input: WorldInput): WorldScene {
  const prepared = prepareInput(input);
  const { snapshot, settings, range } = prepared;
  const seed = `${snapshot.username}:${settings.layoutSeed}`;
  const days = prepareDays(prepared);
  const circle = settings.layout === 'seasonal-circle';
  const geography = circle
    ? prepareCircularTerrain(days, prepared)
    : prepareTerrain(days, prepared);
  const transit = circle
    ? circularTransit(geography.terrain.tiles, days, settings, seed)
    : prepareTransit(geography.months, days, seed);
  const rewards = prepareRewards(days, geography.months, settings, seed);
  const settlement = circle
    ? circularSettlement(geography, days, settings, seed)
    : {
        entities: settlementEntities(geography.months, days, settings, seed),
        projectTiles: geography.projectTiles,
      };
  const baseEntities = [
    ...dayEntities(days, geography.terrain.tiles, settings, seed),
    ...settlement.entities,
    ...transit.entities,
    ...rewards.entities,
  ];
  const projects = repositoryEntities(
    prepared,
    geography.months,
    seed,
    baseEntities,
    settlement.projectTiles,
  );
  const entities = [...baseEntities, ...projects.entities].sort((a, b) => a.id.localeCompare(b.id));
  const events = [...rewards.events, ...projects.events].sort(
    (a, b) => a.startsOn.localeCompare(b.startsOn) || a.id.localeCompare(b.id),
  );
  const modelRecipes = collectRecipes([
    ...entities.map((entity) => entity.modelKey),
    ...transit.actors.map((actor) => actor.modelKey),
  ]);
  const sourceDigest = digest({
    username: snapshot.username,
    year: snapshot.year,
    range,
    settings,
    days: snapshot.weeks.flatMap((week) => week.days).map(({ date, count }) => ({ date, count })),
    contextDays: prepared.contextDays,
    repositories: prepared.repositories,
  });
  const scene: WorldScene = {
    schemaVersion: 1,
    generatorVersion: 1,
    modelVersion: 1,
    worldId: `world:${snapshot.username}:${snapshot.year}:${digest(settings.layoutSeed)}`,
    sourceDigest,
    username: snapshot.username,
    year: snapshot.year,
    range,
    settings,
    days,
    islands: geography.islands,
    regions: geography.regions,
    terrain: geography.terrain,
    entities,
    routeNodes: transit.routeNodes,
    routes: transit.routes,
    actors: transit.actors,
    events,
    discoveries: discoveriesFor(entities),
    modelRecipes,
    bounds: boundsOf(
      [
        ...geography.terrain.tiles.map((tile) => tile.position),
        ...geography.terrain.waterways.flatMap((water) => water.points),
        ...entities.map((entity) => entity.position),
        ...(circle
          ? entities
              .filter((entity) => entity.id.startsWith('scenery:circle:'))
              .map((entity) => ({
                ...entity.position,
                y: entity.position.y + entity.scale.y * 1.5,
              }))
          : []),
      ],
      2,
    ),
  };
  assertSceneComplexity(scene);
  return scene;
}
