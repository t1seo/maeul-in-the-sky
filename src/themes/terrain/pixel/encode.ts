import { PIXEL_GRID_STEP } from './types.js';

export type PixelGrid = {
  readonly width: number;
  readonly height: number;
  readonly x: number;
  readonly y: number;
  readonly colors: readonly number[];
};

// Rectangles are mutable compiler accumulators; the returned paths are immutable.
type Rectangle = { x: number; y: number; width: number; height: number };

export function encodePixelRuns(grid: PixelGrid): ReadonlyMap<number, string> {
  const rectangles = new Map<number, Rectangle[]>();
  const active = new Map<string, Rectangle>();
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width;) {
      const color = grid.colors[y * grid.width + x];
      let end = x + 1;
      while (end < grid.width && grid.colors[y * grid.width + end] === color) end++;
      if (color >= 0) {
        const width = end - x;
        const key = `${color}:${x}:${width}`;
        const previous = active.get(key);
        if (previous && previous.y + previous.height === y) previous.height++;
        else {
          const rectangle = { x, y, width, height: 1 };
          const group = rectangles.get(color) ?? [];
          group.push(rectangle);
          rectangles.set(color, group);
          active.set(key, rectangle);
        }
      }
      x = end;
    }
  }
  return new Map(
    [...rectangles]
      .sort(([a], [b]) => a - b)
      .map(([color, rects]) => [
        color,
        rects
          .map((rect) => {
            const x = grid.x + rect.x * PIXEL_GRID_STEP;
            const y = grid.y + rect.y * PIXEL_GRID_STEP;
            const width = rect.width * PIXEL_GRID_STEP;
            return `M${x},${y}h${width}v${rect.height * PIXEL_GRID_STEP}h${-width}z`;
          })
          .join(''),
      ]),
  );
}
