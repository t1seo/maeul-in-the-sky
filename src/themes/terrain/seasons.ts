/**
 * Seasonal Terrain System
 *
 * Divides the 52-week contribution grid into 8 seasonal zones so the
 * terrain visually transitions through winter -> spring -> summer -> autumn.
 *
 * Zone layout (Northern Hemisphere):
 *   Week:  0--6  7--12  13--19  20--25  26--32  33--38  39--45  46--51
 *   Zone:    0     1      2       3       4       5       6       7
 *   Season: WIN  W->Sp   SPR   Sp->Su   SUM   Su->Au   AUT   Au->W
 *
 * Southern Hemisphere: shift week by +26 (mod 52) before zone lookup.
 * Summer (zone 4) = base palette (no tinting).
 */

import { lerp, clamp } from '../../utils/math.js';

// ── Types ────────────────────────────────────────────────────

export type Hemisphere = 'north' | 'south';

/**
 * Season zone index (0-7).
 * Even zones are peak seasons, odd zones are transitions.
 */
export type SeasonZone = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Peak season identifiers */
export type PeakSeason = 'winter' | 'spring' | 'summer' | 'autumn';

/** Seasonal color tint parameters */
export interface SeasonalTint {
  /** Shift toward a target color (0 = no shift, 1 = full) */
  colorShift: number;
  /** Target color for blending [R, G, B] */
  colorTarget: [number, number, number];
  /** Green channel multiplier (1 = unchanged) */
  greenMul: number;
  /** Warmth: positive adds red and subtracts blue */
  warmth: number;
  /** Snow coverage (0-1), blends terrain toward white */
  snowCoverage: number;
  /** Saturation multiplier (1 = unchanged, >1 = boost, <1 = desaturate) */
  saturation: number;
}

// ── Zone Boundaries ──────────────────────────────────────────

interface ZoneBound {
  zone: SeasonZone;
  start: number;
  end: number;
}

const ZONE_BOUNDS: ZoneBound[] = [
  { zone: 0, start: 0,  end: 6 },   // Winter
  { zone: 1, start: 7,  end: 12 },  // Winter -> Spring
  { zone: 2, start: 13, end: 19 },  // Spring
  { zone: 3, start: 20, end: 25 },  // Spring -> Summer
  { zone: 4, start: 26, end: 32 },  // Summer (base)
  { zone: 5, start: 33, end: 38 },  // Summer -> Autumn
  { zone: 6, start: 39, end: 45 },  // Autumn
  { zone: 7, start: 46, end: 51 },  // Autumn -> Winter
];

// ── Zone Lookup ──────────────────────────────────────────────

/**
 * Get the season zone for a given week, accounting for hemisphere.
 * Southern hemisphere shifts by +26 weeks (6 months).
 */
export function getSeasonZone(week: number, hemisphere: Hemisphere = 'north'): SeasonZone {
  let w = week;
  if (hemisphere === 'south') {
    w = (week + 26) % 52;
  }
  w = clamp(w, 0, 51);

  for (const bound of ZONE_BOUNDS) {
    if (w >= bound.start && w <= bound.end) {
      return bound.zone;
    }
  }
  return 4; // fallback: summer
}

/**
 * Get the peak season name for a zone.
 * Transition zones return the "from" season.
 */
export function getZonePeakSeason(zone: SeasonZone): PeakSeason {
  switch (zone) {
    case 0: case 7: return 'winter';
    case 1: case 2: return 'spring';
    case 3: case 4: return 'summer';
    case 5: case 6: return 'autumn';
  }
}

/**
 * Get the blend factor within a transition zone (0 = start season, 1 = end season).
 * For peak zones, returns 0 (fully that season).
 */
