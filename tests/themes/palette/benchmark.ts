import { cpus } from 'node:os';
import { performance } from 'node:perf_hooks';
import { getSeasonalPalette100 } from '../../../src/themes/terrain/palette.js';
import { modes, paletteChecksum } from './snapshot.js';

let sink = 0;

function paletteYear(rotation: number): void {
  for (const mode of modes) {
    for (let week = 0; week < 53; week++) {
      const palette = getSeasonalPalette100(mode, week, rotation);
      for (let day = 0; day < 7; day++) {
        const level = (week * 7 + day) % 100;
        sink += palette.getElevation(level).top.length + palette.getHeight(level);
      }
      sink += palette.assets.pine.length;
    }
  }
}

function measure(run: () => void, iterations: number): readonly number[] {
  for (let warmup = 0; warmup < 3; warmup++) run();
  return Array.from({ length: 7 }, () => {
    const start = performance.now();
    for (let iteration = 0; iteration < iterations; iteration++) run();
    return (performance.now() - start) / iterations;
  });
}

function stats(samples: readonly number[]) {
  const sorted = [...samples].sort((a, b) => a - b);
  return { samplesMs: samples, medianMs: sorted[3], minMs: sorted[0] };
}

let uniqueRotation = 0;
const repeatedPalette = stats(measure(() => paletteYear(17), 20));
const uncachedPalette = stats(
  measure(() => {
    uniqueRotation += 0.0001;
    paletteYear(uniqueRotation);
  }, 20),
);
console.log(
  JSON.stringify(
    {
      environment: { node: process.version, platform: process.platform, cpu: cpus()[0]?.model },
      fixture: { weeks: 53, modes, levelsPerWeek: 7, repeatedRotation: 17 },
      repeatedPalette,
      uncachedPalette,
      paletteSha256: Object.fromEntries(modes.map((mode) => [mode, paletteChecksum(mode)])),
      sink,
    },
    null,
    2,
  ),
);
