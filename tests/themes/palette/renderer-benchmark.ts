import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { terrainTheme } from '../../../src/themes/terrain/index.js';
import { createMockContributionData } from '../../fixtures/contribution-data.js';
import { modes } from './snapshot.js';

const data = createMockContributionData();
const options = { title: 'Palette benchmark', width: 840, height: 240 };
let sink = 0;
for (let warmup = 0; warmup < 3; warmup++) terrainTheme.render(data, options);
const samplesMs = Array.from({ length: 7 }, () => {
  const start = performance.now();
  for (let iteration = 0; iteration < 5; iteration++) {
    const svg = terrainTheme.render(data, options);
    sink += svg.dark.length + svg.light.length;
  }
  return (performance.now() - start) / 5;
});
const output = terrainTheme.render(data, options);
console.log(
  JSON.stringify(
    {
      fixture: { seed: 42, year: data.year, weeks: data.weeks.length, options },
      samplesMs,
      medianMs: [...samplesMs].sort((a, b) => a - b)[3],
      svgSha256: Object.fromEntries(
        modes.map((mode) => [mode, createHash('sha256').update(output[mode]).digest('hex')]),
      ),
      svgBytes: Object.fromEntries(modes.map((mode) => [mode, Buffer.byteLength(output[mode])])),
      sink,
    },
    null,
    2,
  ),
);
