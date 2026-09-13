import type { BiomeContext } from '../biomes.js';
import type { AssetPool } from './types.js';

export function blendWithBiome(pool: AssetPool, ctx: BiomeContext, level: number): AssetPool {
  const types = [...pool.types];
  let chance = pool.chance;

  if (ctx.isRiver) {
    // River cells get water assets adapted to surrounding level
    if (level >= 91) types.push('bridge', 'canal');
    else if (level >= 66) types.push('watermill', 'canal', 'reeds', 'heron');
    else if (level >= 31) types.push('reeds', 'reeds', 'willow', 'frog', 'heron', 'cattail');
    else types.push('reeds', 'pondLily', 'lily', 'frog');
    chance = Math.max(chance, 0.35);
  } else if (ctx.isPond) {
    // Pond cells get pond-specific decorations
    if (level >= 79) types.push('fountain', 'pondLily', 'reeds', 'lily');
    else types.push('pondLily', 'pondLily', 'reeds', 'lily', 'frog', 'cattail');
    chance = Math.max(chance, 0.3);
  } else if (ctx.nearWater) {
    // Adjacent to water: edge vegetation
    if (level >= 79) types.push('fountain', 'gardenTree');
    else types.push('willow', 'reeds', 'bush', 'driftwood', 'heron');
    chance += 0.05;
  }

  if (ctx.forestDensity > 0.3) {
    // Forest overlay: add trees adapted to the level
    const treesToAdd = ctx.forestDensity > 0.6 ? 3 : 1;
    for (let i = 0; i < treesToAdd; i++) {
      if (level >= 91) types.push('gardenTree', 'flower');
      else if (level >= 79) types.push('gardenTree');
      else if (level >= 43) types.push('pine', 'deciduous', 'owl', 'squirrel', 'moss', 'fern');
      else types.push('pine', 'birch');
    }
    chance += ctx.forestDensity * 0.08;
  }

  // Unconditional high-level greenery: towns and cities always get some nature
  if (level >= 96) {
    types.push('gardenTree', 'fountain', 'park');
  } else if (level >= 91) {
    types.push('gardenTree', 'lantern');
  }

  return { types, chance: Math.min(chance, 0.65) };
}
