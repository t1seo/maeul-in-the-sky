import { describe, expect, it } from 'vitest';
import { summarizeTiming } from '../../scripts/benchmark/budgets.js';
import { parseBenchmarkArgs } from '../../scripts/benchmark/options.js';

describe('benchmark configuration and statistics', () => {
  it('uses the research nearest-rank median and p95 without sorting caller samples', () => {
    const samples = Array.from({ length: 100 }, (_, index) => 100 - index);
    expect(summarizeTiming(samples)).toEqual({ medianMs: 50, p95Ms: 95 });
    expect(samples[0]).toBe(100);
    expect(summarizeTiming([7])).toEqual({ medianMs: 7, p95Ms: 7 });
  });
  it.each([{ samples: [] }, { samples: [-1] }, { samples: [NaN] }, { samples: [Infinity] }])(
    'rejects invalid timing samples $samples',
    ({ samples }) => {
      expect(() => summarizeTiming(samples)).toThrow(RangeError);
    },
  );
  it('requires an explicit baseline for check mode and positive integer iterations', () => {
    expect(() => parseBenchmarkArgs(['--check'])).toThrow('--check requires --baseline');
    for (const value of ['0', '2.5', 'NaN', '-1', '10001'])
      expect(() => parseBenchmarkArgs(['--iterations', value])).toThrow();
    expect(
      parseBenchmarkArgs(['--warmup', '0', '--iterations', '1', '--output', 'run.json']),
    ).toMatchObject({ warmup: 0, iterations: 1, output: 'run.json', check: false });
  });
});
