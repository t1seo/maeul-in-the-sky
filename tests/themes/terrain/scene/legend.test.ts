import { describe, expect, it } from 'vitest';
import type { SceneCell } from '../../../../src/core/scene-types.js';
import { renderTerrain, prepareTerrainScene } from '../../../../src/themes/terrain/index.js';
import { getTerrainPalette100 } from '../../../../src/themes/terrain/palette.js';
import { renderPresentation } from '../../../../src/themes/terrain/scene/presentation.js';
import { calendarFixture, sceneOptions } from './fixtures.js';

function occurrences(svg: string, marker: string): number {
  return svg.split(marker).length - 1;
}

describe('Village collection presentation', () => {
  it.each(['dark', 'light'] as const)(
    'replaces the visible height key with landscape discoveries in %s mode',
    (mode) => {
      const svg = renderTerrain(calendarFixture(), sceneOptions)[mode];
      expect(occurrences(svg, 'class="village-collection"')).toBe(1);
      expect(svg).toContain('>Village collection</text>');
      expect(svg).toContain('>In this landscape</text>');
      expect(svg).not.toContain('class="height-legend');
      expect(svg).not.toContain('>Contribution height');
      expect(svg).toContain('Terrain height follows daily contributions.');
      expect(svg).toContain('Fixed scale from 0 to 25 contributions.');
    },
  );

  it('keeps the card statistics readable above the compact collection', () => {
    // Given: a complete leap-year Contribution Calendar in card layout.
    const data = calendarFixture('2000-01-01', 366, 4);

    // When: the card is rendered.
    const svg = renderTerrain(data, { ...sceneOptions, layout: 'card' }).light;

    // Then: the collection replaces the key and statistics retain the required text size.
    expect(occurrences(svg, 'class="village-collection"')).toBe(1);
    expect(svg).toContain('class="stats-bar"');
    expect(svg).toContain('font-size="16"');
    expect(svg).toContain('>1,464</text>');
  });

  it.each([1, 0.5])('retains accessible height meaning for a scale maximum of %s', (maximum) => {
    // Given: a valid prepared scene whose presentation scale has a tiny maximum.
    const base = prepareTerrainScene(calendarFixture('2025-01-01', 3), sceneOptions);
    const scene = { ...base, normalization: { ...base.normalization, maxCount: maximum } };

    // When: the collection and other presentation content are rendered.
    const content = renderPresentation(scene, getTerrainPalette100('light'));

    // Then: removing visible height bars preserves their accessible explanation.
    expect(content).toContain(`Fixed scale from 0 to ${maximum} contributions.`);
    expect(content).toContain('Terrain colors follow the seasons.');
    expect(content).not.toContain('class="height-legend');
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
