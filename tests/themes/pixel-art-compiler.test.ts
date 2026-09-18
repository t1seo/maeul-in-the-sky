import { describe, expect, it } from 'vitest';
import { compilePixelSprite } from '../../scripts/pixel/sample.js';
import { pixelSources } from '../../scripts/pixel/sources.js';
import {
  diagnosticPalette,
  inferPixelPaints,
  PixelCompileError,
} from '../../scripts/pixel/paints.js';
import { resolvePixelPaint } from '../../src/themes/terrain/pixel/colors.js';
import { encodePixelRuns } from '../../src/themes/terrain/pixel/encode.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import { lerpColor } from '../../src/utils/color.js';

describe('offline pixel compiler', () => {
  it('assigns a distinct diagnostic color to every current palette role', () => {
    const colors = Object.values(diagnosticPalette());
    expect(new Set(colors).size).toBe(colors.length);
  });

  it('distinguishes giwa from anvil even when their base palette colors match', () => {
    const sprite = compilePixelSprite(
      (colors) =>
        `<rect width="1" height="1" fill="${colors.giwa}"/><rect x="1" width="1" height="1" fill="${colors.anvil}"/>`,
      { x: 0, y: 0, width: 2, height: 1 },
    );
    expect(sprite.layers.map((layer) => layer.paint)).toEqual(['giwa', 'anvil']);
  });

  it('expands shorthand palette whites before resolving material shading', () => {
    const colors = { ...getTerrainPalette100('light').assets, wall: '#804000', sail: '#fff' };
    expect(
      resolvePixelPaint(
        [
          ['wall', 0.78],
          ['sail', 0.22],
        ],
        colors,
      ),
    ).toBe(lerpColor('#804000', '#ffffff', 0.22));
  });

  it('rejects palette-dependent geometry instead of baking one mode', () => {
    expect(() =>
      inferPixelPaints(
        (colors) =>
          `<rect width="${colors.pine === '#000000' ? 1 : 2}" height="1" fill="${colors.pine}"/>`,
      ),
    ).toThrow(PixelCompileError);
  });

  it('does not mistake premultiplied translucent orange for opaque brown', () => {
    const sprite = compilePixelSprite(
      () =>
        '<rect width="1" height="1" fill="#ff8000" opacity="0.5"/><rect x="1" width="1" height="1" fill="#804000"/>',
      { x: 0, y: 0, width: 2, height: 1 },
    );
    expect(sprite.layers.find((layer) => layer.d.startsWith('M0,0'))?.paint).toBe('#ff8000');
  });

  it('keeps tiny translucent fireflies visible on the common grid', () => {
    const source = pixelSources().find((entry) => entry.id === 'fireflies');
    expect(source).toBeDefined();
    if (!source) return;
    for (const variant of [0, 1, 2]) {
      expect(
        compilePixelSprite((colors) => source.render(colors, variant), source.bounds).pixels,
      ).toBeGreaterThan(0);
    }
  });

  it('merges a solid pixel block into one compact rectangle without bridging holes', () => {
    const paths = encodePixelRuns({
      x: 0,
      y: 0,
      width: 3,
      height: 3,
      colors: [1, 1, -1, 1, 1, -1, -1, -1, 1],
    });
    expect(paths.get(1)).toBe('M0,0h1v1h-1zM1,1h0.5v0.5h-0.5z');
  });

  it('retains direct roles, mixed material shading and hardcoded accent colors', () => {
    const paints = inferPixelPaints(
      (colors) =>
        `<g><path fill="${colors.pine}"/><path fill="${lerpColor(colors.wall, colors.pine, 0.22)}"/><path fill="#f04"/></g>`,
    );
    expect(paints).toContain('pine');
    expect(paints).toContain('#ff0044');
    const colors = getTerrainPalette100('dark').assets;
    expect(resolvePixelPaint(paints[1], colors)).toBe(lerpColor(colors.wall, colors.pine, 0.22));
  });
});
