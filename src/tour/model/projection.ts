import { THH, THW } from '../../themes/terrain/scene/projection.js';
import type { Vec3 } from '../../world/model/geometry-types.js';

export const TOUR_CELL_SIZE = 4;
export const TOUR_DEPTH_SCALE = TOUR_CELL_SIZE / (THW * 2);

export function tourPoint(x: number, y: number): Vec3 {
  return {
    x: ((x / THW + y / THH) / 2) * TOUR_CELL_SIZE,
    y: 0,
    z: ((y / THH - x / THW) / 2) * TOUR_CELL_SIZE,
  };
}
