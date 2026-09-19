import { entityOnTile } from './assets.js';
import { monthPoint } from './landform.js';
import { edgeScenery } from './scenery.js';
import type { MonthTerrain } from './terrain.js';
import type { WorldDay, WorldEntity, WorldSettings, WorldTile } from './types.js';

export function monthTile(month: MonthTerrain, x: number, z: number): WorldTile {
  if (month.plotLookup) {
    const tile = month.plotLookup.get(`${x},${z}`);
    if (!tile) throw new RangeError(`Missing circular plot in ${month.monthKey}: ${x},${z}`);
    return tile;
  }
  const target = monthPoint(month.origin, month.rotation, x, z);
  const tile = month.tiles.find(
    (item) => item.position.x === target.x && item.position.z === target.z,
  );
  if (!tile) throw new RangeError(`Missing reserved tile in ${month.monthKey}: ${x},${z}`);
  return tile;
}

export function settlementEntities(
  months: readonly MonthTerrain[],
  days: readonly WorldDay[],
  settings: WorldSettings,
  seed: string,
): readonly WorldEntity[] {
  return months.flatMap((month) => {
    const active = days.filter(
      (day) => day.monthKey === month.monthKey && day.kind === 'observed' && day.count > 0,
    );
    const visibleFrom = active[0]?.date;
    const entities: WorldEntity[] = [
      entityOnTile(
        `scenery:${month.monthKey}:grove`,
        'scenery',
        monthTile(month, 3, 0),
        'grove',
        '0001-01-01',
        seed,
        { catalogId: 'cedarGrove' },
      ),
      entityOnTile(
        `scenery:${month.monthKey}:willow`,
        'scenery',
        monthTile(month, 2, 9),
        'willow',
        '0001-01-01',
        seed,
        { catalogId: 'willow' },
      ),
      entityOnTile(
        `scenery:${month.monthKey}:field`,
        'scenery',
        monthTile(month, 4, 8),
        'rice-terrace',
        '0001-01-01',
        seed,
        { catalogId: 'riceTerrace' },
      ),
    ];
    entities.push(...edgeScenery(month, entities, seed));
    if (!visibleFrom) return entities;
    const homeTile = monthTile(month, 8, 8);
    const home = entityOnTile(
      `settlement:${month.monthKey}:home`,
      'scenery',
      homeTile,
      settings.culture === 'korean' ? 'hanok' : 'house',
      visibleFrom,
      seed,
      { catalogId: settings.culture === 'korean' ? 'hanok' : 'house' },
    );
    const neighbor = entityOnTile(
      `settlement:${month.monthKey}:neighbor`,
      'scenery',
      monthTile(month, 9, 8),
      settings.culture === 'korean' ? 'choga' : 'barn',
      visibleFrom,
      seed,
      { catalogId: settings.culture === 'korean' ? 'choga' : 'barn' },
    );
    entities.push(home, neighbor);
    entities.push(
      entityOnTile(
        `courtyard:${month.monthKey}`,
        'courtyard',
        monthTile(month, 9, 7),
        'courtyard',
        visibleFrom,
        seed,
        { parentId: home.id, catalogId: 'garden' },
      ),
    );
    const terrace = monthTile(month, 8, 9);
    const stairs = entityOnTile(
      `stair:${month.monthKey}`,
      'stair',
      terrace,
      'stair',
      visibleFrom,
      seed,
      { parentId: home.id },
    );
    const delta = {
      x: homeTile.position.x - terrace.position.x,
      y: homeTile.position.y - terrace.position.y,
      z: homeTile.position.z - terrace.position.z,
    };
    const ascent = Math.atan2(delta.x, delta.z) + (delta.y >= 0 ? Math.PI : 0);
    entities.push({
      ...stairs,
      position: {
        x: (homeTile.position.x + terrace.position.x) / 2,
        y: Math.min(homeTile.position.y, terrace.position.y),
        z: (homeTile.position.z + terrace.position.z) / 2,
      },
      yaw: ascent,
      scale: {
        x: 0.6,
        y: Math.max(0.015, Math.abs(delta.y)),
        z: 1.25,
      },
    });
    const cityDate = active[11]?.date;
    if (cityDate)
      entities.push(
        entityOnTile(
          `settlement:${month.monthKey}:tower`,
          'scenery',
          monthTile(month, 10, 2),
          'tower',
          cityDate,
          seed,
          { catalogId: 'clocktower' },
        ),
      );
    return entities;
  });
}