export function getTransitionBlend(week: number, hemisphere: Hemisphere = 'north'): {
  from: PeakSeason;
  to: PeakSeason;
  t: number;
} {
  let w = week;
  if (hemisphere === 'south') {
    w = (week + 26) % 52;
  }
  w = clamp(w, 0, 51);

  const zone = getSeasonZone(week, hemisphere);

  switch (zone) {
    case 0: return { from: 'winter', to: 'winter', t: 0 };
    case 1: {
      const bound = ZONE_BOUNDS[1];
      const t = (w - bound.start) / (bound.end - bound.start);
      return { from: 'winter', to: 'spring', t };
    }
    case 2: return { from: 'spring', to: 'spring', t: 0 };
    case 3: {
      const bound = ZONE_BOUNDS[3];
      const t = (w - bound.start) / (bound.end - bound.start);
      return { from: 'spring', to: 'summer', t };
    }
    case 4: return { from: 'summer', to: 'summer', t: 0 };
    case 5: {
      const bound = ZONE_BOUNDS[5];
      const t = (w - bound.start) / (bound.end - bound.start);
      return { from: 'summer', to: 'autumn', t };
    }
    case 6: return { from: 'autumn', to: 'autumn', t: 0 };
    case 7: {
      const bound = ZONE_BOUNDS[7];
      const t = (w - bound.start) / (bound.end - bound.start);
      return { from: 'autumn', to: 'winter', t };
    }
  }
}

// ── Seasonal Tints ───────────────────────────────────────────

/** Peak season tint definitions */
const SEASON_TINTS: Record<PeakSeason, SeasonalTint> = {
  winter: {
    colorShift: 0.35,
    colorTarget: [238, 242, 248],  // #eef2f8 — snowy white
    greenMul: 0.60,
    warmth: -5,
    snowCoverage: 0.35,
    saturation: 0.65,
  },
  spring: {
    colorShift: 0.05,
    colorTarget: [255, 220, 230],  // pink warmth
    greenMul: 1.15,
    warmth: 5,
    snowCoverage: 0,
    saturation: 1.15,
  },
  summer: {
    colorShift: 0,
    colorTarget: [0, 0, 0],
    greenMul: 1.0,
    warmth: 0,
    snowCoverage: 0,
    saturation: 1.0,
  },
  autumn: {
    colorShift: 0.10,
    colorTarget: [210, 140, 60],   // warm amber
    greenMul: 0.70,
    warmth: 20,
    snowCoverage: 0,
    saturation: 1.05,
  },
};

/**
 * Get the seasonal tint for a given week.
 * Transition zones interpolate between neighboring peak tints.
 */
export function getSeasonalTint(week: number, hemisphere: Hemisphere = 'north'): SeasonalTint {
  const { from, to, t } = getTransitionBlend(week, hemisphere);
  const a = SEASON_TINTS[from];
  const b = SEASON_TINTS[to];
  return lerpTint(a, b, t);
}

/**
 * Interpolate between two seasonal tints.
 */
export function lerpTint(a: SeasonalTint, b: SeasonalTint, t: number): SeasonalTint {
  return {
    colorShift: lerp(a.colorShift, b.colorShift, t),
    colorTarget: [
      Math.round(lerp(a.colorTarget[0], b.colorTarget[0], t)),
      Math.round(lerp(a.colorTarget[1], b.colorTarget[1], t)),
      Math.round(lerp(a.colorTarget[2], b.colorTarget[2], t)),
    ],
    greenMul: lerp(a.greenMul, b.greenMul, t),
    warmth: lerp(a.warmth, b.warmth, t),
    snowCoverage: lerp(a.snowCoverage, b.snowCoverage, t),
    saturation: lerp(a.saturation, b.saturation, t),
  };
}

// ── Color Tinting ────────────────────────────────────────────

/**
 * Apply a seasonal tint to an RGB color.
 * This is the core color transform used by getSeasonalPalette100.
 */
export function applyTint(r: number, g: number, b: number, tint: SeasonalTint): [number, number, number] {
  // 1. Apply saturation adjustment
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  let nr = gray + (r - gray) * tint.saturation;
  let ng = gray + (g - gray) * tint.saturation;
  let nb = gray + (b - gray) * tint.saturation;

  // 2. Apply green multiplier
  ng *= tint.greenMul;

  // 3. Apply warmth (add red, subtract blue)
  nr += tint.warmth;
  nb -= tint.warmth;

  // 4. Blend toward color target
  if (tint.colorShift > 0) {
    nr = lerp(nr, tint.colorTarget[0], tint.colorShift);
    ng = lerp(ng, tint.colorTarget[1], tint.colorShift);
    nb = lerp(nb, tint.colorTarget[2], tint.colorShift);
  }

  // 5. Snow coverage: blend toward white
  if (tint.snowCoverage > 0) {
    nr = lerp(nr, 240, tint.snowCoverage);
    ng = lerp(ng, 244, tint.snowCoverage);
    nb = lerp(nb, 250, tint.snowCoverage);
  }

  return [
    clamp(Math.round(nr), 0, 255),
    clamp(Math.round(ng), 0, 255),
    clamp(Math.round(nb), 0, 255),
  ];
}

