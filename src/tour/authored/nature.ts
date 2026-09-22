import type { AuthoredMapping } from './types.js';
import { natureTree } from './nature-trees.js';
import { natureGarden } from './nature-gardens.js';
import { natureStone } from './nature-stones.js';
import { natureWonder } from './nature-wonders.js';
import { natureWetland } from './nature-wetland.js';

export const natureAsset: AuthoredMapping = (placement, fallback) =>
  natureWetland(placement, fallback) ??
  natureTree(placement, fallback) ??
  natureGarden(placement, fallback) ??
  natureStone(placement, fallback) ??
  natureWonder(placement, fallback);
