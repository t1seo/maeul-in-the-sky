import { describe, expect, it } from 'vitest';
import { catalogSVG } from '../../scripts/generate-catalog.js';
import { paddedViewBox } from '../../scripts/catalog/render.js';

describe('catalog preview bounds', () => {
  it('C04-bounds: pads every side of registered renderer bounds', () => {
    // Given
    const bounds = { x: -8, y: -13, width: 16, height: 16 };

    // When
    const viewBox = paddedViewBox(bounds);

    // Then
    expect(viewBox.x).toBeLessThan(bounds.x);
    expect(viewBox.y).toBeLessThan(bounds.y);
    expect(viewBox.x + viewBox.width).toBeGreaterThan(bounds.x + bounds.width);
    expect(viewBox.y + viewBox.height).toBeGreaterThan(bounds.y + bounds.height);
  });

  it('C04-bounds: emits a finite accessible SVG when there are no assets', () => {
    // Given
    const items: readonly [] = [];

    // When
    const svg = catalogSVG(items, 'Empty catalog', 'dark');

    // Then
    expect(svg).toContain('viewBox="0 0 200 88"');
    expect(svg).toContain('<title id="catalog-title">Empty catalog</title>');
    expect(svg).not.toMatch(/NaN|Infinity/);
  });
});