/**
 * Apply a seasonal tint to a hex color string.
 * Returns a new hex color string.
 */
export function applyTintToHex(hex: string, tint: SeasonalTint): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const [nr, ng, nb] = applyTint(r, g, b, tint);
  return '#' + [nr, ng, nb].map(c => c.toString(16).padStart(2, '0')).join('');
}

/**
 * Apply a seasonal tint to an "rgb(r,g,b)" string.
 * Returns a new rgb() string. Handles rgba() too (preserves alpha).
 */
export function applyTintToRgb(rgb: string, tint: SeasonalTint): string {
  const m = rgb.match(/(\d+)/g);
  if (!m || m.length < 3) return rgb;
  const [r, g, b] = [+m[0], +m[1], +m[2]];
  const [nr, ng, nb] = applyTint(r, g, b, tint);
  if (m.length >= 4) {
    // rgba
    return `rgba(${nr},${ng},${nb},${m[3].includes('.') ? m[3] : +m[3]})`;
  }
  return `rgb(${nr},${ng},${nb})`;
}

// ── Seasonal Asset Pool Overrides ────────────────────────────

export type SeasonalAssetType =
  // Winter
  | 'snowPine' | 'snowDeciduous' | 'snowman' | 'snowdrift' | 'igloo'
  | 'frozenPond' | 'icicle' | 'sled' | 'snowCoveredRock' | 'bareBush'
  | 'winterBird' | 'firewood'
  // Spring
  | 'cherryBlossom' | 'cherryBlossomSmall' | 'cherryPetals' | 'tulip'
  | 'tulipField' | 'sprout' | 'nest' | 'lamb' | 'crocus' | 'rainPuddle'
  | 'birdhouse' | 'gardenBed'
  // Summer
  | 'parasol' | 'beachTowel' | 'sandcastleSummer' | 'surfboard'
  | 'iceCreamCart' | 'hammock' | 'sunflower' | 'watermelon' | 'sprinkler'
  | 'lemonade' | 'fireflies' | 'swimmingPool'
  // Autumn
  | 'autumnMaple' | 'autumnOak' | 'autumnBirch' | 'autumnGinkgo'
  | 'fallenLeaves' | 'leafSwirl' | 'acorn' | 'cornStalk'
  | 'scarecrowAutumn' | 'harvestBasket' | 'hotDrink' | 'autumnWreath';

/** Assets to remove from pools per season (base assets incompatible with the season) */
const SEASON_REMOVE: Record<PeakSeason, Set<string>> = {
  winter: new Set([
    'flower', 'butterfly', 'wildflowerPatch', 'tulip', 'tulipField',
    'cherryBlossom', 'cherryBlossomSmall', 'cherryPetals', 'crocus',
    'lamb', 'sprout', 'gardenBed', 'birdhouse', 'nest',
    'parasol', 'beachTowel', 'surfboard', 'swimmingPool',
    'sunflower', 'watermelon', 'hammock', 'iceCreamCart',
    'lemonade', 'sprinkler', 'fireflies',
    'sandcastleSummer',
  ]),
  spring: new Set([
    'snowPine', 'snowDeciduous', 'snowman', 'snowdrift', 'igloo',
    'frozenPond', 'icicle', 'sled', 'snowCoveredRock', 'bareBush',
    'winterBird', 'firewood',
    'parasol', 'beachTowel', 'surfboard', 'swimmingPool',
    'iceCreamCart', 'lemonade', 'sprinkler',
    'sandcastleSummer',
  ]),
  summer: new Set([
    'snowPine', 'snowDeciduous', 'snowman', 'snowdrift', 'igloo',
    'frozenPond', 'icicle', 'sled', 'snowCoveredRock', 'bareBush',
    'winterBird', 'firewood',
    'autumnMaple', 'autumnOak', 'autumnBirch', 'autumnGinkgo',
    'fallenLeaves', 'leafSwirl', 'cornStalk', 'scarecrowAutumn',
    'harvestBasket', 'hotDrink', 'autumnWreath',
  ]),
  autumn: new Set([
    'snowPine', 'snowDeciduous', 'snowman', 'snowdrift', 'igloo',
    'frozenPond', 'icicle', 'sled', 'snowCoveredRock', 'bareBush',
    'winterBird', 'firewood',
    'flower', 'butterfly', 'wildflowerPatch', 'tulip', 'tulipField',
    'cherryBlossom', 'cherryBlossomSmall', 'cherryPetals', 'crocus',
    'lamb', 'sprout', 'gardenBed', 'birdhouse', 'nest',
    'parasol', 'beachTowel', 'surfboard', 'swimmingPool',
    'sunflower', 'watermelon', 'hammock', 'iceCreamCart',
    'lemonade', 'sprinkler', 'fireflies',
    'sandcastleSummer',
  ]),
};

