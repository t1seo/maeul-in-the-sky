import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { ASSET_CATALOG, renderCatalogAsset } from '../../src/themes/terrain/assets.js';
import { EPIC_CATALOG, renderEpicBuildings } from '../../src/themes/terrain/epics.js';
import { getTerrainPalette100, getSeasonalPalette100 } from '../../src/themes/terrain/palette.js';
import { withMotionContext } from '../../src/core/animation.js';
import { PIXEL_ALPHA_THRESHOLD } from '../../src/themes/terrain/pixel/types.js';

const light = getTerrainPalette100('light');
const dark = getTerrainPalette100('dark');

function paths(svg: string): readonly string[] {
  return [...svg.matchAll(/ d="([^"]+)"/g)].map((match) => match[1]);
}

describe('optional compiled pixel asset treatment', () => {
  it.each(['pine', 'hanok', 'ricePaddy'] as const)(
    'draws %s with actual half-unit rectilinear geometry',
    (id) => {
      const svg = renderCatalogAsset(id, light.assets, 0, 'pixel');
      expect(svg).toContain('data-art-style="pixel"');
      expect(svg).not.toMatch(/<(?:circle|ellipse|polygon|image|filter|animate)\b/);
      expect(paths(svg).length).toBeGreaterThan(0);
      for (const path of paths(svg)) {
        expect(path).not.toMatch(/[a-cf-gi-lo-uw-y]/i);
        const coordinates = path.match(/-?\d+(?:\.\d+)?/g) ?? [];
        expect(coordinates.every((value) => Number.isInteger(Number(value) * 2))).toBe(true);
      }
    },
  );

  it('retains palette roles across light, dark and seasonal rendering', () => {
    const palettes = [light, dark, getSeasonalPalette100('light', 42, 0)];
    const output = palettes.map((palette) =>
      renderCatalogAsset('deciduous', palette.assets, 0, 'pixel'),
    );
    expect(paths(output[0])).toEqual(paths(output[1]));
    expect(paths(output[0])).toEqual(paths(output[2]));
    expect(new Set(output).size).toBe(3);
  });

  it('keeps distinct pine variants at the same fixed anchor', () => {
    const output = [0, 1, 2].map((variant) =>
      renderCatalogAsset('pine', light.assets, variant, 'pixel'),
    );
    expect(new Set(output.map((svg) => paths(svg).join(' '))).size).toBe(3);
    expect(output.every((svg) => svg.includes('translate(0,0)'))).toBe(true);
  });

  it.each(['pine', 'hanok', 'ricePaddy'] as const)(
    'rasterizes %s to opaque grid pixels without curves',
    (id) => {
      const art = renderCatalogAsset(id, light.assets, 0, 'pixel');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="-20 -25 40 40">${art}</svg>`;
      const raster = new Resvg(svg, { font: { loadSystemFonts: false } }).render();
      const alpha = [...raster.pixels].filter((_, index) => index % 4 === 3);
      expect(alpha.some((value) => value === 255)).toBe(true);
      expect(alpha.every((value) => value === 0 || value === 255)).toBe(true);
      const original = withMotionContext({ mode: 'off', namespace: '' }, () =>
        renderCatalogAsset(id, light.assets, 0, 'miniature'),
      );
      const originalRaster = new Resvg(svg.replace(art, original), {
        font: { loadSystemFonts: false },
      }).render();
      const silhouette = [...originalRaster.pixels]
        .filter((_, index) => index % 4 === 3)
        .map((value) => value >= PIXEL_ALPHA_THRESHOLD);
      expect(alpha.map((value) => value === 255)).toEqual(silhouette);
    },
  );

  it('covers every registered ordinary variant without runtime images or motion', () => {
    for (const entry of ASSET_CATALOG) {
      for (const variant of [0, 1, 2]) {
        const svg = renderCatalogAsset(entry.id, dark.assets, variant, 'pixel');
        expect(svg, `${entry.id}:${variant}`).toContain('data-art-style="pixel"');
        expect(paths(svg).length, entry.id).toBeGreaterThan(0);
        expect(paths(svg).length, entry.id).toBeLessThanOrEqual(16);
        expect(svg, entry.id).not.toMatch(/<image|<animate|url\(|<script/);
      }
    }
  });

  it('renders every Wonder as a static grid sprite and preserves discovery metadata', () => {
    for (const entry of EPIC_CATALOG) {
      const svg = renderEpicBuildings(
        [
          {
            id: `wonder:${entry.id}`,
            date: '2025-06-01',
            type: entry.id,
            tier: entry.tier,
            week: 0,
            day: 0,
            cx: 4.25,
            cy: 8.75,
          },
        ],
        [light],
        'pixel',
      );
      expect(svg, entry.id).toContain('data-art-style="pixel"');
      expect(svg).toContain(`data-wonder-id="wonder:${entry.id}"`);
      expect(svg).toContain('data-date="2025-06-01"');
      expect(svg).toContain('translate(4.25,8.75)');
      expect(svg).not.toMatch(/<ellipse|<animate|url\(/);
      expect(paths(svg).length, entry.id).toBeLessThanOrEqual(16);
    }
  });

  it('keeps the previous default and explicit miniature rendering identical', () => {
    const render = () => renderCatalogAsset('pine', light.assets, 1);
    const before = withMotionContext({ mode: 'off', namespace: '' }, render);
    const explicit = withMotionContext({ mode: 'off', namespace: '' }, () =>
      renderCatalogAsset('pine', light.assets, 1, 'miniature'),
    );
    expect(explicit).toBe(before);
  });
});
