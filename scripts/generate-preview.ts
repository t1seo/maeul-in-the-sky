/**
 * Generate preview SVGs for README.
 * Usage: npx tsx scripts/generate-preview.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { optimizeGeneratedArtifact } from './optimization/artifact.js';
import { computeStats } from '../src/core/stats.js';
import { terrainTheme as theme } from '../src/themes/terrain/index.js';
import type { ContributionDay, ContributionWeek } from '../src/core/types.js';

function makeWeeks(
  genSeed: number,
  gen: (w: number, d: number, rng: () => number) => number,
): ContributionWeek[] {
  let seed = genSeed;
  function rng() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  const weeks: ContributionWeek[] = [];
  const baseDate = new Date(Date.UTC(2025, 0, 5));

  for (let w = 0; w < 52; w++) {
    const days: ContributionDay[] = [];
    const weekStart = new Date(baseDate);
    weekStart.setUTCDate(weekStart.getUTCDate() + w * 7);

    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart);
      date.setUTCDate(date.getUTCDate() + d);
      const dateStr = date.toISOString().split('T')[0];
      const count = Math.max(0, Math.round(gen(w, d, rng)));
      const level: 0 | 1 | 2 | 3 | 4 =
        count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
      days.push({ date: dateStr, count, level });
    }
    weeks.push({ firstDay: days[0].date, days });
  }
  return weeks;
}

const assetsDir = join(import.meta.dirname, '..', '.github', 'assets');
mkdirSync(assetsDir, { recursive: true });

// Main preview — weekday warrior (rich, realistic terrain)
const mainWeeks = makeWeeks(77, (w, d, rng) => {
  const isWeekday = d >= 1 && d <= 5;
  const r = rng();
  if (isWeekday) {
    if (r > 0.2) return Math.floor(rng() * 12) + 2;
  } else {
    if (r > 0.5) return Math.floor(rng() * 6) + 1;
  }
  return 0;
});
const mainData = {
  weeks: mainWeeks,
  stats: computeStats(mainWeeks),
  year: 2025,
  username: 'maeul-sky',
};
const mainOutput = theme.render(mainData, {
  title: '@maeul-sky · Synthetic sample',
  width: 840,
  height: 240,
});
writeFileSync(join(assetsDir, 'preview-dark.svg'), optimizeGeneratedArtifact(mainOutput.dark));
writeFileSync(join(assetsDir, 'preview-light.svg'), optimizeGeneratedArtifact(mainOutput.light));
console.log(`Main: ${mainData.stats.total} contributions`);

// Sparse — archipelago
const sparseWeeks = makeWeeks(42, (_w, _d, rng) => {
  return rng() > 0.88 ? Math.floor(rng() * 3) + 1 : 0;
});
const sparseData = {
  weeks: sparseWeeks,
  stats: computeStats(sparseWeeks),
  year: 2025,
  username: 'sparse',
};
const sparseOutput = theme.render(sparseData, {
  title: '@sparse · Synthetic sample',
  width: 840,
  height: 240,
});
writeFileSync(join(assetsDir, 'preview-sparse.svg'), optimizeGeneratedArtifact(sparseOutput.dark));
console.log(`Sparse: ${sparseData.stats.total} contributions`);

// Max — dense civilization
const maxWeeks = makeWeeks(42, (_w, _d, rng) => {
  return Math.floor(rng() * 8) + 10;
});
const maxData = { weeks: maxWeeks, stats: computeStats(maxWeeks), year: 2025, username: 'max' };
const maxOutput = theme.render(maxData, {
  title: '@max · Synthetic sample',
  width: 840,
  height: 240,
});
writeFileSync(join(assetsDir, 'preview-max.svg'), optimizeGeneratedArtifact(maxOutput.dark));
writeFileSync(join(assetsDir, 'preview-max-light.svg'), optimizeGeneratedArtifact(maxOutput.light));
console.log(`Max: ${maxData.stats.total} contributions`);

console.log('Done — all preview SVGs generated.');

console.log('Source: seeded synthetic sample, 364 supplied days, 2025-01-05 to 2026-01-03.');
