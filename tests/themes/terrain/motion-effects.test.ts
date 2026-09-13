import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../../src/core/animation.js';
import {
  renderAnimatedOverlays,
  renderClouds,
  renderTerrainCSS,
  renderWaterOverlays,
} from '../../../src/themes/terrain/effects.js';
import { getIsoCells } from '../../../src/themes/terrain/blocks.js';
import { generateBiomeMap } from '../../../src/themes/terrain/biomes.js';
import { getTerrainPalette100 } from '../../../src/themes/terrain/palette.js';
import { contributionGrid, enrichGridCells100 } from '../../../src/themes/shared.js';
import { createMockContributionData } from '../../fixtures/contribution-data.js';

const data = createMockContributionData();
const palette = getTerrainPalette100('dark');
const cells = getIsoCells(
  enrichGridCells100(
    contributionGrid(data, { cellSize: 11, gap: 2, offsetX: 24, offsetY: 42 }),
    data,
  ),
  palette,
  405,
  6,
);
const biomeMap = generateBiomeMap(53, 7, 42);
const renderEffects = (): string =>
  `<style>${renderTerrainCSS(cells, biomeMap)}</style>${renderClouds(42, palette)}${renderWaterOverlays(cells, palette, biomeMap)}${renderAnimatedOverlays(cells, palette)}`;

describe('C08-full-subtle-off effects', () => {
  it('retains static effect shapes when motion is off', () => {
    // Given / When: all effect producers render the same scene with motion off.
    const svg = withMotionContext({ mode: 'off', namespace: '' }, renderEffects);
    // Then: base clouds, water and sparkles are visible without animation sources.
    expect(svg).toContain('<ellipse');
    expect(svg).toContain('<polygon');
    expect(svg).toContain('<circle');
    expect(svg).not.toMatch(/@keyframes|animation\s*:|<animate/);
  });

  it('limits motion to two slow clouds and four small shimmers when subtle is selected', () => {
    // Given / When: both river and natural-water producers share one policy.
    const svg = withMotionContext({ mode: 'subtle', namespace: '' }, renderEffects);
    // Then: no sparkle, foliage, flag or large-amplitude motion remains.
    expect(svg.match(/<animateTransform /g)).toHaveLength(2);
    expect(svg.match(/animation\s*:/g)?.length ?? 0).toBeLessThanOrEqual(4);
    expect(svg).not.toMatch(/@keyframes (?:town-sparkle|flag-wave|sway-)/);
    expect(svg).toContain('opacity: 0.16');
    for (const duration of svg.matchAll(/dur="([\d.]+)s"/g)) {
      expect(Number(duration[1])).toBeGreaterThanOrEqual(60);
    }
  });
});

describe('C08 shared subtle water budget', () => {
  it.each([0, 2, 4, 6])(
    'caps all water sources when %i natural-water cells exist',
    (naturalCount) => {
      // Given: eight water cells cover mixed natural and elevated river surfaces.
      const waterCells = cells
        .slice(0, 8)
        .map((cell, index) => ({ ...cell, level100: index < naturalCount ? 15 : 50 }));
      const rivers = new Map(
        waterCells.map((cell) => [
          `${cell.week},${cell.day}`,
          { isRiver: true, isPond: false, nearWater: true, forestDensity: 0 },
        ]),
      );
      // When: all water producers render under the same subtle policy.
      const svg = withMotionContext(
        { mode: 'subtle', namespace: '' },
        () =>
          `<style>${renderTerrainCSS(waterCells, rivers)}</style>${renderAnimatedOverlays(waterCells, palette)}${renderWaterOverlays(waterCells, palette, rivers)}`,
      );
      // Then: exactly four CSS animation targets exist across both sources.
      expect(svg.match(/animation\s*:/g)).toHaveLength(4);
      const selectors = Array.from(
        svg.matchAll(/\.([a-z-]+\d+) \{ animation/g),
        (match) => match[1],
      );
      for (const selector of selectors) expect(svg).toContain(`class="${selector}"`);
    },
  );
});
