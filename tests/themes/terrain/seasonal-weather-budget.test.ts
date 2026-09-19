import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { benchmarkReportSchema } from '../../../scripts/benchmark/schema.js';
import { measureSvg } from '../../../scripts/benchmark/svg-metrics.js';
import { BENCHMARK_OPTIONS, benchmarkFixtures } from '../../../scripts/qa/fixtures.js';
import { terrainTheme } from '../../../src/themes/terrain/index.js';

const baseline = benchmarkReportSchema.parse(
  JSON.parse(
    readFileSync(new URL('../../fixtures/benchmark-baseline.json', import.meta.url), 'utf8'),
  ),
);

describe('seasonal weather within stored SVG budgets', () => {
  it.each(benchmarkFixtures())(
    'keeps $name output within existing byte and motion limits',
    ({ name, data }) => {
      // Given: the approved structural budget for the same public renderer fixture.
      const previous = baseline.fixtures.find((fixture) => fixture.name === name);
      expect(previous).toBeDefined();
      if (!previous) return;
      // When: the current public theme renders both lighting modes with seasonal weather.
      const outputs = terrainTheme.render(data, BENCHMARK_OPTIONS);
      // Then: weather detail remains inside the unchanged byte, element and global motion budgets.
      for (const mode of ['dark', 'light'] as const) {
        const measured = measureSvg(outputs[mode]);
        for (const metric of ['rawBytes', 'gzipBytes', 'elements'] as const) {
          expect(measured[metric], `${name}/${mode}/${metric}`).toBeLessThanOrEqual(
            previous.outputs[mode][metric] * 1.05,
          );
        }
        expect(measured.cssTargets + measured.smilElements).toBeLessThanOrEqual(50);
        expect(measured.duplicateIds).toEqual([]);
        expect(measured.danglingReferences).toEqual([]);
        console.info(
          JSON.stringify({
            fixture: name,
            mode,
            rawBytes: measured.rawBytes,
            gzipBytes: measured.gzipBytes,
            elements: measured.elements,
            motion: measured.cssTargets + measured.smilElements,
          }),
        );
      }
    },
  );
});
