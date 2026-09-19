import type { Vec3, WorldScene, WorldView } from '../../model/types.js';

export type DetailPolicy = {
  readonly signature: string;
  readonly minimum: number;
  readonly full: (id: string, regionId: string, position: Vec3) => boolean;
};

export function detailPolicy(scene: WorldScene, view: WorldView): DetailPolicy {
  const span = Math.max(
    scene.bounds.max.x - scene.bounds.min.x,
    scene.bounds.max.z - scene.bounds.min.z,
  );
  const months = new Map(scene.regions.map((region) => [region.id, region.monthKey]));
  const focus = view.focus;
  const focusedRegion =
    focus.kind === 'entity'
      ? scene.entities.find((entity) => entity.id === focus.entityId)?.regionId
      : undefined;
  return {
    signature: JSON.stringify([focus, view.camera.zoom, view.camera.target, view.quality]),
    minimum: span / (view.quality === 'high' ? 850 : 600),
    full: (id, regionId, position) => {
      if (span <= 18 || (view.quality === 'high' && view.camera.zoom >= 32)) return true;
      if (
        view.camera.zoom > 2.3 &&
        Math.hypot(position.x - view.camera.target.x, position.z - view.camera.target.z) <
          (span / view.camera.zoom) * 0.7
      )
        return true;
      switch (focus.kind) {
        case 'world':
          return false;
        case 'month':
          return months.get(regionId) === focus.monthKey;
        case 'day':
          return months.get(regionId) === focus.date.slice(0, 7);
        case 'entity':
          return regionId === focusedRegion || id === focus.entityId;
        case 'actor':
          return id === focus.actorId;
        default: {
          const exhaustive: never = focus;
          return exhaustive;
        }
      }
    },
  };
}
