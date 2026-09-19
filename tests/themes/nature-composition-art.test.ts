import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../src/core/animation.js';
import { ASSET_CATALOG, renderCatalogAsset } from '../../src/themes/terrain/assets.js';
import { getAssetCatalogEntry } from '../../src/themes/terrain/assets/catalog.js';
import { ASSET_RENDERERS } from '../../src/themes/terrain/assets/renderers.js';
import { mapVillageAsset } from '../../src/themes/terrain/assets/style-pool.js';
import { getSeasonalPalette100 } from '../../src/themes/terrain/palette.js';
import { EPIC_CATALOG } from '../../src/themes/terrain/epics.js';
import {
  NATURE_IDS,
  NATURE_SEASONS,
  natureBounds,
  natureId,
  natureRaster,
  silhouetteDifference,
} from './nature-composition-fixture.js';

describe('year-round nature reward artwork', () => {
  it('keeps ordinary nature IDs separate from existing Wonders', () => {
    const wonders = new Set<string>(EPIC_CATALOG.map((entry) => entry.id));
    const collisions = NATURE_IDS.filter((id) => wonders.has(id));
    expect(collisions).toEqual([]);
  });

  it.each(NATURE_IDS)('registers %s as shared year-round nature', (name) => {
    // Given a required nature reward, when the public catalog is read.
    const entries = ASSET_CATALOG.filter((entry) => entry.id === name);
    // Then it is a single natural entry available to both cultures in every season.
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ style: 'classic', season: 'all' });
    expect(['water', 'shore', 'woodland']).toContain(entries[0].category);
    expect(mapVillageAsset(natureId(name), 'korean')).toBe(name);
    expect(mapVillageAsset(natureId(name), 'classic')).toBe(name);
  });

  describe.each(['light', 'dark'] as const)('%s seasonal miniature rendering', (mode) => {
    it.each(NATURE_IDS)('keeps all %s poses within compact measured bounds', (name) => {
      // Given the same reward in four seasons, when each variant is rasterized.
      const id = natureId(name);
      const bounds = getAssetCatalogEntry(id).bounds;
      for (const [season, week] of NATURE_SEASONS) {
        const colors = getSeasonalPalette100(mode, week).assets;
        for (const variant of [0, 1, 2]) {
          const painted = natureBounds(natureRaster(renderCatalogAsset(id, colors, variant)));
          const label = `${name}/${variant}/${mode}/${season}`;
          // Then no visible pixel crosses its registered tile envelope.
          expect(painted.width, label).toBeGreaterThan(5);
          expect(painted.height, label).toBeGreaterThan(3);
          expect(painted.x, label).toBeGreaterThanOrEqual(bounds.x);
          expect(painted.y, label).toBeGreaterThanOrEqual(bounds.y);
          expect(painted.x + painted.width, label).toBeLessThanOrEqual(bounds.x + bounds.width);
          expect(painted.y + painted.height, label).toBeLessThanOrEqual(bounds.y + bounds.height);
        }
      }
      expect(bounds.width).toBeLessThanOrEqual(16);
      expect(bounds.height).toBeLessThanOrEqual(20);
    });

    it.each(NATURE_IDS)('gives %s three genuinely different alpha silhouettes', (name) => {
      // Given three poses in each season, when only their opaque outlines are compared.
      const id = natureId(name);
      for (const [season, week] of NATURE_SEASONS) {
        const colors = getSeasonalPalette100(mode, week).assets;
        const poses = [0, 1, 2].map((variant) =>
          natureRaster(renderCatalogAsset(id, colors, variant)),
        );
        // Then every pair differs geometrically, independent of color or internal detail.
        for (const [a, b] of [
          [0, 1],
          [0, 2],
          [1, 2],
        ] as const) {
          expect(
            silhouetteDifference(poses[a], poses[b]),
            `${name}/${season}/${a}-${b}`,
          ).toBeGreaterThan(0.12);
        }
      }
    });
  });

  it.each(NATURE_IDS)(
    'renders %s deterministically with bounded self-contained geometry',
    (name) => {
      // Given an anchor and motion setting, when the miniature is rendered repeatedly.
      const render = ASSET_RENDERERS[natureId(name)];
      const colors = getSeasonalPalette100('light', 16).assets;
      for (const variant of [0, 1, 2]) {
        const fragment = render(2, -1, colors, variant);
        const atOrigin = render(0, 0, colors, variant);
        // Then anchor translation and motion never change its visible reward geometry.
        expect(render(2, -1, colors, variant)).toBe(fragment);
        const translated = Buffer.from(
          natureRaster(`<g transform="translate(-2,1)">${fragment}</g>`),
        );
        expect(translated.equals(Buffer.from(natureRaster(atOrigin)))).toBe(true);
        expect(
          withMotionContext({ mode: 'off', namespace: 'nature' }, () =>
            render(2, -1, colors, variant),
          ),
        ).toBe(fragment);
        expect(fragment).not.toMatch(
          /<defs|<filter|<image|<script|<foreignObject|href=|url\(|NaN|undefined/,
        );
        expect(
          fragment.match(/<(?:path|ellipse|circle|rect|polygon|polyline)\b/g)?.length,
        ).toBeLessThanOrEqual(48);
        expect(fragment.length).toBeLessThan(8_000);
      }
    },
  );

  it.each(['cedarGrove', 'bambooThicket'] as const)(
    'preserves green %s foliage through autumn',
    (name) => {
      // Given summer and autumn materials, when the evergreen reward is rendered.
      const id = natureId(name);
      const summer = getSeasonalPalette100('light', 30).assets;
      const autumn = getSeasonalPalette100('light', 43).assets;
      const winter = getSeasonalPalette100('light', 2).assets;
      for (const variant of [0, 1, 2]) {
        const green = renderCatalogAsset(id, summer, variant);
        // Then deciduous autumn colors never enter its crown, while winter adds snow.
        expect(renderCatalogAsset(id, autumn, variant)).toBe(green);
        expect(renderCatalogAsset(id, winter, variant)).not.toBe(green);
        expect(renderCatalogAsset(id, winter, variant)).toContain(winter.evergreenLight);
      }
    },
  );

  it.each([
    'ancientOak',
    'wildflowerMeadow',
    'lotusPond',
    'reedMarsh',
    'alpineRocks',
    'willowPond',
  ] as const)('gives %s season-aware vegetation while preserving its outline', (name) => {
    // Given the same pose in four seasons, when seasonal materials are applied.
    const id = natureId(name);
    const fragments = NATURE_SEASONS.map(([, week]) =>
      renderCatalogAsset(id, getSeasonalPalette100('dark', week).assets, 0),
    );
    // Then the vegetation changes color but its geometric identity remains stable.
    expect(new Set(fragments).size).toBe(4);
    const summer = natureRaster(fragments[2]);
    for (const fragment of fragments)
      expect(silhouetteDifference(summer, natureRaster(fragment))).toBe(0);
  });
});
