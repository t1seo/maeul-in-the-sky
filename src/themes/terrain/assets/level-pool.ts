import { clamp } from '../../../utils/math.js';
import { getNaturalPool } from './natural-pools.js';
import { getSettlementPool } from './settlement-pools.js';
import type { AssetPool } from './types.js';

export function getEffectiveLevel(level100: number, density: number): number {
  if (level100 === 0) return 0;
  return clamp(level100 + (density - 5) * 5, 1, 99);
}

export function getLevelPool100(level: number): AssetPool {
  return getNaturalPool(level) ?? getSettlementPool(level);
}
