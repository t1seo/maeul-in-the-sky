import { describe, expect, it } from 'vitest';
import { prepareTerrainScene, renderTerrainScene } from '../../../src/themes/terrain/index.js';
import { measureSvg } from '../../../scripts/benchmark/svg-metrics.js';
import { calendarFixture, sceneOptions } from './scene/fixtures.js';

function riverScene(start = '2025-07-06', count = 4) {
  const scene = prepareTerrainScene(calendarFixture(start, 28, count), sceneOptions);
  return {
    ...scene,
    biomes: scene.biomes.map((entry) => ({
      ...entry,
      biome: {
        ...entry.biome,
        isRiver: entry.day === 6 || (entry.week === 1 && entry.day === 3),
        isPond: false,
      },
    })),
  };
}

describe('SVG sky-island river outlets', () => {
  it('drops only exposed river edges and preserves dated contribution geometry', () => {
    // Given: four observed weeks with a river along the front coast and one inland cell.
    const scene = riverScene();
    const original = JSON.stringify(scene);
    // When: a still keepsake is rendered.
    const svg = renderTerrainScene(scene, 'dark');
    // Then: the coast has bounded waterfalls, never the inland river or invented observations.
    const outlets = [...svg.matchAll(/data-waterfall="true" data-week="(\d+)" data-day="(\d+)"/g)];
    expect(outlets.length).toBeGreaterThan(0);
    expect(outlets.length).toBeLessThanOrEqual(4);
    expect(outlets.every((outlet) => outlet[2] === '6')).toBe(true);
    expect(svg).toContain('data-waterfall-mist');
    expect(JSON.stringify(scene)).toBe(original);
  });

  it.each(['full', 'subtle', 'off'] as const)(
    'honors %s motion without executable SVG',
    (motion) => {
      // Given: a liquid coastline in summer.
      const scene = riverScene();
      // When: the configured motion policy renders the actual SVG.
      const svg = renderTerrainScene(scene, 'light', { motion });
      const metrics = measureSvg(svg);
      // Then: water falls remain visible, with bounded animation and a complete static pose.
      expect(svg).toContain('data-waterfall="true"');
      expect(metrics.cssTargets + metrics.smilElements).toBeLessThanOrEqual(50);
      expect(metrics.danglingReferences).toEqual([]);
      expect(metrics.duplicateIds).toEqual([]);
      expect(metrics.scripts + metrics.eventHandlers).toBe(0);
      if (motion === 'off') expect(svg).not.toMatch(/@keyframes|animation\s*:|<animate/);
      else expect(svg).toContain('waterfall-flow');
    },
  );

  it('keeps frozen northern water still while the southern summer flows', () => {
    // Given: natural-water contribution levels in January.
    const scene = riverScene('2025-01-05', 1);
    // When: the same source is viewed in each hemisphere.
    const north = renderTerrainScene(scene, 'light');
    const south = renderTerrainScene(
      { ...scene, settings: { ...scene.settings, hemisphere: 'south' } },
      'light',
    );
    // Then: the new effect follows the existing freeze policy.
    expect(north).not.toContain('data-waterfall="true"');
    expect(south).toContain('data-waterfall="true"');
  });

  it('leaves the pixel rendering path and empty calendars unchanged', () => {
    // Given: an opted-in pixel style and an empty observed calendar.
    const scene = riverScene();
    const empty = prepareTerrainScene(calendarFixture('2025-07-06', 0), sceneOptions);
    // When: both are rendered.
    const outputs = [
      renderTerrainScene(scene, 'dark', { artStyle: 'pixel' }),
      renderTerrainScene(empty, 'dark'),
    ];
    // Then: neither receives miniature waterfall geometry.
    for (const output of outputs) expect(output).not.toContain('data-waterfall="true"');
  });
});
