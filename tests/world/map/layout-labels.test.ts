import { expect, test } from 'vitest';
import { SaxesParser } from 'saxes';
import { buildWorld, defaultWorldView, frameWorld } from '../../../src/world/model/index.js';
import { renderMapLabels } from '../../../src/world/map/labels.js';
import { mapPalette } from '../../../src/world/map/palette.js';
import { mapTransform } from '../../../src/world/map/projection.js';
import type { WorldInput, WorldScene } from '../../../src/world/model/types.js';
import { inputFor } from '../model/helpers.js';

function labels(scene: WorldScene) {
  const view = defaultWorldView(scene);
  const tags: Record<string, string>[] = [];
  const parser = new SaxesParser();
  parser.on('opentag', (tag) => tags.push({ ...tag.attributes }));
  const svg = renderMapLabels(
    scene,
    frameWorld(scene, view),
    mapTransform(scene, view),
    mapPalette('spring', 'day'),
  );
  parser.write(`<svg>${svg}</svg>`).close();
  return { svg, tags };
}

function seasonal(
  source: WorldInput,
  hemisphere: 'north' | 'south' = 'north',
  culture: 'classic' | 'korean' = 'korean',
) {
  return buildWorld({
    ...source,
    settings: { ...source.settings, layout: 'seasonal', hemisphere, culture },
  });
}

test.each([
  ['north', 'classic'],
  ['north', 'korean'],
  ['south', 'classic'],
  ['south', 'korean'],
] as const)(
  'labels four seasonal landmasses in English without competing month labels in %s with %s architecture',
  (hemisphere, culture) => {
    // Given an annual seasonal world.
    const scene = seasonal(
      inputFor([
        ['2024-01-01', 1],
        ['2024-12-31', 2],
      ]),
      hemisphere,
      culture,
    );
    // When its map labels are generated.
    const result = labels(scene);
    // Then each real season has one prominent label and every source month remains identified.
    expect(
      result.tags
        .filter((tag) => tag['data-season-label'])
        .map((tag) => tag['data-season-label'])
        .sort(),
    ).toEqual(['autumn', 'spring', 'summer', 'winter']);
    for (const season of ['Spring', 'Summer', 'Autumn', 'Winter']) {
      expect(result.svg).toContain(`</title>${season}</text>`);
      expect(result.svg).toContain(`<title>${season} · `);
    }
    expect(result.tags.filter((tag) => tag['data-month-label'])).toHaveLength(0);
    for (const month of scene.islands.flatMap((island) => island.monthKeys))
      expect(result.svg).toContain(month);
  },
);

test('uses the actual southern season for a partial February map', () => {
  // Given only February in the southern hemisphere.
  const scene = seasonal(
    inputFor([['2024-02-28', 3]], 2024, { from: '2024-02-28', to: '2024-02-29' }),
    'south',
  );
  // When its map labels are rendered.
  const result = labels(scene);
  // Then there is one summer label and no invented seasons.
  expect(
    result.tags.filter((tag) => tag['data-season-label']).map((tag) => tag['data-season-label']),
  ).toEqual(['summer']);
  expect(result.svg).toContain('Summer');
});

test.each(['archipelago', 'island'] as const)(
  'keeps absolute month labels for a rolling %s world',
  (layout) => {
    // Given a rolling world with January in two years.
    const source = inputFor([
      ['2024-01-01', 1],
      ['2025-01-01', 1],
    ]);
    const scene = buildWorld({ ...source, settings: { ...source.settings, layout } });
    // When labels are generated.
    const result = labels(scene);
    // Then all thirteen months retain their year-month identity.
    const months = result.tags
      .filter((tag) => tag['data-month-label'])
      .map((tag) => tag['data-month-label']);
    expect(months).toHaveLength(13);
    expect(months[0]).toBe('2024-01');
    expect(months.at(-1)).toBe('2025-01');
  },
);

test('labels all four circle landscapes without inventing dates for absent seasons', () => {
  // Given: only February records in a complete four-season landscape.
  const source = inputFor([['2024-02-28', 3]], 2024, { from: '2024-02-28', to: '2024-02-29' });
  const scene = buildWorld({
    ...source,
    settings: { ...source.settings, layout: 'seasonal-circle' },
  });
  // When: the circle map is labelled.
  const result = labels(scene);
  const seasons = result.tags.filter((tag) => tag['data-season-label']);
  // Then: all four geographic seasons appear; month evidence contains only February.
  expect(seasons.map((tag) => tag['data-season-label']).sort()).toEqual([
    'autumn',
    'spring',
    'summer',
    'winter',
  ]);
  expect(seasons.flatMap((tag) => (tag['data-months'] ?? '').split(' ').filter(Boolean))).toEqual([
    '2024-02',
  ]);
  expect(result.tags.filter((tag) => tag['data-month-label'])).toHaveLength(0);
});
