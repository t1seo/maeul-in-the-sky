import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../../src/core/animation.js';
import { renderCelestials, renderClouds } from '../../../src/themes/terrain/effects/sky.js';
import { getTerrainPalette100 } from '../../../src/themes/terrain/palette.js';

const palette = getTerrainPalette100('dark');
const still = (svg: string): string => svg.replace(/<animateTransform[^>]*\/>/g, '');

describe('legacy sky motion contract', () => {
  it.each([
    { mode: 'full', transforms: ['69:48', '84:52'] },
    { mode: 'subtle', transforms: ['9:96', '10:104'] },
    { mode: 'off', transforms: [] },
  ] as const)('preserves seeded drift distances and durations in $mode', ({ mode, transforms }) => {
    const svg = withMotionContext({ mode, namespace: 'sky' }, () => renderClouds(42, palette));
    expect(
      Array.from(
        svg.matchAll(/values="0,0;(\d+),0;0,0" dur="(\d+)s"/g),
        (match) => `${match[1]}:${match[2]}`,
      ),
    ).toEqual(transforms);
  });

  it.each(['full', 'subtle', 'off'] as const)(
    'retains identical finished cloud artwork when motion is %s',
    (mode) => {
      // Given: the same sky seed and namespace under the explicit off policy.
      const expected = withMotionContext({ mode: 'off', namespace: 'sky' }, () =>
        renderClouds(42, palette),
      );
      // When: the requested policy renders the sky.
      const actual = withMotionContext({ mode, namespace: 'sky' }, () => renderClouds(42, palette));
      // Then: only the two existing cloud transforms may differ.
      expect(still(actual)).toBe(expected);
      expect(actual.match(/<animateTransform\b/g) ?? []).toHaveLength(mode === 'off' ? 0 : 2);
      expect(actual).not.toMatch(/<animate(?:Motion)?\b|@keyframes|animation\s*:/);
    },
  );

  it.each(['dark', 'light'] as const)(
    'keeps celestials deterministic and motionless in %s',
    (colorMode) => {
      // Given: a seeded sky with its established color palette.
      const colors = getTerrainPalette100(colorMode);
      const expected = renderCelestials(42, colors, colorMode === 'dark');
      // When: the same sky is rendered again.
      const actual = renderCelestials(42, colors, colorMode === 'dark');
      // Then: the exact same art contains no animation or remote content.
      expect(actual).toBe(expected);
      expect(actual).not.toMatch(/<animate|@keyframes|<script|<image|<foreignObject/);
    },
  );
});
