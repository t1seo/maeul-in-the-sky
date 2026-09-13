import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BENCHMARK_OPTIONS, benchmarkFixtures } from '../qa/fixtures.js';
import { parseBenchmarkArgs } from './options.js';
import { benchmarkReportSchema, type BenchmarkReport } from './schema.js';
import { checkBudgets } from './budgets.js';
import { measureFixture } from './measure.js';
import { environmentInfo, sourceProvenance, treeHash } from './provenance.js';

async function main() {
  const options = parseBenchmarkArgs(process.argv.slice(2));
  const output = resolve(options.output);
  if (options.baseline && resolve(options.baseline) === output) {
    throw new TypeError('Output must differ from the baseline path');
  }
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const baseline = options.baseline
    ? benchmarkReportSchema.parse(JSON.parse(await readFile(resolve(options.baseline), 'utf8')))
    : undefined;
  if (baseline?.source.changedDuringRun) {
    throw new TypeError('Baseline source changed during capture; provide a stable baseline');
  }
  const source = sourceProvenance(root);
  const { terrainTheme } = await import('../../src/themes/terrain/index.js');
  const report: BenchmarkReport = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    source,
    environment: environmentInfo(root),
    config: {
      warmup: options.warmup,
      iterations: options.iterations,
      options: BENCHMARK_OPTIONS,
      gzipLevel: 9,
      timingScope:
        'Synchronous terrainTheme.render dark+light pair; excludes import/startup, metrics, PNG, network and disk. Fixtures run empty/mixed/full in one process.',
      percentileMethod: 'Nearest rank: sorted[ceil(n*p)-1], p=0.5 and 0.95 (research-compatible).',
    },
    fixtures: [],
  };
  for (const fixture of benchmarkFixtures()) {
    const result = await measureFixture({
      ...fixture,
      theme: terrainTheme,
      options: BENCHMARK_OPTIONS,
      warmup: options.warmup,
      iterations: options.iterations,
      output,
    });
    report.fixtures.push(result);
    console.log(
      `${fixture.name}: median ${result.timing.medianMs.toFixed(2)}ms, p95 ${result.timing.p95Ms.toFixed(2)}ms`,
    );
  }
  report.source.changedDuringRun = source.sourceSha256 !== treeHash(root, ['src']);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(benchmarkReportSchema.parse(report), null, 2)}\n`);
  if (baseline) {
    const check = checkBudgets(report, baseline);
    await writeFile(`${output}.check.json`, `${JSON.stringify(check, null, 2)}\n`);
    for (const warning of check.warnings) console.warn(warning);
    for (const failure of check.failures) console.error(failure);
    if (options.check && !check.passed) process.exitCode = 1;
  }
  console.log(`Report: ${output}`);
}
void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
