import type { AssetRenderer, AssetType } from '../types.js';
import { svgCedarGrove } from './nature-cedar.js';
import { svgAncientOak } from './nature-oak.js';
import { svgBambooThicket } from './nature-bamboo.js';
import { svgWildflowerMeadow } from './nature-meadow.js';
import { svgLotusPond } from './nature-lotus.js';
import { svgReedMarsh } from './nature-reeds.js';
import { svgAlpineRocks } from './nature-rocks.js';
import { svgWillowPond } from './nature-willow.js';

export const NATURE_RENDERERS = {
  cedarGrove: svgCedarGrove,
  ancientOak: svgAncientOak,
  wildflowerMeadow: svgWildflowerMeadow,
  bambooThicket: svgBambooThicket,
  lotusPond: svgLotusPond,
  reedMarsh: svgReedMarsh,
  alpineRocks: svgAlpineRocks,
  willowPond: svgWillowPond,
} as const satisfies Partial<Record<AssetType, AssetRenderer>>;
