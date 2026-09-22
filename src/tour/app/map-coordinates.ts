import type { TourModel } from '../types.js';

type MapSize = { readonly width: number; readonly height: number };
export type MapPosition = { readonly x: number; readonly z: number };
type MapPixel = { readonly x: number; readonly y: number };
const INSET = 10;

function mapFrame(bounds: TourModel['bounds'], size: MapSize) {
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxZ - bounds.minZ;
  const scale = Math.min((size.width - INSET * 2) / width, (size.height - INSET * 2) / height);
  return {
    scale,
    left: (size.width - width * scale) / 2,
    top: (size.height - height * scale) / 2,
  };
}

export function projectMapPoint(
  bounds: TourModel['bounds'],
  size: MapSize,
  point: MapPosition,
): MapPixel {
  const frame = mapFrame(bounds, size);
  return {
    x: frame.left + (point.x - bounds.minX) * frame.scale,
    y: frame.top + (point.z - bounds.minZ) * frame.scale,
  };
}

export function unprojectMapPoint(
  bounds: TourModel['bounds'],
  size: MapSize,
  point: MapPixel,
): MapPosition | null {
  const frame = mapFrame(bounds, size);
  if (
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.y) ||
    point.x < frame.left ||
    point.x > size.width - frame.left ||
    point.y < frame.top ||
    point.y > size.height - frame.top
  )
    return null;
  return {
    x: bounds.minX + (point.x - frame.left) / frame.scale,
    z: bounds.minZ + (point.y - frame.top) / frame.scale,
  };
}
