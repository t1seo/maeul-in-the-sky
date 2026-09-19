import { entityOnTile } from './assets.js';
import { hashKey, pathLength } from './math.js';
import { monthTile } from './settlement.js';
import type { MonthTerrain } from './terrain.js';
import type {
  WorldActor,
  WorldDay,
  WorldEntity,
  WorldModelFamily,
  WorldRoute,
  WorldRouteNode,
} from './types.js';

export type Transit = {
  readonly entities: readonly WorldEntity[];
  readonly routeNodes: readonly WorldRouteNode[];
  readonly routes: readonly WorldRoute[];
  readonly actors: readonly WorldActor[];
};

export function prepareTransit(
  months: readonly MonthTerrain[],
  days: readonly WorldDay[],
  seed: string,
): Transit {
  const entities: WorldEntity[] = [];
  const routeNodes: WorldRouteNode[] = [];
  const routes: WorldRoute[] = [];
  const actors: WorldActor[] = [];
  for (const month of months) {
    const monthDays = days.filter(
      (day) => day.monthKey === month.monthKey && day.kind === 'observed' && day.count > 0,
    );
    const first = monthDays[0]?.date;
    const ferryDate = monthDays.find(
      (day) => day.kind === 'observed' && day.consistency.tier >= 1,
    )?.date;
    const trainDate = monthDays.find(
      (day) => day.kind === 'observed' && day.consistency.tier >= 2,
    )?.date;
    for (const kind of ['walk', 'rail', 'water'] as const) {
      const points = Array.from(
        { length: 8 },
        (_, index) =>
          monthTile(
            month,
            kind === 'water' ? -1 : index + 2,
            kind === 'water' ? index + 1 : kind === 'rail' ? 1 : 2,
          ).position,
      );
      const id = `route:${month.monthKey}:${kind}`;
      const nodeIds = points.map((position, index) => {
        const nodeId = `node:${month.monthKey}:${kind}:${index}`;
        const endpoint = index === 0 || index === points.length - 1;
        const role = endpoint
          ? kind === 'rail'
            ? 'station'
            : kind === 'water'
              ? 'dock'
              : 'junction'
          : 'junction';
        const tile = monthTile(
          month,
          kind === 'water' ? 1 : index + 2,
          kind === 'water' ? index + 1 : 0,
        );
        const entity =
          role === 'station' || role === 'dock'
            ? entityOnTile(
                `${role}:${month.monthKey}:${index}`,
                role,
                tile,
                role,
                '0001-01-01',
                seed,
              )
            : undefined;
        routeNodes.push({
          id: nodeId,
          islandId: month.islandId,
          position,
          role,
          ...(entity ? { entityId: entity.id } : {}),
        });
        if (entity) {
          entities.push(entity);
          if (role === 'dock') {
            const pier = entityOnTile(
              `pier:${month.monthKey}:${index}`,
              'pier',
              monthTile(month, 0, index + 1),
              'pier',
              '0001-01-01',
              seed,
              { parentId: entity.id, catalogId: 'dock' },
            );
            entities.push({
              ...pier,
              yaw: Math.PI / 2 - (month.rotation * Math.PI) / 2,
              scale: { x: 0.8, y: 0.5, z: 1.8 },
            });
          }
        }
        return nodeId;
      });
      routes.push({
        id,
        kind,
        nodeIds,
        points,
        length: pathLength(points),
        visibleFrom: '0001-01-01',
        loop: false,
      });
      const addActor = (
        actorKind: WorldActor['kind'],
        family: WorldModelFamily,
        visibleFrom: string,
        speed: number,
      ): void => {
        const actorId = `actor:${month.monthKey}:${actorKind}`;
        const hash = hashKey(`${seed}:${actorId}`);
        actors.push({
          id: actorId,
          kind: actorKind,
          modelKey: `${family}:${hash % 3}`,
          routeId: id,
          speed,
          phase: (hash % 1000) / 1000,
          visibleFrom,
        });
      };
      if (kind === 'walk') {
        addActor('wildlife', 'deer', '0001-01-01', 0.25);
        if (first) addActor('resident', 'resident', first, 0.35);
      }
      if (kind === 'water' && ferryDate) addActor('ferry', 'ferry', ferryDate, 0.6);
      if (kind === 'rail' && trainDate) addActor('train', 'train', trainDate, 1.2);
    }
  }
  return { entities, routeNodes, routes, actors };
}