/** Assets to add per season, keyed by level range category */
interface SeasonalAdditions {
  /** Assets for grassland/forest level range (31-65) */
  nature: string[];
  /** Assets for farm/village range (66-90) */
  settlement: string[];
  /** Assets for any elevated land (23+) */
  general: string[];
}

const SEASON_ADD: Record<PeakSeason, SeasonalAdditions> = {
  winter: {
    nature: ['snowPine', 'snowDeciduous', 'snowCoveredRock', 'bareBush', 'winterBird', 'snowdrift'],
    settlement: ['snowman', 'igloo', 'sled', 'firewood', 'icicle', 'snowdrift'],
    general: ['snowdrift', 'snowCoveredRock', 'bareBush', 'icicle'],
  },
  spring: {
    nature: ['cherryBlossom', 'cherryBlossomSmall', 'tulip', 'tulipField', 'sprout', 'crocus', 'lamb'],
    settlement: ['cherryBlossom', 'tulipField', 'nest', 'birdhouse', 'gardenBed', 'rainPuddle', 'cherryPetals'],
    general: ['sprout', 'crocus', 'cherryPetals', 'rainPuddle'],
  },
  summer: {
    nature: ['sunflower', 'fireflies', 'watermelon'],
    settlement: ['parasol', 'beachTowel', 'hammock', 'iceCreamCart', 'lemonade', 'sprinkler', 'swimmingPool'],
    general: ['sunflower', 'watermelon'],
  },
  autumn: {
    nature: ['autumnMaple', 'autumnOak', 'autumnBirch', 'autumnGinkgo', 'fallenLeaves', 'leafSwirl', 'acorn'],
    settlement: ['cornStalk', 'scarecrowAutumn', 'harvestBasket', 'hotDrink', 'autumnWreath', 'fallenLeaves'],
    general: ['fallenLeaves', 'leafSwirl', 'acorn'],
  },
};

/**
 * Get seasonal pool overrides for a given week.
 * Returns sets of assets to add and remove from the base pool.
 */
export function getSeasonalPoolOverrides(
  week: number,
  hemisphere: Hemisphere = 'north',
  level: number = 50,
): { add: string[]; remove: Set<string> } {
  const { from, to, t } = getTransitionBlend(week, hemisphere);

  // For peak seasons (t === 0 and from === to), use the season directly
  if (from === to) {
    const remove = SEASON_REMOVE[from];
    const additions = SEASON_ADD[from];
    const add = getLevelAdditions(additions, level);
    return { add, remove };
  }

  // For transitions, blend: use "from" season removes, but mix additions
  const remove = new Set<string>();
  // Include removes from both seasons (conservative)
  for (const r of SEASON_REMOVE[from]) remove.add(r);
  for (const r of SEASON_REMOVE[to]) remove.add(r);

  // Blend additions: more from "to" as t increases
  const fromAdd = getLevelAdditions(SEASON_ADD[from], level);
  const toAdd = getLevelAdditions(SEASON_ADD[to], level);

  // Take proportional mix
  const fromCount = Math.round(fromAdd.length * (1 - t));
  const toCount = Math.round(toAdd.length * t);
  const add = [
    ...fromAdd.slice(0, fromCount),
    ...toAdd.slice(0, toCount),
  ];

  return { add, remove };
}

function getLevelAdditions(additions: SeasonalAdditions, level: number): string[] {
  const result: string[] = [...additions.general];
  if (level >= 31 && level <= 65) {
    result.push(...additions.nature);
  } else if (level >= 66) {
    result.push(...additions.settlement);
  }
  return result;
}
