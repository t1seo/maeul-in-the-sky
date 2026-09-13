import type { AssetBounds } from '../../src/themes/terrain/assets.js';

export function paddedViewBox(bounds: AssetBounds): AssetBounds {
  const horizontalPadding = Math.max(1, bounds.width * 0.12);
  const verticalPadding = Math.max(1, bounds.height * 0.12);
  return {
    x: bounds.x - horizontalPadding,
    y: bounds.y - verticalPadding,
    width: bounds.width + horizontalPadding * 2,
    height: bounds.height + verticalPadding * 2,
  };
}

export function serializeViewBox(bounds: AssetBounds): string {
  return [bounds.x, bounds.y, bounds.width, bounds.height]
    .map((value) => Number(value.toFixed(3)))
    .join(' ');
}
