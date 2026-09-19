import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../../src/core/animation.js';
import type { IsoCell } from '../../../src/themes/terrain/blocks.js';
import { getTerrainPalette100 } from '../../../src/themes/terrain/palette.js';
import {
  clipSeasonalWeather,
  clipSeasonalWeatherToCells,
} from '../../../src/themes/terrain/effects/seasonal-weather-clip.js';
import { renderSeasonalWeather } from '../../../src/themes/terrain/effects/seasonal-weather.js';
import { withSurfaceContext } from '../../../src/themes/terrain/scene/surface-context.js';

const palette = getTerrainPalette100('light');
const miniature = { artStyle: 'miniature', hemisphere: 'north' } as const;

function cell(date: string, isoX = 40, isoY = 70): IsoCell {
  return {
    date,
    isoX,
    isoY,
    week: 0,
    day: 0,
    level100: 0,
    height: 0,
    colors: palette.getElevation(0),
  };
}

function raster(markup: string): Buffer {
  return new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="120">${markup}</svg>`,
    { font: { loadSystemFonts: false } },
  ).render().pixels;
}

const alphaAt = (pixels: Buffer, x: number, y: number): number => pixels[(y * 320 + x) * 4 + 3];

describe('weather-only airspace clipping', () => {
  it('keeps air above separated winter dates without bridging the missing calendar', () => {
    // Given: winter observations at opposite ends of a sparse calendar.
    const cells = [cell('2025-01-01'), cell('2025-12-25', 280)];
    // When: a large painted area is restricted to the actual dated airspaces.
    const pixels = raster(
      clipSeasonalWeatherToCells('<rect width="320" height="120"/>', cells, 'snow'),
    );
    // Then: airborne weather survives, but calendar gaps and space below the terrain do not.
    expect(alphaAt(pixels, 40, 44)).toBe(255);
    expect(alphaAt(pixels, 280, 44)).toBe(255);
    expect(alphaAt(pixels, 160, 44)).toBe(0);
    expect(alphaAt(pixels, 40, 80)).toBe(0);
  });

  it('limits weather paint to the supplied viewport without clipping adjacent artwork', () => {
    // Given: weather is surrounded by artwork outside the viewport.
    const bounds = { x: 40, y: 30, width: 60, height: 50 };
    const surrounding = '<rect x="10" y="10" width="5" height="5"/>';
    // When: only the weather fragment receives its viewport clip.
    const pixels = raster(
      surrounding + clipSeasonalWeather('<rect width="320" height="120"/>', bounds),
    );
    // Then: weather cannot intrude into UI space, while unrelated artwork remains visible.
    expect(alphaAt(pixels, 50, 40)).toBe(255);
    expect(alphaAt(pixels, 50, 20)).toBe(0);
    expect(alphaAt(pixels, 110, 40)).toBe(0);
    expect(alphaAt(pixels, 11, 11)).toBe(255);
  });

  it.each(['light', 'dark'] as const)(
    'retains visible still weather for one dated cell in %s',
    (mode) => {
      // Given: even a one-day calendar has a valid season and a matching light palette.
      const dates = ['2025-01-01', '2025-04-01', '2025-07-01', '2025-10-01'];
      // When: each season is rasterized through both weather clips with motion off.
      const painted = dates.map((date) => {
        const markup = withSurfaceContext(miniature, () =>
          withMotionContext({ mode: 'off', namespace: `single-${mode}` }, () =>
            clipSeasonalWeather(
              renderSeasonalWeather([cell(date)], 42, getTerrainPalette100(mode)),
              { x: 20, y: 20, width: 80, height: 70 },
            ),
          ),
        );
        const pixels = raster(markup);
        let alpha = 0;
        for (let index = 3; index < pixels.length; index += 4) alpha += pixels[index] / 255;
        return alpha;
      });
      // Then: no season disappears because its only particle was clipped or faded away.
      expect(painted.every((alpha) => alpha > 2)).toBe(true);
    },
  );

  it('namespaces both clips and leaves no output for absent observations', () => {
    // Given: two archive rows or motion branches share the same seasonal dates.
    const names = ['row-1:static', 'row-2:active'];
    // When: both render independently named weather clips.
    const outputs = names.map((namespace) =>
      withMotionContext({ mode: 'off', namespace }, () =>
        withSurfaceContext(miniature, () =>
          clipSeasonalWeather(renderSeasonalWeather([cell('2025-01-01')], 42, palette), {
            x: 20,
            y: 20,
            width: 80,
            height: 70,
          }),
        ),
      ),
    );
    const markup = outputs.join('');
    const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    const refs = [...markup.matchAll(/url\(#([^)]*)\)/g)].map((match) => match[1]);
    // Then: every reference resolves to a unique local definition and empty calendars remain empty.
    expect(ids).toHaveLength(4);
    expect(new Set(ids).size).toBe(ids.length);
    expect(refs.every((id) => ids.includes(id))).toBe(true);
    expect(
      clipSeasonalWeather(renderSeasonalWeather([], 42, palette), {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
      }),
    ).toBe('');
  });
});
