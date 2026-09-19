import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as assets from '../../src/themes/terrain/assets.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';

const colors = getTerrainPalette100('dark').assets;
const fingerprints: unknown = JSON.parse(
  readFileSync(new URL('./assets-classic-fixtures.json', import.meta.url), 'utf8'),
);

describe('asset catalog', () => {
  it('exports a complete catalog when classic and Korean assets are registered', () => {
    expect(assets.ASSET_CATALOG_COUNTS).toEqual({ total: 210, classic: 197, korean: 13 });
    expect(new Set(assets.ASSET_CATALOG.map((entry) => entry.id)).size).toBe(210);
  });

  it('preserves all approved miniature art variants', () => {
    const hashes = Object.fromEntries(
      assets.ASSET_CATALOG.filter((entry) => entry.style === 'classic').map((entry) => [
        entry.id,
        [0, 1, 2].map((variant) =>
          createHash('sha256')
            .update(assets.renderCatalogAsset(entry.id, colors, variant))
            .digest('hex'),
        ),
      ]),
    );
    expect(hashes).toEqual(fingerprints);
  });

  it('provides positive bounds and readable metadata for every preview', () => {
    for (const entry of assets.ASSET_CATALOG) {
      expect(entry.displayName.length).toBeGreaterThan(2);
      expect(entry.bounds.width).toBeGreaterThan(0);
      expect(entry.bounds.height).toBeGreaterThan(0);
      expect(entry.category.length).toBeGreaterThan(2);
      expect(entry.season.length).toBeGreaterThan(0);
      expect(assets.renderCatalogAsset(entry.id, colors)).toMatch(/<(g|path|ellipse|rect|polygon)/);
    }
  });

  it('draws four original Korean silhouettes with visible architectural details', () => {
    const hanok = assets.renderCatalogAsset('hanok', colors);
    const pavilion = assets.renderCatalogAsset('pavilion', colors);
    const wall = assets.renderCatalogAsset('stoneWall', colors);
    const onggi = assets.renderCatalogAsset('onggi', colors);
    expect(hanok).toContain('data-part="giwa-roof"');
    expect(hanok).toContain('data-part="wooden-lattice"');
    expect(pavilion).toContain('data-part="open-pillars"');
    expect(wall).toContain('data-part="stacked-stones"');
    expect(onggi).toContain('data-part="earthenware-jars"');
    expect(new Set([hanok, pavilion, wall, onggi]).size).toBe(4);
  });
});
