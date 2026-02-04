import { describe, it, expect } from 'vitest';
import {
  getSeasonZone,
  getTransitionBlend,
  getSeasonalTint,
  lerpTint,
  applyTint,
  applyTintToHex,
  getSeasonalPoolOverrides,
} from '../../src/themes/terrain/seasons.js';
import type { SeasonZone, SeasonalTint } from '../../src/themes/terrain/seasons.js';

describe('getSeasonZone', () => {
  // Reversed mapping: right (week 51) = winter, left (week 0) = autumn→winter
  it('maps week 51 to zone 0 (winter, rightmost)', () => {
    expect(getSeasonZone(51)).toBe(0);
  });

  it('maps week 48 to zone 0 (winter)', () => {
    expect(getSeasonZone(48)).toBe(0);
  });

  it('maps week 45 to zone 0 (winter)', () => {
    expect(getSeasonZone(45)).toBe(0);
  });

  it('maps week 44 to zone 1 (winter->spring)', () => {
    expect(getSeasonZone(44)).toBe(1);
  });

  it('maps week 36 to zone 2 (spring)', () => {
    expect(getSeasonZone(36)).toBe(2);
  });

  it('maps week 29 to zone 3 (spring->summer)', () => {
    expect(getSeasonZone(29)).toBe(3);
  });

  it('maps week 21 to zone 4 (summer)', () => {
    expect(getSeasonZone(21)).toBe(4);
  });

  it('maps week 16 to zone 5 (summer->autumn)', () => {
    expect(getSeasonZone(16)).toBe(5);
  });

  it('maps week 9 to zone 6 (autumn)', () => {
    expect(getSeasonZone(9)).toBe(6);
  });

  it('maps week 3 to zone 7 (autumn->winter)', () => {
    expect(getSeasonZone(3)).toBe(7);
  });

  it('maps week 0 to zone 7 (autumn->winter, leftmost)', () => {
    expect(getSeasonZone(0)).toBe(7);
  });

  it('covers all 52 weeks without gaps', () => {
    const zones: SeasonZone[] = [];
    for (let w = 0; w < 52; w++) {
      zones.push(getSeasonZone(w));
    }
    // Every zone 0-7 should appear at least once
    for (let z = 0; z <= 7; z++) {
      expect(zones).toContain(z);
    }
  });
});

describe('hemisphere flip (south)', () => {
  it('week 51 (rightmost) in south = summer (zone 4)', () => {
    expect(getSeasonZone(51, 'south')).toBe(4);
  });

  it('week 25 in south = winter (zone 0)', () => {
    expect(getSeasonZone(25, 'south')).toBe(0);
  });

  it('shifts by exactly 26 weeks', () => {
    // For each week, south(w) should equal north((w+26)%52)
    for (let w = 0; w < 52; w++) {
      const southZone = getSeasonZone(w, 'south');
      const equivalentNorthWeek = (w + 26) % 52;
      const northZone = getSeasonZone(equivalentNorthWeek, 'north');
      expect(southZone).toBe(northZone);
    }
  });
});

describe('getTransitionBlend', () => {
  it('peak winter zone returns t=0 with from=to=winter', () => {
    const blend = getTransitionBlend(48);
    expect(blend.from).toBe('winter');
    expect(blend.to).toBe('winter');
    expect(blend.t).toBe(0);
  });

  it('transition zone 1 (week 44) returns from=winter, to=spring', () => {
    const blend = getTransitionBlend(44);
    expect(blend.from).toBe('winter');
    expect(blend.to).toBe('spring');
    expect(blend.t).toBeCloseTo(0, 1);
  });

  it('transition zone 1 mid-point has t near 0.5', () => {
    const blend = getTransitionBlend(41); // effective week 10 in zone 1 (7-12)
    expect(blend.from).toBe('winter');
    expect(blend.to).toBe('spring');
    expect(blend.t).toBeGreaterThan(0.3);
    expect(blend.t).toBeLessThan(0.7);
  });

  it('summer peak zone returns t=0 with from=to=summer', () => {
    const blend = getTransitionBlend(21);
    expect(blend.from).toBe('summer');
    expect(blend.to).toBe('summer');
    expect(blend.t).toBe(0);
  });
});

describe('getSeasonalTint', () => {
  it('summer tint has no color shift', () => {
    const tint = getSeasonalTint(21); // week 21 = summer (zone 4)
    expect(tint.colorShift).toBe(0);
    expect(tint.warmth).toBe(0);
    expect(tint.snowCoverage).toBe(0);
    expect(tint.greenMul).toBe(1);
    expect(tint.saturation).toBe(1);
  });

  it('winter tint has snow coverage and desaturation', () => {
    const tint = getSeasonalTint(48); // week 48 = winter (zone 0)
    expect(tint.snowCoverage).toBeGreaterThan(0.3);
    expect(tint.saturation).toBeLessThan(0.7);
    expect(tint.greenMul).toBeLessThan(0.7);
  });

  it('spring tint has green boost and saturation increase', () => {
    const tint = getSeasonalTint(36); // week 36 = spring (zone 2)
    expect(tint.greenMul).toBeGreaterThan(1);
    expect(tint.saturation).toBeGreaterThan(1);
    expect(tint.snowCoverage).toBe(0);
  });

  it('autumn tint has warmth and reduced green', () => {
    const tint = getSeasonalTint(9); // week 9 = autumn (zone 6)
    expect(tint.warmth).toBeGreaterThan(15);
    expect(tint.greenMul).toBeLessThan(0.75);
  });

  it('transition zones produce interpolated tints', () => {
    const winterTint = getSeasonalTint(48);
    const springTint = getSeasonalTint(36);
    const transitionTint = getSeasonalTint(41); // W->Sp transition

    // Transition snow should be between winter and spring
    expect(transitionTint.snowCoverage).toBeLessThan(winterTint.snowCoverage);
    expect(transitionTint.snowCoverage).toBeGreaterThanOrEqual(springTint.snowCoverage);
  });
});

