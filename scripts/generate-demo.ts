import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { optimizeGeneratedArtifact } from './optimization/artifact.js';
import { computeStats } from '../src/core/stats.js';
import { VILLAGE_PRESETS } from '../src/core/presets.js';
import { getTheme } from '../src/themes/registry.js';
import type { ContributionDay, ContributionWeek } from '../src/core/types.js';

import '../src/themes/terrain/index.js';

const DAY_MS = 86_400_000;

function createDemoWeeks(): ContributionWeek[] {
  let seed = 77;
  const random = (): number => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const start = Date.UTC(2025, 0, 5);

  return Array.from({ length: 52 }, (_, weekIndex) => {
    const days: ContributionDay[] = Array.from({ length: 7 }, (_, dayIndex) => {
      const weekday = dayIndex >= 1 && dayIndex <= 5;
      const active = random() > (weekday ? 0.2 : 0.5);
      const count = active ? Math.floor(random() * (weekday ? 12 : 6)) + 1 : 0;
      const level: ContributionDay['level'] =
        count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
      return {
        date: new Date(start + (weekIndex * 7 + dayIndex) * DAY_MS).toISOString().slice(0, 10),
        count,
        level,
      };
    });
    return { firstDay: days[0].date, days };
  });
}

const theme = getTheme('terrain');
if (!theme) throw new Error('Terrain theme is not registered');

const weeks = createDemoWeeks();
const data = {
  weeks,
  stats: computeStats(weeks),
  year: 2025,
  username: 'maeul-sky',
};
const outputDirectory = join(import.meta.dirname, '..', 'docs', 'demo', 'assets');
mkdirSync(outputDirectory, { recursive: true });

for (const [presetName, preset] of Object.entries(VILLAGE_PRESETS)) {
  const output = theme.render(data, {
    title: `@maeul-sky · ${preset.displayName} · Sample`,
    width: 840,
    height: 240,
    density: preset.density,
  });
  writeFileSync(
    join(outputDirectory, `preset-${presetName}-dark.svg`),
    optimizeGeneratedArtifact(output.dark),
  );
  writeFileSync(
    join(outputDirectory, `preset-${presetName}-light.svg`),
    optimizeGeneratedArtifact(output.light),
  );
}

console.log(`Generated 6 demo terrains in ${outputDirectory}`);

console.log('Source: seeded synthetic sample, 364 supplied days, 2025-01-05 to 2026-01-03.');
