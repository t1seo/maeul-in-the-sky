import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../src/core/animation.js';
import { EPIC_BOUNDS } from '../../src/themes/terrain/epics/bounds.js';
import { EPIC_RENDERERS } from '../../src/themes/terrain/epics/renderers.js';
import { renderCatalogEpic } from '../../src/themes/terrain/epics/rendering.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import type { EpicBuildingType } from '../../src/themes/terrain/epics/types.js';

const ids = Object.keys(EPIC_BOUNDS).filter((id): id is EpicBuildingType =>
  Object.hasOwn(EPIC_RENDERERS, id),
);
const moving = [
  'windmillGrand',
  'aurora',
  'bioluminescentPool',
  'worldTree',
  'sakuraEternal',
  'ancientPortal',
] as const;
const scale = 8;
const size = 32 * scale;

function raster(fragment: string, factor = scale): Buffer {
  return new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${32 * factor}" height="${32 * factor}" viewBox="-16 -20 32 32">${fragment}</svg>`,
    { font: { loadSystemFonts: false } },
  ).render().pixels;
}

function alpha(pixels: Buffer): Buffer {
  return Buffer.from(pixels.filter((_, index) => index % 4 === 3));
}

function extent(pixels: Buffer) {
  let left = size,
    top = size,
    right = -1,
    bottom = -1;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      if (pixels[(py * size + px) * 4 + 3] > 0) {
        left = Math.min(left, px);
        top = Math.min(top, py);
        right = Math.max(right, px);
        bottom = Math.max(bottom, py);
      }
    }
  }
  return {
    left: left / scale - 16,
    top: top / scale - 20,
    right: (right + 1) / scale - 16,
    bottom: (bottom + 1) / scale - 20,
  };
}

function checkBounds(id: EpicBuildingType, svg: string): void {
  const painted = extent(raster(svg));
  const bounds = EPIC_BOUNDS[id];
  expect(painted.right, id).toBeGreaterThan(painted.left);
  expect(painted.bottom, id).toBeGreaterThan(painted.top);
  expect(painted.left, id).toBeGreaterThanOrEqual(bounds.x);
  expect(painted.top, id).toBeGreaterThanOrEqual(bounds.y);
  expect(painted.right, id).toBeLessThanOrEqual(bounds.x + bounds.width);
  expect(painted.bottom, id).toBeLessThanOrEqual(bounds.y + bounds.height);
}

describe('Wonder miniature rendering contract', () => {
  for (const mode of ['light', 'dark'] as const) {
    it.each(ids)(`keeps %s inside its existing bounds in ${mode}`, (id) => {
      // Given: the published footprint and actual palette for each original ID.
      const c = getTerrainPalette100(mode).assets;
      // When: the public catalog adapter renders the resting miniature.
      const svg = withMotionContext({ mode: 'off', namespace: '' }, () => renderCatalogEpic(id, c));
      // Then: every visible sample is contained without expanding the layout contract.
      checkBounds(id, svg);
    });
  }

  it.each(ids)('retains the same %s silhouette across lighting and placement', (id) => {
    // Given: identical artwork in light/dark palettes and a relocated anchor.
    const light = getTerrainPalette100('light').assets;
    const dark = getTerrainPalette100('dark').assets;
    // When: the renderer is called through its preserved three-argument interface.
    const original = EPIC_RENDERERS[id](0, 0, light);
    const lit = EPIC_RENDERERS[id](0, 0, dark);
    const relocated = `<g transform="translate(-13,8)">${EPIC_RENDERERS[id](13, -8, light)}</g>`;
    // Then: paint and coordinate changes never alter the object geometry.
    expect(alpha(raster(lit))).toEqual(alpha(raster(original)));
    expect(raster(relocated)).toEqual(raster(original));
    expect(EPIC_RENDERERS[id](0, 0, light)).toBe(original);
  });

  it.each(moving)('retains the complete resting %s with motion disabled', (id) => {
    // Given: the same landmark with the two existing motion contexts.
    const c = getTerrainPalette100('dark').assets;
    // When: the real helper controls animation hooks at creation.
    const full = withMotionContext({ mode: 'full', namespace: 'wonder-art' }, () =>
      EPIC_RENDERERS[id](0, 0, c),
    );
    const off = withMotionContext({ mode: 'off', namespace: 'wonder-art' }, () =>
      EPIC_RENDERERS[id](0, 0, c),
    );
    // Then: only motion disappears, with the entire shape and material preserved.
    expect(full).toMatch(/<animateTransform|epic-glow-pulse|epic-portal-swirl/);
    expect(off).not.toMatch(/<animate|epic-glow-pulse|epic-portal-swirl/);
    expect(raster(full)).toEqual(raster(off));
  });

  it.each(ids)('renders a visible native-size %s without external resources', (id) => {
    // Given: the miniature is displayed at one SVG unit per pixel.
    const c = getTerrainPalette100('dark').assets;
    // When: the finished artwork is rendered at native size.
    const svg = withMotionContext({ mode: 'off', namespace: '' }, () =>
      EPIC_RENDERERS[id](0, 0, c),
    );
    const coverage = alpha(raster(svg, 1));
    // Then: it has a solid main mass and no filters, definitions or asset requests.
    expect(coverage.filter((value) => value > 127).length).toBeGreaterThan(6);
    expect(svg).not.toMatch(/<filter|<defs|<image|<foreignObject|url\(|NaN|Infinity/);
    expect((svg.match(/<(?!\/)/g) ?? []).length).toBeLessThanOrEqual(20);
  });

  it.each([0, 22.5, 45, 67.5, 90, 135, 180, 225, 270, 315])(
    'contains the windmill sails through rotation %s',
    (angle) => {
      // Given: the actual complete sail group and every geometric travel extremum.
      const c = getTerrainPalette100('light').assets;
      const svg = withMotionContext({ mode: 'off', namespace: '' }, () =>
        EPIC_RENDERERS.windmillGrand(0, 0, c),
      );
      // When: its rotating group is placed at the given instantaneous angle.
      const posed = svg.replace(
        '<g transform="translate(0,-7.5)"><g>',
        `<g transform="translate(0,-7.5)"><g transform="rotate(${angle})">`,
      );
      // Then: the larger cloth sails remain inside the original moving footprint.
      checkBounds('windmillGrand', posed);
    },
  );
});
