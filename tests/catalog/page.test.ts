import { describe, expect, it } from 'vitest';
import { ASSET_CATALOG } from '../../src/themes/terrain/assets.js';
import { EPIC_CATALOG } from '../../src/themes/terrain/epics.js';
import { buildCatalogRecords, countCatalogFamilies } from '../../scripts/catalog/model.js';
import { renderCatalogPage } from '../../scripts/catalog/page.js';
import { renderCatalogSprite } from '../../scripts/catalog/sprite.js';
import { createGalleryItems } from '../../scripts/catalog/gallery-items.js';
import { KOREAN_CATALOG_IDS } from './fixtures.js';

describe('interactive catalog document', () => {
  it('C04-page: renders accessible controls and one card per registry entry', () => {
    // Given
    const records = buildCatalogRecords(ASSET_CATALOG, EPIC_CATALOG);

    // When
    const html = renderCatalogPage(records, countCatalogFamilies(records));

    // Then
    expect(html).toContain('<label for="season-filter">Season</label>');
    expect(html).toMatch(/<button type="button" data-mode="light"[^>]*>Light<\/button>/);
    expect(html).toContain('<label for="family-filter">Family</label>');
    expect(html).toContain('<label for="style-filter">Style</label>');
    expect(html).toContain('<label for="art-style-filter">Art style</label>');
    expect(html).toContain('id="empty-state"');
    expect(html).toContain('<option value="miniature">Miniature</option>');
    expect(html).toContain('<option value="pixel">Pixel village</option>');
    expect(html.match(/data-catalog-card/g)).toHaveLength(240);
    expect(html.match(/<img\b/g)).toBeNull();
  });

  it('C04-page: exposes exact family totals and all Korean IDs', () => {
    // Given
    const records = buildCatalogRecords(ASSET_CATALOG, EPIC_CATALOG);

    // When
    const html = renderCatalogPage(records, countCatalogFamilies(records));

    // Then
    expect(html).toContain('<dt>Ordinary</dt><dd><strong>210</strong>');
    expect(html).toContain('<dt>Wonders</dt><dd><strong>30</strong>');
    expect(html).toContain('<dt>Korean originals</dt><dd><strong>13</strong>');
    for (const id of KOREAN_CATALOG_IDS) {
      expect(html).toContain(`data-catalog-id="${id}"`);
    }
  });
});

describe('catalog artwork sprite', () => {
  it('C04-page: renders every original registry drawing into both color modes', () => {
    // Given
    const items = createGalleryItems();

    // When
    const dark = renderCatalogSprite(items, 'dark');
    const light = renderCatalogSprite(items, 'light');

    // Then
    expect(dark.match(/<g id="(?:asset|wonder)-/g)).toHaveLength(240);
    expect(light.match(/<g id="(?:asset|wonder)-/g)).toHaveLength(240);
    expect(dark).not.toMatch(/<animate(?:Transform|Motion)?\b/);
    expect(light).not.toMatch(/<animate(?:Transform|Motion)?\b/);
    expect(dark).toContain('id="asset-hanok"');
    expect(light).toContain('id="wonder-worldTree"');
  });
});
