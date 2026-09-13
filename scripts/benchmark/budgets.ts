import type { BenchmarkReport } from './schema.js';

export const BENCHMARK_BUDGETS = {
  rawBytes: 1.05,
  gzipBytes: 1.05,
  elements: 1.05,
  medianMs: 1.2,
  p95Ms: 1.3,
} as const;

export function summarizeTiming(samples: readonly number[]) {
  if (samples.length === 0 || samples.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new RangeError('Timing samples must be nonempty, finite and nonnegative');
  }
  const sorted = [...samples].sort((a, b) => a - b);
  return {
    medianMs: sorted[Math.ceil(sorted.length * 0.5) - 1],
    p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1],
  };
}

export function checkBudgets(current: BenchmarkReport, baseline: BenchmarkReport) {
  const failures: string[] = [];
  const warnings: string[] = [];
  const timingComparable = current.environment.timingKey === baseline.environment.timingKey;
  if (!timingComparable)
    warnings.push(
      'Timing not checked: runtime/OS/hardware differ; size and semantic budgets still apply.',
    );
  if (current.source.changedDuringRun || baseline.source.changedDuringRun)
    failures.push('Renderer source changed during capture; rerun on a stable tree.');
  if (JSON.stringify(current.config) !== JSON.stringify(baseline.config))
    failures.push('Benchmark configurations differ.');
  for (const name of ['empty', 'mixed', 'full'] as const) {
    const now = current.fixtures.filter((fixture) => fixture.name === name);
    const before = baseline.fixtures.filter((fixture) => fixture.name === name);
    if (now.length !== 1 || before.length !== 1) {
      failures.push(`${name}: expected exactly one fixture per report`);
      continue;
    }
    const result = now[0];
    const previous = before[0];
    if (result.dataSha256 !== previous.dataSha256)
      failures.push(`${name}: fixture data hashes differ`);
    if (
      result.samples.length !== current.config.iterations ||
      previous.samples.length !== baseline.config.iterations
    )
      failures.push(`${name}: incomplete raw samples`);
    if (timingComparable) {
      for (const metric of ['medianMs', 'p95Ms'] as const) {
        if (result.timing[metric] > previous.timing[metric] * BENCHMARK_BUDGETS[metric])
          failures.push(
            `${name}: ${metric} exceeds +${Math.round((BENCHMARK_BUDGETS[metric] - 1) * 100)}%`,
          );
      }
    }
    for (const mode of ['dark', 'light'] as const) {
      const metrics = result.outputs[mode];
      for (const metric of ['rawBytes', 'gzipBytes', 'elements'] as const) {
        if (metrics[metric] > previous.outputs[mode][metric] * BENCHMARK_BUDGETS[metric])
          failures.push(`${name}/${mode}: ${metric} exceeds +5%`);
      }
      for (const metric of [
        'duplicateIds',
        'danglingReferences',
        'externalReferences',
        'unsupportedSelectors',
      ] as const) {
        if (metrics[metric].length > 0)
          failures.push(`${name}/${mode}: ${metric}: ${metrics[metric].join(', ')}`);
      }
      if (metrics.scripts || metrics.eventHandlers)
        failures.push(`${name}/${mode}: executable SVG content`);
      if (!metrics.title || !metrics.description || !metrics.viewBox)
        failures.push(`${name}/${mode}: missing accessibility or viewBox`);
    }
  }
  return {
    passed: failures.length === 0,
    timingComparable,
    failures,
    warnings,
    budgets: BENCHMARK_BUDGETS,
  };
}
