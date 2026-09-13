import { describe, expect, it } from 'vitest';
import { Resvg } from '@resvg/resvg-js';
import { terrainTheme } from '../../../src/themes/terrain/index.js';
import {
  createFullContributionData,
  createMockContributionData,
} from '../../fixtures/contribution-data.js';

const options = { title: 'Motion <&> village', width: 840, height: 240 };
const sources = [
  { label: 'mixed', data: createMockContributionData() },
  { label: 'full', data: createFullContributionData() },
];

describe.each(sources)('C08 integrated $label village', ({ data }) => {
  it.each(['dark', 'light'] as const)(
    'omits all motion for off %s while retaining the complete village',
    (colorMode) => {
      // Given: real contribution data with asset/Wonder creation sites.
      // When: the public theme renderer emits explicit off mode.
      const svg = terrainTheme.render(data, { ...options, motion: 'off' })[colorMode];
      // Then: no motion survives and a complete SVG can be rasterized.
      expect(
        svg.match(/<animate(?:Motion|Transform)?\b|@keyframes|animation(?:-[a-z]+)?\s*:/g) ?? [],
      ).toEqual([]);
      expect(svg.match(/<polygon\b/g)?.length).toBeGreaterThan(300);
      const image = new Resvg(svg).render();
      expect(image.width).toBe(840);
      expect(image.height).toBe(240);
    },
    20_000,
  );

  it.each(['dark', 'light'] as const)(
    'keeps the static branch pixel-identical for full %s',
    (colorMode) => {
      // Given: the exact same prepared scene under off and full policies.
      const staticSvg = terrainTheme.render(data, { ...options, motion: 'off' })[colorMode];
      // When: media-unsupported resvg rasterizes the full-motion scene.
      const fullSvg = terrainTheme.render(data, { ...options, motion: 'full' })[colorMode];
      // Then: both show the identical complete static base without ID collisions.
      const expected = new Resvg(staticSvg).render().asPng();
      const actual = new Resvg(fullSvg).render().asPng();
      expect(actual.equals(expected)).toBe(true);
      const ids = Array.from(fullSvg.matchAll(/\sid="([^"]+)"/g), (match) => match[1]);
      expect(new Set(ids).size).toBe(ids.length);
    },
    20_000,
  );
});
