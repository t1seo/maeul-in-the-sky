import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { renderTerrain } from '../../src/themes/terrain/index.js';
import { benchmarkFixtures, BENCHMARK_OPTIONS } from '../qa/fixtures.js';
import { sha256, measure } from './measure.js';

const label = process.argv[2] ?? 'fresh';
const directory = `evidence/svg-optimization/${label}-input`;
await mkdir(directory, { recursive: true });
const fixture = benchmarkFixtures().find(({ name }) => name === 'mixed');
if (!fixture) throw new RangeError('Missing mixed fixture');
const options = {
  ...BENCHMARK_OPTIONS,
  title: '1.234567 한글 @benchmark',
  namespace: 'optimization-check',
};
const metrics = [];
for (const motion of ['full', 'subtle', 'off'] as const) {
  const render = () => renderTerrain(fixture.data, { ...options, motion });
  const output = render();
  for (const mode of ['dark', 'light'] as const)
    await writeFile(`${directory}/${motion}-${mode}.svg`, output[mode]);
  metrics.push({ motion, generationPair: measure(render, 5, 20) });
}
await writeFile(`${directory}/data.json`, JSON.stringify(fixture.data, null, 2));
const paths = execFileSync(
  'rg',
  ['--files', 'src', 'scripts/optimization', 'tests/fixtures/contribution-data.ts'],
  { encoding: 'utf8' },
)
  .trim()
  .split('\n')
  .filter((path) => path.endsWith('.ts'));
const sourceHashes = Object.fromEntries(
  await Promise.all(paths.map(async (path) => [path, sha256(await readFile(path))])),
);
await writeFile(
  `${directory}/provenance.json`,
  JSON.stringify(
    {
      label,
      generatedAt: new Date().toISOString(),
      options,
      fixture: 'benchmarkFixtures mixed, seed 42, 2025, 364 days',
      metrics,
      sourceHashes,
    },
    null,
    2,
  ),
);
console.log(`Generated 6 SVGs in ${directory}`);
