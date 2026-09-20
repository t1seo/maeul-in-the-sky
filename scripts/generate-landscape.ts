import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { sampleSnapshot } from '../src/demo/sample.js';
import { snapshotToContributionData } from '../src/core/settings/parse.js';
import { prepareTerrainScene, renderTerrainScene } from '../src/themes/terrain/index.js';
import { terrainMetadata } from '../src/themes/terrain/scene/metadata.js';

const directory = join(import.meta.dirname, '..', 'docs', 'demo', 'landscape', 'assets');
mkdirSync(directory, { recursive: true });
const snapshot = sampleSnapshot();
const data = snapshotToContributionData(snapshot);
const scenes = [
  { name: 'calendar', options: {} },
  ...(['island', 'archipelago', 'valley'] as const).map((landscapeLayout) => ({
    name: landscapeLayout,
    options: { terrainMode: 'landscape' as const, landscapeLayout },
  })),
];
for (const { name, options } of scenes) {
  const scene = prepareTerrainScene(data, {
    title: '@maeul-sky · Sample village',
    preset: 'civilization',
    style: 'korean',
    motion: 'off',
    layoutSeed: '41',
    ...options,
  });
  for (const mode of ['light', 'dark'] as const) {
    writeFileSync(join(directory, `${name}-${mode}.svg`), renderTerrainScene(scene, mode));
  }
  const metadata = terrainMetadata(scene);
  if (metadata.dataDayCount !== 364 || metadata.stats.total !== 1582) {
    throw new Error('The showcase must preserve the original 364-day sample.');
  }
  console.log(
    `${name}: ${metadata.dataDayCount} dates, ${metadata.stats.total} contributions, ${metadata.wonders.length} earned Wonders`,
  );
}
