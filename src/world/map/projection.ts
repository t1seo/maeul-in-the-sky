import { clamp } from '../../utils/math.js';
import type {
  Vec3,
  WorldBounds,
  WorldFocus,
  WorldFrame,
  WorldScene,
  WorldTile,
  WorldView,
} from '../model/types.js';

export type MapPoint = { readonly x: number; readonly y: number };
export type MapTransform = MapPoint & { readonly scale: number };
export type MapViewport = { readonly width: number; readonly height: number };
export const MAP_WIDTH = 1200;
export const MAP_HEIGHT = 780;
export const MAP_VIEWPORT: MapViewport = { width: MAP_WIDTH, height: MAP_HEIGHT };

export function project(position: Vec3): MapPoint {
  return { x: (position.x - position.z) * 28, y: (position.x + position.z) * 14 - position.y * 28 };
}

export function unprojectDelta(x: number, y: number): Vec3 {
  return { x: x / 56 + y / 28, y: 0, z: y / 28 - x / 56 };
}

export function boundsCenter(bounds: WorldBounds): Vec3 {
  return {
    x: (bounds.min.x + bounds.max.x) / 2,
    y: (bounds.min.y + bounds.max.y) / 2,
    z: (bounds.min.z + bounds.max.z) / 2,
  };
}

function projectedSize(bounds: WorldBounds): MapPoint {
  return {
    x: Math.max(120, (bounds.max.x - bounds.min.x + bounds.max.z - bounds.min.z) * 28 + 110),
    y: Math.max(
      100,
      (bounds.max.x - bounds.min.x + bounds.max.z - bounds.min.z) * 14 +
        (bounds.max.y - bounds.min.y) * 28 +
        100,
    ),
  };
}

export function mapTransform(
  scene: WorldScene,
  view: WorldView,
  viewport: MapViewport = MAP_VIEWPORT,
): MapTransform {
  const size = projectedSize(scene.bounds);
  const scale =
    Math.min(
      (viewport.width * 1070) / MAP_WIDTH / size.x,
      (viewport.height * 570) / MAP_HEIGHT / size.y,
    ) * clamp(view.camera.zoom, 0.45, 12);
  const center = project(view.camera.target);
  return {
    x: viewport.width / 2 - center.x * scale,
    y: viewport.height * 0.55 - center.y * scale,
    scale,
  };
}

function focusZoom(
  scene: WorldScene,
  view: WorldView,
  viewport: MapViewport,
  size: MapPoint,
  maximum: number,
): number {
  const base = mapTransform(
    scene,
    { ...view, camera: { ...view.camera, zoom: 1 } },
    viewport,
  ).scale;
  const desired = Math.min((viewport.width * 0.8) / size.x, (viewport.height * 0.72) / size.y);
  return clamp(desired / base, 0.45, maximum);
}

function monthSize(tiles: readonly WorldTile[], fallback: WorldBounds): MapPoint {
  if (tiles.length === 0) return projectedSize(fallback);
  const corners = tiles.flatMap((tile) =>
    [-0.5, 0.5].flatMap((x) =>
      [-0.5, 0.5].map((z) =>
        project({
          x: tile.position.x + x * tile.size,
          y: tile.position.y + tile.activityHeight,
          z: tile.position.z + z * tile.size,
        }),
      ),
    ),
  );
  return {
    x: Math.max(...corners.map((point) => point.x)) - Math.min(...corners.map((point) => point.x)),
    y:
      Math.max(...corners.map((point) => point.y)) -
      Math.min(...corners.map((point) => point.y)) +
      90,
  };
}

export function focusView(
  scene: WorldScene,
  frame: WorldFrame,
  view: WorldView,
  focus: WorldFocus,
  viewport: MapViewport = MAP_VIEWPORT,
): WorldView {
  let target: Vec3 | undefined;
  let zoom: number;
  switch (focus.kind) {
    case 'world':
      target = boundsCenter(scene.bounds);
      zoom = 1;
      break;
    case 'month': {
      const regions = scene.regions.filter((region) => region.monthKey === focus.monthKey);
      const points = regions.flatMap((region) => region.boundary);
      if (points.length === 0) return view;
      const bounds = {
        min: {
          x: Math.min(...points.map((point) => point.x)),
          y: scene.bounds.min.y,
          z: Math.min(...points.map((point) => point.z)),
        },
        max: {
          x: Math.max(...points.map((point) => point.x)),
          y: scene.bounds.max.y,
          z: Math.max(...points.map((point) => point.z)),
        },
      };
      target = boundsCenter(bounds);
      const ids = new Set(regions.map((region) => region.id));
      const tiles = frame.terrain.tiles.filter((tile) => ids.has(tile.regionId));
      zoom = focusZoom(scene, view, viewport, monthSize(tiles, bounds), 8);
      break;
    }
    case 'day': {
      const tile = frame.terrain.tiles.find((entry) => entry.date === focus.date);
      target = tile?.position;
      zoom = tile
        ? focusZoom(scene, view, viewport, { x: tile.size * 56 + 70, y: tile.size * 28 + 110 }, 12)
        : view.camera.zoom;
      break;
    }
    case 'entity':
      target = frame.entities.find((entity) => entity.id === focus.entityId)?.position;
      zoom = 4;
      break;
    case 'actor':
      target = frame.actors.find((actor) => actor.id === focus.actorId)?.position;
      zoom = 4;
      break;
    default:
      return exhaustive(focus);
  }
  if (!target) return view;
  const offset = {
    x: view.camera.position.x - view.camera.target.x,
    y: view.camera.position.y - view.camera.target.y,
    z: view.camera.position.z - view.camera.target.z,
  };
  return {
    ...view,
    focus,
    followActorId: focus.kind === 'actor' ? focus.actorId : undefined,
    camera: {
      target,
      zoom,
      position: { x: target.x + offset.x, y: target.y + offset.y, z: target.z + offset.z },
    },
  };
}

export function moveCamera(view: WorldView, delta: Vec3, zoom = view.camera.zoom): WorldView {
  const move = (position: Vec3): Vec3 => ({
    x: position.x + delta.x,
    y: position.y + delta.y,
    z: position.z + delta.z,
  });
  return {
    ...view,
    camera: {
      position: move(view.camera.position),
      target: move(view.camera.target),
      zoom: clamp(zoom, 0.45, 12),
    },
  };
}

export function exhaustive(value: never): never {
  throw new TypeError(`Unsupported world map variant: ${String(value)}`);
}
