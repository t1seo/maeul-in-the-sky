import type { IsoCell } from '../blocks.js';
import type { AssetType } from './types.js';
import { seededRandom } from '../../../utils/math.js';
import { assetDateSeed } from './date-seed.js';

function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function absolutePosition(cell: IsoCell): { readonly week: number; readonly day: number } {
  if (!cell.date) return cell;
  const ordinal = Math.floor(Date.parse(`${cell.date}T00:00:00Z`) / 86_400_000) + 4;
  return { week: Math.floor(ordinal / 7), day: modulo(ordinal, 7) };
}

export function primaryFocalSite(cell: IsoCell, seed: number): boolean {
  const { week, day } = absolutePosition(cell);
  const rank = (w: number, d: number) => assetDateSeed(seed, `${w},${d}`, 'primary-focal');
  const value = rank(week, day);
  for (let w = -1; w <= 1; w++) {
    for (let d = -1; d <= 1; d++) {
      if (w === 0 && d === 0) continue;
      if (rank(week + w, day + d) <= value) return false;
    }
  }
  return true;
}

export function spatialPrimaryType(
  pool: readonly AssetType[],
  cell: IsoCell,
  key: string,
  seed: number,
): AssetType {
  const { week, day } = absolutePosition(cell);
  const colors = Math.max(1, Math.min(4, Math.floor(pool.length / 2)));
  const color =
    colors === 4
      ? modulo(week, 2) * 2 + modulo(day, 2)
      : modulo(week + day * (colors === 3 ? 2 : 1), colors);
  const ranked = pool
    .map((type) => ({
      type,
      rank: assetDateSeed(seed, type, 'primary-order'),
    }))
    .sort((a, b) => a.rank - b.rank || a.type.localeCompare(b.type));
  const candidates = ranked.filter((_, index) => index % colors === color);
  const choice = seededRandom(assetDateSeed(seed, key, 'primary-catalog'))();
  return candidates[Math.floor(choice * candidates.length)].type;
}