describe('lerpTint', () => {
  it('t=0 returns first tint', () => {
    const a: SeasonalTint = {
      colorShift: 0.5, colorTarget: [100, 100, 100],
      greenMul: 0.5, warmth: 10, snowCoverage: 0.5, saturation: 0.8,
    };
    const b: SeasonalTint = {
      colorShift: 0, colorTarget: [200, 200, 200],
      greenMul: 1.0, warmth: 0, snowCoverage: 0, saturation: 1.0,
    };
    const result = lerpTint(a, b, 0);
    expect(result.colorShift).toBe(0.5);
    expect(result.warmth).toBe(10);
  });

  it('t=1 returns second tint', () => {
    const a: SeasonalTint = {
      colorShift: 0.5, colorTarget: [100, 100, 100],
      greenMul: 0.5, warmth: 10, snowCoverage: 0.5, saturation: 0.8,
    };
    const b: SeasonalTint = {
      colorShift: 0, colorTarget: [200, 200, 200],
      greenMul: 1.0, warmth: 0, snowCoverage: 0, saturation: 1.0,
    };
    const result = lerpTint(a, b, 1);
    expect(result.colorShift).toBe(0);
    expect(result.warmth).toBe(0);
  });
});

describe('applyTint', () => {
  it('summer tint (identity) preserves colors', () => {
    const summerTint = getSeasonalTint(21);
    const [r, g, b] = applyTint(100, 150, 80, summerTint);
    expect(r).toBe(100);
    expect(g).toBe(150);
    expect(b).toBe(80);
  });

  it('winter tint shifts toward white/blue', () => {
    const winterTint = getSeasonalTint(48);
    const [r, g, b] = applyTint(60, 140, 50, winterTint);
    // Should be lighter (closer to white) due to snow coverage
    expect(r).toBeGreaterThan(60);
    // Green should be reduced (greenMul < 1)
    // But snow coverage pulls toward white, so net effect may still be higher
  });

  it('autumn tint increases warmth (more red, less blue)', () => {
    const autumnTint = getSeasonalTint(9);
    const [r, , b] = applyTint(100, 100, 100, autumnTint);
    // Warmth adds red and subtracts blue
    expect(r).toBeGreaterThan(100);
    expect(b).toBeLessThan(100);
  });

  it('clamps to valid RGB range', () => {
    const extremeTint: SeasonalTint = {
      colorShift: 0, colorTarget: [0, 0, 0],
      greenMul: 3.0, warmth: 300, snowCoverage: 0, saturation: 1,
    };
    const [r, g, b] = applyTint(200, 200, 200, extremeTint);
    expect(r).toBeLessThanOrEqual(255);
    expect(g).toBeLessThanOrEqual(255);
    expect(b).toBeGreaterThanOrEqual(0);
  });
});

describe('applyTintToHex', () => {
  it('returns valid hex color', () => {
    const result = applyTintToHex('#4a8828', getSeasonalTint(48));
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('summer tint preserves hex color', () => {
    expect(applyTintToHex('#4a8828', getSeasonalTint(21))).toBe('#4a8828');
  });
});

describe('getSeasonalPoolOverrides', () => {
  it('winter adds snow assets and removes flowers', () => {
    const { add, remove } = getSeasonalPoolOverrides(48, 'north', 50);
    expect(add.some(a => a.includes('snow') || a.includes('Snow'))).toBe(true);
    expect(remove.has('flower')).toBe(true);
    expect(remove.has('butterfly')).toBe(true);
  });

  it('spring adds cherry blossoms and removes snow', () => {
    const { add, remove } = getSeasonalPoolOverrides(36, 'north', 50);
    expect(add).toContain('cherryBlossom');
    expect(remove.has('snowman')).toBe(true);
  });

  it('autumn adds maple trees and removes spring assets', () => {
    const { add, remove } = getSeasonalPoolOverrides(9, 'north', 50);
    expect(add).toContain('autumnMaple');
    expect(remove.has('cherryBlossom')).toBe(true);
  });

  it('summer is mostly base (minimal changes)', () => {
    const { add, remove } = getSeasonalPoolOverrides(21, 'north', 50);
    // Summer should remove winter/autumn assets
    expect(remove.has('snowman')).toBe(true);
    expect(remove.has('autumnMaple')).toBe(true);
  });

  it('settlement level gets appropriate seasonal assets', () => {
    const winterSettlement = getSeasonalPoolOverrides(48, 'north', 80);
    expect(winterSettlement.add).toContain('igloo');
    expect(winterSettlement.add).toContain('sled');

    const springSettlement = getSeasonalPoolOverrides(36, 'north', 80);
    expect(springSettlement.add).toContain('gardenBed');
  });
});
