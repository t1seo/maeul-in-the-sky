import { Resvg } from '@resvg/resvg-js';
import { isAssetType } from '../../src/themes/terrain/assets/catalog.js';
import type { AssetBounds, AssetType } from '../../src/themes/terrain/assets/types.js';

export const NATURE_IDS = [
  'cedarGrove',
  'ancientOak',
  'wildflowerMeadow',
  'bambooThicket',
  'lotusPond',
  'reedMarsh',
  'alpineRocks',
  'willowPond',
] as const;
export const NATURE_SEASONS = [
  ['winter', 2],
  ['spring', 16],
  ['summer', 30],
  ['autumn', 43],
] as const;
const SCALE = 8;
const WIDTH = 160;
const HEIGHT = 192;

export function natureId(id: string): AssetType {
  if (!isAssetType(id)) throw new TypeError(`Nature asset is not registered: ${id}`);
  return id;
}

export function natureRaster(fragment: string): Uint8Array {
  return new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="-10 -20 20 24">${fragment}</svg>`,
    { font: { loadSystemFonts: false } },
  ).render().pixels;
}

export function natureBounds(pixels: Uint8Array): AssetBounds {
  let left = WIDTH;
  let top = HEIGHT;
  let right = 0;
  let bottom = 0;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (pixels[(y * WIDTH + x) * 4 + 3] === 0) continue;
      left = Math.min(left, x);
      right = Math.max(right, x + 1);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y + 1);
    }
  }
  return {
    x: left / SCALE - 10,
    y: top / SCALE - 20,
    width: (right - left) / SCALE,
    height: (bottom - top) / SCALE,
  };
}

export function silhouetteDifference(a: Uint8Array, b: Uint8Array): number {
  let changed = 0;
  let union = 0;
  for (let i = 3; i < a.length; i += 4) {
    const first = a[i] > 127;
    const second = b[i] > 127;
    if (first || second) union++;
    if (first !== second) changed++;
  }
  return changed / union;
}
