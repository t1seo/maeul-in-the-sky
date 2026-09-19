import { describe, expect, it } from 'vitest';
import { measureSvg } from '../../../scripts/benchmark/svg-metrics.js';
import { benchmarkFixtures, BENCHMARK_OPTIONS } from '../../../scripts/qa/fixtures.js';
import { terrainTheme } from '../../../src/themes/terrain/index.js';

describe('surface motion shares the complete original SVG budget', () => {
  it.each(['t1seo', 'octocat', 'surface-check'])(
    'keeps all existing motion and new surface effects within 50 for %s',
    (username) => {
      // Given: the actual full-contribution reference with a different deterministic profile seed.
      const data = { ...benchmarkFixtures()[2].data, username };
      // When: the public theme produces the complete full-motion original SVG.
      const svg = terrainTheme.render(data, BENCHMARK_OPTIONS).dark;
      const measured = measureSvg(svg);
      // Then: counting actual CSS targets and SMIL elements respects the original budget.
      expect(measured.cssTargets + measured.smilElements).toBeLessThanOrEqual(50);
      expect(svg).toContain('data-seasonal="butterflies"');
      expect(svg).toContain('data-water-current="true"');
    },
  );
});
