import { getAssetCatalogEntry } from './catalog.js';
import type { AssetType, PlacedAsset } from './types.js';

export function dailyDecorationOffset(
  primary: PlacedAsset,
  type: AssetType,
  side: number,
): { readonly ox: number; readonly oy: number } | undefined {
  const bounds = getAssetCatalogEntry(type).bounds;
  if (bounds.width > 6 || bounds.height > 7) return undefined;
  const occupied = getAssetCatalogEntry(primary.type).bounds;
  const y = 3 - bounds.height;
  for (const right of side < 0.5 ? [false, true] : [true, false]) {
    const x = right ? 7.6 - bounds.width : -7.6;
    const separate =
      x + bounds.width + 0.3 <= occupied.x ||
      x >= occupied.x + occupied.width + 0.3 ||
      y + bounds.height + 0.3 <= occupied.y ||
      y >= occupied.y + occupied.height + 0.3;
    if (separate) return { ox: x - bounds.x, oy: y - bounds.y };
  }
  return undefined;
}
