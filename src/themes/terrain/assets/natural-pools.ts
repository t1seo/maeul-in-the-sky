import type { AssetPool } from './types.js';

export function getNaturalPool(level: number): AssetPool | undefined {
  if (level <= 4)
    return { types: ['rock', 'boulder', 'stump', 'deadTree', 'puddle'], chance: 0.08 };
  if (level <= 8)
    return { types: ['rock', 'boulder', 'bush', 'stump', 'deadTree', 'signpost'], chance: 0.13 };
  if (level <= 14)
    return {
      types: [
        'whale',
        'fish',
        'fishSchool',
        'boat',
        'seagull',
        'dock',
        'waves',
        'kelp',
        'coral',
        'jellyfish',
        'turtle',
        'crab',
        'buoy',
      ],
      chance: 0.21,
    };
  if (level <= 22)
    return {
      types: [
        'fish',
        'fishSchool',
        'boat',
        'seagull',
        'waves',
        'dock',
        'kelp',
        'coral',
        'turtle',
        'sailboat',
        'lighthouse',
        'crab',
        'buoy',
      ],
      chance: 0.24,
    };
  if (level <= 27)
    return {
      types: [
        'rock',
        'boulder',
        'flower',
        'bush',
        'bird',
        'driftwood',
        'sandcastle',
        'tidePools',
        'heron',
        'shellfish',
        'cattail',
        'frog',
        'lily',
      ],
      chance: 0.21,
    };
  if (level <= 30)
    return {
      types: [
        'bush',
        'flower',
        'rock',
        'fence',
        'driftwood',
        'tidePools',
        'heron',
        'cattail',
        'frog',
        'lily',
        'puddle',
      ],
      chance: 0.24,
    };
  if (level <= 36)
    return {
      types: [
        'bush',
        'flower',
        'mushroom',
        'deer',
        'bird',
        'rabbit',
        'fox',
        'butterfly',
        'wildflowerPatch',
        'tallGrass',
        'signpost',
        'puddle',
      ],
      chance: 0.29,
    };
  if (level <= 42)
    return {
      types: [
        'pine',
        'deciduous',
        'bush',
        'mushroom',
        'flower',
        'deer',
        'rabbit',
        'fox',
        'butterfly',
        'beehive',
        'birch',
        'haybale',
        'tallGrass',
        'lantern',
      ],
      chance: 0.33,
    };
  if (level <= 52)
    return {
      types: [
        'pine',
        'pine',
        'deciduous',
        'willow',
        'bird',
        'bush',
        'owl',
        'squirrel',
        'moss',
        'fern',
        'berryBush',
        'log',
        'woodpile',
      ],
      chance: 0.39,
    };
  if (level <= 58)
    return {
      types: [
        'pine',
        'deciduous',
        'willow',
        'palm',
        'bird',
        'pine',
        'stump',
        'owl',
        'moss',
        'fern',
        'deadTree',
        'log',
        'spider',
        'campfire',
      ],
      chance: 0.42,
    };
  if (level <= 65)
    return {
      types: [
        'deciduous',
        'willow',
        'pine',
        'palm',
        'bird',
        'mushroom',
        'squirrel',
        'berryBush',
        'fern',
        'moss',
        'log',
        'woodpile',
      ],
      chance: 0.36,
    };
  return undefined;
}
