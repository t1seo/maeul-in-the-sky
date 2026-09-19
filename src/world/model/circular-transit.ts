import { entityOnTile } from './assets.js';
import { calendarSeason } from './dates.js';
import { CIRCLE_ISLAND, CIRCLE_SEASONS, circleKey, circlePoint } from './circular-layout.js';
import { WorldModelError } from './errors.js';
import { hashKey, pathLength } from './math.js';
import type { Transit } from './transit.js';
import type {
  Vec3,
  WorldActor,
  WorldDay,
  WorldEntity,
  WorldModelFamily,
  WorldRoute,
  WorldRouteNode,
  WorldSettings,
  WorldTile,
} from './types.js';

export function circularTransit(
  tiles: readonly WorldTile[],
  days: readonly WorldDay[],
  settings: WorldSettings,
  seed: string,
): Transit {
  const tileByCell = new Map(tiles.map((tile) => [circleKey(tile.position), tile]));
  const getTile = (point: Vec3): WorldTile => {
    const tile = tileByCell.get(circleKey(point));
    if (!tile) throw new WorldModelError('INVALID_WORLD', 'A shared circular route has no tile');
    return tile;
  };
  const entities: WorldEntity[] = [];
  const routeNodes: WorldRouteNode[] = [];
  const routes: WorldRoute[] = [];
  const actors: WorldActor[] = [];
  for (const season of CIRCLE_SEASONS) {
    const active = days.filter(
      (day) =>
        day.kind === 'observed' &&
        day.count > 0 &&
        calendarSeason(day.date, settings.hemisphere) === season,
    );
    const first = active[0]?.date;
    const ferryDate = active.find(
      (day) => day.kind === 'observed' && day.consistency.tier >= 1,
    )?.date;
    const trainDate = active.find(
      (day) => day.kind === 'observed' && day.consistency.tier >= 2,
    )?.date;
    for (const kind of ['walk', 'rail', 'water'] as const) {
      const length = kind === 'walk' ? 20 : kind === 'rail' ? 22 : 8;
      const points = Array.from(
        { length },
        (_, index) =>
          getTile(
            circlePoint(
              season,
              kind === 'walk' ? 1.5 : kind === 'rail' ? 3.5 + index : 9.5,
              kind === 'walk' ? 1.5 + index : kind === 'rail' ? 1.5 : 13.5 + index,
            ),
          ).position,
      );
      const routeId = `route:circle:${season}:${kind}`;
      const nodeIds = points.map((position, index) => {
        const id = `node:circle:${season}:${kind}:${index}`;
        const endpoint = index === 0 || index === points.length - 1;
        const role =
          endpoint && kind !== 'walk' ? (kind === 'rail' ? 'station' : 'dock') : 'junction';
        let entity: WorldEntity | undefined;
        if (role !== 'junction') {
          const tile = getTile(
            circlePoint(
              season,
              kind === 'rail' ? 3.5 + index : 11.5,
              kind === 'rail' ? 2.5 : 13.5 + index,
            ),
          );
          entity = entityOnTile(
            `${role}:circle:${season}:${index}`,
            role,
            tile,
            role,
            '0001-01-01',
            seed,
          );
          entities.push(entity);
          if (role === 'dock') {
            const pierTile = getTile(circlePoint(season, 10.5, 13.5 + index));
            const pier = entityOnTile(
              `pier:circle:${season}:${index}`,
              'pier',
              pierTile,
              'pier',
              '0001-01-01',
              seed,
              { parentId: entity.id, catalogId: 'dock' },
            );
            entities.push({
              ...pier,
              yaw: Math.atan2(tile.position.x - position.x, tile.position.z - position.z),
              scale: { x: 0.8, y: 0.5, z: 1.8 },
            });
          }
        }
        routeNodes.push({
          id,
          islandId: CIRCLE_ISLAND,
          position,
          role,
          ...(entity ? { entityId: entity.id } : {}),
        });
        return id;
      });
      routes.push({
        id: routeId,
        kind,
        nodeIds,
        points,
        length: pathLength(points),
        visibleFrom: '0001-01-01',
        loop: false,
      });
      const actor = (
        kind: WorldActor['kind'],
        family: WorldModelFamily,
        visibleFrom: string,
        speed: number,
      ): void => {
        const id = `actor:circle:${season}:${kind}`;
        const hash = hashKey(`${seed}:${id}`);
        actors.push({
          id,
          kind,
          modelKey: `${family}:${hash % 3}`,
          routeId,
          speed,
          phase: (hash % 1000) / 1000,
          visibleFrom,
        });
      };
      if (kind === 'walk') {
        actor('wildlife', 'deer', '0001-01-01', 0.25);
        if (first) actor('resident', 'resident', first, 0.35);
      }
      if (kind === 'rail' && trainDate) actor('train', 'train', trainDate, 1.2);
      if (kind === 'water' && ferryDate) actor('ferry', 'ferry', ferryDate, 0.6);
    }
  }
  return { entities, routeNodes, routes, actors };
}
