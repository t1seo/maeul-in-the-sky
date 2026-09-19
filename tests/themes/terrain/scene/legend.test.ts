import { describe, expect, it } from 'vitest';
import { SaxesParser } from 'saxes';
import type { SceneCell } from '../../../../src/core/scene-types.js';
import { renderTerrain, prepareTerrainScene } from '../../../../src/themes/terrain/index.js';
import {
  getSeasonalPalette100,
  getTerrainPalette100,
} from '../../../../src/themes/terrain/palette.js';
import { renderHeightLegend } from '../../../../src/themes/terrain/scene/legend.js';
import { renderPresentation } from '../../../../src/themes/terrain/scene/presentation.js';
import { calendarFixture, sceneOptions } from './fixtures.js';

function occurrences(svg: string, marker: string): number {
  return svg.split(marker).length - 1;
}

function heightBars(svg: string) {
  const bars: { readonly height: number; readonly bottom: number; readonly fill: string }[] = [];
  const parser = new SaxesParser({ xmlns: false });
  parser.on('opentag', (tag) => {
    if (tag.name === 'rect' && tag.attributes.class === 'height-legend-swatch') {
      const height = Number(tag.attributes.height);
      bars.push({ height, bottom: Number(tag.attributes.y) + height, fill: tag.attributes.fill });
    }
  });
  parser.write(svg).close();
  return bars;
}

describe('terrain height legend', () => {
  it.each(['dark', 'light'] as const)(
    'explains contribution height with ascending neutral bars in %s mode',
    (mode) => {
      // Given: a fixed normalization scale and the actual mode palette.
      const palette = getTerrainPalette100(mode);

      // When: the public banner renderer shades the prepared scene.
      const svg = renderTerrain(calendarFixture(), sceneOptions)[mode];

      // Then: shape encodes height, while one neutral color avoids a seasonal color key.
      expect(occurrences(svg, 'class="height-legend-swatch"')).toBe(5);
      const bars = heightBars(svg);
      expect(new Set(bars.map((bar) => bar.fill))).toEqual(new Set([palette.text.secondary]));
      expect(new Set(bars.map((bar) => bar.bottom)).size).toBe(1);
      expect(bars.every((bar, index) => index === 0 || bar.height > bars[index - 1].height)).toBe(
        true,
      );
      expect(svg).toContain('aria-label="Contribution height legend.');
      expect(svg).toContain('Fixed scale');
      expect(svg).toContain('0–25 contributions');
      for (const bin of ['Empty', 'Low', 'Mid', 'High', 'Max']) {
        expect(svg).toContain(`>${bin}</text>`);
      }
      expect(svg).not.toContain('Water and trees are scenery');
    },
  );

  it.each(['banner', 'card'] as const)(
    'keeps the %s height key consistent through all four seasonal palettes',
    (layout) => {
      // Given: the same contributions with four different seasonal surface colors.
      const scene = prepareTerrainScene(calendarFixture(), { ...sceneOptions, layout });
      const palettes = [0, 14, 28, 42].map((week) => getSeasonalPalette100('light', week));

      // When: each seasonal palette renders the same contribution key.
      const legends = palettes.map((palette) => heightBars(renderHeightLegend(scene, palette)));

      // Then: changing seasons never changes the key's meaning or geometry.
      expect(new Set(palettes.map((palette) => palette.getElevation(45).top)).size).toBeGreaterThan(
        1,
      );
      for (const bars of legends) expect(bars).toEqual(legends[0]);
    },
  );

  it('keeps the card statistics readable while adding the compact legend', () => {
    // Given: a complete leap-year Contribution Calendar in card layout.
    const data = calendarFixture('2000-01-01', 366, 4);

    // When: the card is rendered.
    const svg = renderTerrain(data, { ...sceneOptions, layout: 'card' }).light;

    // Then: the five-bin legend is present and statistics retain the required text size.
    expect(occurrences(svg, 'class="height-legend-swatch"')).toBe(5);
    expect(svg).toContain('class="stats-bar"');
    expect(svg).toContain('font-size="16"');
  });

  it.each([1, 0.5])('uses truthful categorical bins when the scale maximum is %s', (maximum) => {
    // Given: a valid prepared scene whose presentation scale has a tiny maximum.
    const base = prepareTerrainScene(calendarFixture('2025-01-01', 3), sceneOptions);
    const scene = { ...base, normalization: { ...base.normalization, maxCount: maximum } };

    // When: the legend is rendered.
    const content = renderPresentation(scene, getTerrainPalette100('light'));

    // Then: height bands remain categorical, never duplicate exact counts.
    expect(occurrences(content, 'class="height-legend-swatch"')).toBe(5);
    expect(content).toContain(`0–${maximum} contributions`);
    expect(content).not.toContain('contributions, elevation');
    expect(content).toContain('Low contribution height; representative elevation 20 of 99');
    expect(content).toContain('Max contribution height; representative elevation 99 of 99');
  });
});

describe('calendar timeline cues', () => {
  it('places supplied month and season cues on a bounded banner timeline', () => {
    // Given: a 54-week leap-year Contribution Calendar.
    const data = calendarFixture('2000-01-01', 366, 4);

    // When: the banner is rendered.
    const svg = renderTerrain(data, sceneOptions).dark;

    // Then: date-keyed cues replace the unpositioned season prose without losing the range.
    expect(svg).toContain('class="calendar-timeline"');
    expect(svg).toContain('data-date="2000-01-01"');
    expect(svg).toContain('data-month="2000-01"');
    expect(svg).toContain('data-season="Winter"');
    expect(svg).toContain('data-month="2000-12"');
    expect(svg).toContain('2000-01-01 to 2000-12-31');
    expect(svg).not.toContain('Winter · Spring · Summer · Autumn');
    expect(occurrences(svg, 'class="calendar-cue"')).toBeLessThanOrEqual(8);
  });

  it('uses only supplied cells for partial and gapped extreme-year cues', () => {
    // Given: three supplied cells with a huge empty calendar gap and supported edge years.
    const base = prepareTerrainScene(calendarFixture('2025-01-01', 3), sceneOptions);
    const cells: readonly SceneCell[] = [
      { ...base.cells[0], date: '0001-01-01', week: 0 },
      { ...base.cells[1], date: '5000-06-15', week: 260_852 },
      { ...base.cells[2], date: '9999-12-31', week: 521_704 },
    ];
    const scene = {
      ...base,
      year: 1,
      fromDate: '0001-01-01',
      toDate: '9999-12-31',
      cells,
      settings: { ...base.settings, layout: 'card' as const },
    };

    // When: presentation-only SVG content is rendered from those supplied cells.
    const content = renderPresentation(scene, getTerrainPalette100('light'));

    // Then: work and output stay bounded while both ends and the real gap cue remain explicit.
    expect(occurrences(content, 'class="calendar-cue"')).toBe(3);
    expect(content).toContain('data-date="0001-01-01"');
    expect(content).toContain('data-date="5000-06-15"');
    expect(content).toContain('data-date="9999-12-31"');
    expect(content).toContain('0001-01-01 to 9999-12-31');
  });

  it('describes an empty Contribution Calendar without inventing calendar cues', () => {
    // Given: an empty Contribution Calendar.
    const empty = calendarFixture('2025-01-01', 0);

    // When: the empty terrain is rendered.
    const svg = renderTerrain(empty, sceneOptions).light;

    // Then: the timeline exposes the empty state and no dated cue is invented.
    expect(svg).toContain('class="calendar-timeline"');
    expect(svg).toContain('No dates supplied');
    expect(occurrences(svg, 'class="calendar-cue"')).toBe(0);
  });
});
