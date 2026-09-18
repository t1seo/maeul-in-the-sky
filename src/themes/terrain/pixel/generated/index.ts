import type { PixelSprite } from '../types.js';
import { sprites as group0 } from './group-decoration.js';
import { sprites as group1 } from './group-farm.js';
import { sprites as group2 } from './group-shore.js';
import { sprites as group3 } from './group-town.js';
import { sprites as group4 } from './group-village.js';
import { sprites as group5 } from './group-water.js';
import { sprites as group6 } from './group-wonders.js';
import { sprites as group7 } from './group-woodland.js';
export const PIXEL_SPRITES: Readonly<Record<string, readonly PixelSprite[]>> = {
  ...group0,
  ...group1,
  ...group2,
  ...group3,
  ...group4,
  ...group5,
  ...group6,
  ...group7,
};
