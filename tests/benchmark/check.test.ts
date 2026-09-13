import { describe, expect, it } from 'vitest';
import { checkBudgets } from '../../scripts/benchmark/budgets.js';
import { benchmarkReportSchema } from '../../scripts/benchmark/schema.js';
import { reportFixture } from './budget-report.js';

describe('regression budgets', () => {
  it('accepts identical valid inputs and records fixed numeric budget policies', () => {
    const baseline = reportFixture();
    const result = checkBudgets(benchmarkReportSchema.parse(baseline), baseline);
    expect(result.passed).toBe(true);
    expect(result.budgets).toEqual({
      rawBytes: 1.05,
      gzipBytes: 1.05,
      elements: 1.05,
      medianMs: 1.2,
      p95Ms: 1.3,
    });
  });
  it('fails raw and gzip growth independently of smaller element counts', () => {
    const baseline = reportFixture();
    const current = reportFixture();
    current.fixtures[0].outputs.dark.rawBytes *= 1.051;
    current.fixtures[1].outputs.light.gzipBytes *= 1.051;
    current.fixtures[0].outputs.dark.elements = 1;
    expect(checkBudgets(current, baseline).failures).toEqual([
      'empty/dark: rawBytes exceeds +5%',
      'mixed/light: gzipBytes exceeds +5%',
    ]);
  });
  it('warns rather than claiming a timing pass when runtime/hardware do not match', () => {
    const current = reportFixture();
    current.environment.timingKey = 'different';
    current.fixtures[0].timing.medianMs = 1000;
    const result = checkBudgets(current, reportFixture());
    expect(result.timingComparable).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.failures).toEqual([]);
  });
  it('fails median/p95 regression on matching hosts and never accepts changing source', () => {
    const current = reportFixture();
    current.fixtures[0].timing = { medianMs: 12.01, p95Ms: 13.01 };
    current.source.changedDuringRun = true;
    expect(checkBudgets(current, reportFixture()).failures).toEqual([
      'Renderer source changed during capture; rerun on a stable tree.',
      'empty: medianMs exceeds +20%',
      'empty: p95Ms exceeds +30%',
    ]);
  });
  it('rejects mismatched fixture content and duplicate fixture identities', () => {
    const current = reportFixture();
    current.fixtures[0].dataSha256 = 'different';
    current.fixtures[1].name = 'full';
    const result = checkBudgets(current, reportFixture());
    expect(result.passed).toBe(false);
    expect(result.failures).toContain('empty: fixture data hashes differ');
    expect(result.failures).toContain('mixed: expected exactly one fixture per report');
    expect(result.failures).toContain('full: expected exactly one fixture per report');
  });
  it('fails structural semantics even if byte budgets pass', () => {
    const current = reportFixture();
    current.fixtures[0].outputs.dark.danglingReferences = ['missing'];
    current.fixtures[0].outputs.dark.title = '';
    current.fixtures[1].outputs.light.scripts = 1;
    expect(checkBudgets(current, reportFixture()).failures).toEqual([
      'empty/dark: danglingReferences: missing',
      'empty/dark: missing accessibility or viewBox',
      'mixed/light: executable SVG content',
    ]);
  });
});
