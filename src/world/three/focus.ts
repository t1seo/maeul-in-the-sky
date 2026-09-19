import { Box3, Vector3 } from 'three';
import type { Vec3, WorldBounds, WorldFocus, WorldFrame, WorldScene } from '../model/types.js';

export function toBounds(bounds: WorldBounds): Box3 {
  return new Box3(
    new Vector3(bounds.min.x, bounds.min.y, bounds.min.z),
    new Vector3(bounds.max.x, bounds.max.y, bounds.max.z),
  );
}

function around(position: Vec3, radius: number): Box3 {
  const center = new Vector3(position.x, position.y + radius / 3, position.z);
  return new Box3().setFromCenterAndSize(center, new Vector3(radius * 2, radius * 1.5, radius * 2));
}

export function focusBounds(world: WorldScene, frame: WorldFrame, focus: WorldFocus): Box3 {
  const fallback = toBounds(world.bounds);
  switch (focus.kind) {
    case 'world':
      return fallback;
    case 'month': {
      const dates = new Set(
        frame.days.filter((day) => day.monthKey === focus.monthKey).map((day) => day.date),
      );
      const tiles = frame.terrain.tiles.filter((tile) => tile.date && dates.has(tile.date));
      if (!tiles.length) return fallback;
      return tiles.reduce((bounds, tile) => bounds.union(around(tile.position, 2)), new Box3());
    }
    case 'day': {
      const tile = frame.terrain.tiles.find((item) => item.date === focus.date);
      return tile ? around(tile.position, 2.6) : fallback;
    }
    case 'entity': {
      const entity = frame.entities.find((item) => item.id === focus.entityId);
      return entity ? around(entity.position, Math.max(2.6, entity.scale.y * 2)) : fallback;
    }
    case 'actor': {
      const actor = frame.actors.find((item) => item.id === focus.actorId);
      return actor ? around(actor.position, 3.6) : fallback;
    }
  }
}
