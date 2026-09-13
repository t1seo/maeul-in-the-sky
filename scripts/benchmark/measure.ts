import { mkdir, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import type { ContributionData, Theme, ThemeOptions } from '../../src/core/types.js';
import { summarizeTiming } from './budgets.js';
import { measureSvg } from './svg-metrics.js';
import { sha256 } from './provenance.js';
import type { BenchmarkFixtureResult } from './schema.js';

export async function measureFixture(input: {
  readonly name: BenchmarkFixtureResult['name'];
  readonly data: ContributionData;
  readonly theme: Theme;
  readonly options: ThemeOptions;
  readonly warmup: number;
  readonly iterations: number;
  readonly output: string;
}): Promise<BenchmarkFixtureResult> {
  const { name, data, theme, options, warmup, iterations, output } = input;
  for (let index = 0; index < warmup; index++) theme.render(data, options);
  const startingHeap = process.memoryUsage().heapUsed;
  const samples: BenchmarkFixtureResult['samples'] = [];
  for (let index = 0; index < iterations; index++) {
    const start = performance.now();
    theme.render(data, options);
    const milliseconds = performance.now() - start;
    const { heapUsed, rss } = process.memoryUsage();
    samples.push({ milliseconds, heapUsed, rss });
  }
  const endingHeap = process.memoryUsage().heapUsed;
  const rendered = theme.render(data, options);
  const outputs = { dark: measureSvg(rendered.dark), light: measureSvg(rendered.light) };
  const folder = join(dirname(output), `${basename(output, '.json')}-samples`);
  await mkdir(folder, { recursive: true });
  const paths = {
    data: join(folder, `${name}.data.json`),
    darkSvg: join(folder, `${name}-dark.svg`),
    lightSvg: join(folder, `${name}-light.svg`),
    darkPng: join(folder, `${name}-dark.png`),
    lightPng: join(folder, `${name}-light.png`),
  };
  await writeFile(paths.data, `${JSON.stringify(data, null, 2)}\n`);
  for (const mode of ['dark', 'light'] as const) {
    await writeFile(paths[`${mode}Svg`], rendered[mode]);
    const png = new Resvg(rendered[mode], {
      background: mode === 'dark' ? '#0d1117' : '#ffffff',
      fitTo: { mode: 'zoom', value: 2 },
    })
      .render()
      .asPng();
    await writeFile(paths[`${mode}Png`], png);
  }
  return {
    name,
    dataSha256: sha256(JSON.stringify(data)),
    metadata: {
      username: data.username,
      year: data.year,
      fromDate: data.stats.fromDate,
      toDate: data.stats.toDate,
      weeks: data.weeks.length,
      days: data.weeks.reduce((count, week) => count + week.days.length, 0),
      contributions: data.stats.total,
      activeDays: data.stats.activeDays,
    },
    samples,
    timing: summarizeTiming(samples.map((sample) => sample.milliseconds)),
    memory: {
      startingHeap,
      endingHeap,
      peakObservedHeap: Math.max(
        startingHeap,
        endingHeap,
        ...samples.map((sample) => sample.heapUsed),
      ),
      peakObservedRss: Math.max(...samples.map((sample) => sample.rss)),
    },
    outputs,
    artifacts: paths,
  };
}
