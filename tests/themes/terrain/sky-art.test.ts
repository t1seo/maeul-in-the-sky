import { Resvg } from '@resvg/resvg-js';
import { SaxesParser } from 'saxes';
import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../../src/core/animation.js';
import { renderCelestials, renderClouds } from '../../../src/themes/terrain/effects/sky.js';
import { getTerrainPalette100 } from '../../../src/themes/terrain/palette.js';

const frame = (body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="240">${body}</svg>`;

describe('premium sky artwork', () => {
  it.each(['dark', 'light'] as const)(
    'paints cohesive opaque cloud volumes when the palette is %s',
    (mode) => {
      const palette = getTerrainPalette100(mode);
      const clouds = withMotionContext({ mode: 'off', namespace: 'cloud-art' }, () =>
        renderClouds(42, palette),
      );
      const { pixels } = new Resvg(frame(clouds)).render();
      let visible = 0;
      let opaque = 0;
      for (let index = 3; index < pixels.length; index += 4) {
        if (pixels[index] > 0) visible++;
        if (pixels[index] === 255) opaque++;
      }
      expect(visible).toBeGreaterThan(500);
      expect(opaque / visible).toBeGreaterThan(0.75);
      expect(clouds).not.toContain('<ellipse');
      const silhouettes = Array.from(
        clouds.matchAll(/class="cloud-body" d="([^"]+)"/g),
        (match) => match[1],
      );
      expect(silhouettes).toHaveLength(2);
      expect(new Set(silhouettes).size).toBe(2);
    },
  );

  it('gives the crescent an illuminated rim and clipped crater relief without painting over the sky', () => {
    const palette = getTerrainPalette100('dark');
    const moon = renderCelestials(42, palette, true);
    expect(moon).toMatch(/class="moon-body"[^>]*d="[^"]+"/);
    expect(moon).toContain('class="moon-craters"');
    expect(moon).toContain('<clipPath');
    expect(moon).toContain('<radialGradient');
    expect(moon).not.toContain(`fill="${palette.bg.subtle}"`);
  });

  it('gives the sun a continuous warm disc and a designed corona', () => {
    const sun = renderCelestials(42, getTerrainPalette100('light'), false);
    expect(sun).toContain('class="sun-body"');
    expect(sun).toContain('class="sun-corona"');
    expect(sun).toContain('<radialGradient');
    expect(sun).not.toMatch(/<animate|<filter/);
  });

  it.each(['dark', 'light'] as const)(
    'resolves every sky paint reference locally across hostile namespaces in %s',
    (mode) => {
      const palette = getTerrainPalette100(mode);
      const fragments = ['first " <>&', 'second / 한국'].map((namespace) =>
        withMotionContext(
          { mode: 'off', namespace },
          () => renderCelestials(42, palette, mode === 'dark') + renderClouds(42, palette),
        ),
      );
      const svg = frame(fragments.join(''));
      const definitions = Array.from(svg.matchAll(/\sid="([^"]+)"/g), (match) => match[1]);
      const references = Array.from(svg.matchAll(/url\(#([^)]+)\)/g), (match) => match[1]);
      expect(definitions.length).toBeGreaterThan(0);
      expect(new Set(definitions).size).toBe(definitions.length);
      expect(references.length).toBeGreaterThan(0);
      for (const reference of references) expect(definitions).toContain(reference);
      for (const definition of definitions) expect(definition).toMatch(/^m-[A-Za-z0-9_-]+$/);
      expect(() => new SaxesParser({ xmlns: true }).write(svg).close()).not.toThrow();
      expect(() => new Resvg(svg).render()).not.toThrow();
    },
  );
});
