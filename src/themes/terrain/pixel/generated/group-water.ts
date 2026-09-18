import type { PixelSprite } from '../types.js';
import { sprites as boat } from './boat.js';
import { sprites as buoy } from './buoy.js';
import { sprites as canal } from './canal.js';
import { sprites as coral } from './coral.js';
import { sprites as crab } from './crab.js';
import { sprites as dock } from './dock.js';
import { sprites as fish } from './fish.js';
import { sprites as fishSchool } from './fishSchool.js';
import { sprites as frozenPond } from './frozenPond.js';
import { sprites as jellyfish } from './jellyfish.js';
import { sprites as kelp } from './kelp.js';
import { sprites as lighthouse } from './lighthouse.js';
import { sprites as pondLily } from './pondLily.js';
import { sprites as reeds } from './reeds.js';
import { sprites as sailboat } from './sailboat.js';
import { sprites as seagull } from './seagull.js';
import { sprites as turtle } from './turtle.js';
import { sprites as waves } from './waves.js';
import { sprites as whale } from './whale.js';
export const sprites: Readonly<Record<string, readonly PixelSprite[]>> = {
  boat,
  buoy,
  canal,
  coral,
  crab,
  dock,
  fish,
  fishSchool,
  frozenPond,
  jellyfish,
  kelp,
  lighthouse,
  pondLily,
  reeds,
  sailboat,
  seagull,
  turtle,
  waves,
  whale,
};
