import type { BenchmarkReport } from '../../scripts/benchmark/schema.js';
import { measureSvg } from '../../scripts/benchmark/svg-metrics.js';
import { BENCHMARK_OPTIONS } from '../../scripts/qa/fixtures.js';

export function reportFixture(): BenchmarkReport {
  const metrics = measureSvg(
    '<svg viewBox="0 0 10 10"><title>Example</title><desc>Scene</desc><path d="M0 0"/></svg>',
  );
  return {
    schemaVersion: 1,
    createdAt: '2026-09-13T00:00:00.000Z',
    source: {
      revision: 'test',
      historical: false,
      dirty: false,
      sourceSha256: 'source',
      harnessSha256: 'harness',
      changedDuringRun: false,
    },
    environment: {
      node: 'v20',
      v8: '12',
      platform: 'linux',
      arch: 'x64',
      osRelease: 'test',
      cpuModel: 'cpu',
      logicalCpus: 2,
      totalMemory: 1000,
      timingKey: 'same',
      timingCaveat: 'test',
      dependencies: {},
    },
    config: {
      warmup: 0,
      iterations: 1,
      options: BENCHMARK_OPTIONS,
      gzipLevel: 9,
      timingScope: 'pair',
      percentileMethod: 'nearest rank',
    },
    fixtures: ['empty', 'mixed', 'full'].map((name) => {
      if (name !== 'empty' && name !== 'mixed' && name !== 'full') throw new TypeError(name);
      return {
        name,
        dataSha256: name,
        metadata: {
          username: 'benchmark',
          year: 2025,
          fromDate: '2024-12-29',
          toDate: '2025-12-27',
          days: 364,
          weeks: 52,
          contributions: 0,
          activeDays: 0,
        },
        samples: [{ milliseconds: 10, heapUsed: 20, rss: 30 }],
        timing: { medianMs: 10, p95Ms: 10 },
        memory: { startingHeap: 10, peakObservedHeap: 20, endingHeap: 20, peakObservedRss: 30 },
        outputs: { dark: { ...metrics }, light: { ...metrics } },
        artifacts: {
          data: 'data',
          darkSvg: 'dark.svg',
          lightSvg: 'light.svg',
          darkPng: 'dark.png',
          lightPng: 'light.png',
        },
      };
    }),
  };
}
