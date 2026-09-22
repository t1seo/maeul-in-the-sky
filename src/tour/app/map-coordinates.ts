import type { TourModel } from '../types.js';

type MapSize = { readonly width: number; readonly height: number };
export type MapPosition = { readonly x: number; readonly z: number };
type MapPixel = { readonly x: number; readonly y: number };
const INSET = 10;

export function projectMapPoint(
  bounds: TourModel['bounds'],
  size: MapSize,
  point: MapPosition,
): MapPixel {
  return {
    x: INSET + ((point.x - bounds.minX) / (bounds.maxX - bounds.minX)) * (size.width - INSET * 2),
    y: INSET + ((point.z - bounds.minZ) / (bounds.maxZ - bounds.minZ)) * (size.height - INSET * 2),
  };
}

export function unprojectMapPoint(
  bounds: TourModel['bounds'],
  size: MapSize,
  point: MapPixel,
): MapPosition | null {
  if (
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.y) ||
    point.x < INSET ||
    point.x > size.width - INSET ||
    point.y < INSET ||
    point.y > size.height - INSET
  )
    return null;
  return {
    x: bounds.minX + ((point.x - INSET) / (size.width - INSET * 2)) * (bounds.maxX - bounds.minX),
    z: bounds.minZ + ((point.y - INSET) / (size.height - INSET * 2)) * (bounds.maxZ - bounds.minZ),
  };
}
