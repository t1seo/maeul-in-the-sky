import { describe, expect, it } from 'vitest';
import { getTerrainPalette100 } from '../../../src/themes/terrain/palette.js';
import { renderBlock } from '../../../src/themes/terrain/scene/block-shape.js';
import type { IsoCell } from '../../../src/themes/terrain/scene/projection.js';
import { renderSurfaceBlock } from '../../../src/themes/terrain/scene/surface-block.js';
import { withSurfaceContext } from '../../../src/themes/terrain/scene/surface-context.js';

const dates = Array.from({ length: 366 }, (_, index) =>
  new Date(Date.UTC(2024, 0, index + 1)).toISOString().slice(0, 10),
);
const palette = getTerrainPalette100('light');
const cell = (date: string, level100 = 50, height = 12): IsoCell => ({
  date,
  week: 0,
  day: 0,
  level100,
  height,
  isoX: 10,
  isoY: 20,
  colors: palette.getElevation(level100),
});
const paths = (svg: string, attribute: string): readonly string[] =>
  Array.from(
    svg.matchAll(new RegExp(`<path ${attribute}="[^"]+"[^>]* d="([^"]+)"`, 'g')),
    (match) => match[1] ?? '',
  );

function coordinates(path: string): readonly (readonly [number, number])[] {
  expect(path).toMatch(/^[MLQZ\d.,\s-]+$/);
  const numbers = Array.from(path.matchAll(/-?(?:\d+\.?\d*|\.\d+)/g), (match) => Number(match[0]));
  return numbers.flatMap((x, index) => {
    if (index % 2) return [];
    const y = numbers[index + 1];
    if (y === undefined) throw new TypeError('Unpaired path coordinate');
    return [[x, y] as const];
  });
}

describe('miniature ground artwork', () => {
  it.each([
    { level: 0, material: 'soil' },
    { level: 15, material: 'ice' },
    { level: 50, material: 'grass' },
    { level: 90, material: 'stone' },
  ])('varies $material detail within the top face when dates change', ({ level, material }) => {
    // Given: a complete leap year of one ground material.
    const cells = dates.map((date) => cell(date, level));
    // When: each dated surface is rendered.
    const svg = cells.map((value) => renderSurfaceBlock(value, false)).join('');
    const textures = paths(svg, 'data-surface');
    // Then: sparse organic variants and their curve controls fit inside the diamond.
    expect(textures.length).toBeGreaterThan(0);
    expect(textures.length).toBeLessThanOrEqual(60);
    expect(new Set(textures).size).toBeGreaterThanOrEqual(3);
    expect(svg.match(new RegExp(`data-surface="${material}"`, 'g'))).toHaveLength(textures.length);
    for (const texture of textures) {
      for (const [x, y] of coordinates(texture)) {
        expect(Math.abs(x) / 8 + Math.abs(y) / 3.5).toBeLessThan(0.9);
      }
    }
    expect(svg).not.toMatch(/<filter|<pattern|<image|<animate|animation:/);
  });

  it('retains dated detail geometry when placement and lighting change', () => {
    // Given: matching absolute dates in a differently positioned, dark calendar.
    const dark = getTerrainPalette100('dark');
    const originals = dates.map((date) => cell(date));
    const shifted = originals.map((value) => ({
      ...value,
      week: 30,
      day: 6,
      isoX: 900,
      isoY: -120,
      colors: dark.getElevation(value.level100),
    }));
    const before = JSON.stringify(originals);
    // When: both placements are shaded into their own SVG coordinates.
    const outputs = [originals, shifted].map((cells) =>
      cells.map((value) => renderSurfaceBlock(value, false)).join(''),
    );
    // Then: date selection and local artwork survive lighting and layout changes.
    for (const attribute of ['data-surface', 'data-strata']) {
      expect(paths(outputs[0] ?? '', attribute)).toEqual(paths(outputs[1] ?? '', attribute));
    }
    expect(JSON.stringify(originals)).toBe(before);
  });

  it.each([10, 12, 28])(
    'keeps sparse strata within both existing side faces at height %s',
    (height) => {
      // Given: a year of tall ground with a fixed contribution height.
      const cells = dates.map((date) => cell(date, 90, height));
      // When: the existing block faces receive relief.
      const svg = cells.map((value) => renderSurfaceBlock(value, false)).join('');
      const strata = paths(svg, 'data-strata');
      // Then: at most one compact path per selected cell fits with a stroke margin.
      expect(strata.length).toBeGreaterThanOrEqual(40);
      expect(strata.length).toBeLessThanOrEqual(70);
      for (const relief of strata) {
        const points = coordinates(relief);
        expect(points.some(([x]) => x < 0)).toBe(true);
        expect(points.some(([x]) => x > 0)).toBe(true);
        for (const [x, y] of points) {
          const edgeY = 3.5 * (1 - Math.abs(x) / 8);
          expect(Math.abs(x)).toBeLessThan(7.5);
          expect(Math.abs(x)).toBeGreaterThan(0.5);
          expect(y).toBeGreaterThan(edgeY + 0.3);
          expect(y).toBeLessThan(edgeY + height - 0.3);
        }
      }
      expect(svg.match(/<polygon /g)).toHaveLength(366 * 3);
    },
  );

  it.each([
    { height: 0, water: false },
    { height: 9.99, water: false },
    { height: 28, water: true },
  ])('omits side strata when height=$height and water=$water', ({ height, water }) => {
    // Given: shallow ground or a liquid surface.
    const cells = dates.map((date) => cell(date, 50, height));
    // When: the blocks are rendered.
    const svg = cells.map((value) => renderSurfaceBlock(value, water)).join('');
    // Then: relief cannot cross a short face or overlay water highlights.
    expect(paths(svg, 'data-strata')).toHaveLength(0);
    if (water) expect(paths(svg, 'data-surface')).toHaveLength(0);
  });

  it('preserves source geometry and colors when detail is added', () => {
    // Given: blocks whose dates differ but whose contribution geometry is identical.
    const cells = dates.map((date) => cell(date));
    const colors = palette.getElevation(50);
    // When: all dated variants are rendered.
    const faces = cells.map((value) => renderSurfaceBlock(value, false).match(/<polygon[^>]+>/g));
    // Then: none of the dates changes the original three faces or their colors.
    for (const polygons of faces)
      expect(polygons).toEqual([
        `<polygon points="2,20 10,23.5 10,35.5 2,32" fill="${colors.left}"/>`,
        `<polygon points="18,20 10,23.5 10,35.5 18,32" fill="${colors.right}"/>`,
        `<polygon points="10,16.5 18,20 10,23.5 2,20" fill="${colors.top}" stroke="${colors.top}" stroke-width="0.3"/>`,
      ]);
  });

  it('leaves the classic and pixel block paths unchanged', () => {
    // Given: the same tall calendar outside the current miniature surface context.
    const cells = dates.map((date) => cell(date));
    // When: legacy blocks and the pixel context render the cells.
    const legacy = cells.map((value) => renderBlock(value)).join('');
    const pixel = withSurfaceContext({ artStyle: 'pixel', hemisphere: 'north' }, () =>
      cells.map((value) => renderBlock(value)).join(''),
    );
    // Then: neither path receives miniature detail.
    expect(pixel).toBe(legacy);
    expect(legacy).not.toMatch(/data-surface|data-strata/);
  });
});
