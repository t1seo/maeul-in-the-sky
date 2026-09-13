import { describe, expect, it } from 'vitest';
import { parseSettings, parseSnapshot } from '../../../src/core/settings/parse.js';
import { InputValidationError } from '../../../src/core/settings/errors.js';
import { MAX_IMPORT_BYTES } from '../../../src/core/settings/boundary.js';
import { snapshotFixture } from './fixtures.js';

describe('C01-untrusted-input', () => {
  it.each([
    ['date', '2025-02-29'],
    ['date', '2024-02-30'],
    ['date', 'not-a-date'],
    ['count', -1],
    ['count', 1.1],
    ['count', NaN],
    ['count', Infinity],
    ['level', 5],
    ['level', -1],
    ['level', '4'],
  ])('rejects invalid day %s=%s with a field path', (field, value) => {
    // Given
    const input = {
      ...snapshotFixture(),
      weeks: [
        {
          firstDay: '2024-02-25',
          days: [{ date: '2024-02-29', count: 1, level: 1, [field]: value }],
        },
      ],
    };
    // When
    const parse = () => parseSnapshot(input);
    // Then
    expect(parse).toThrow(new RegExp(`weeks.0.days.0.${field}`));
    expect(parse).toThrow(InputValidationError);
  });

  it('rejects duplicates even when they arrive in separate weeks', () => {
    // Given
    const input = snapshotFixture();
    input.weeks.push(input.weeks[0]);
    // When
    const parse = () => parseSnapshot(input);
    // Then
    expect(parse).toThrow(/weeks.1.days.0.date.*Duplicate/);
  });

  it.each([
    ['schemaVersion', 2],
    ['year', 0],
    ['year', 10_000],
    ['username', ''],
  ])('rejects invalid envelope %s=%s', (field, value) => {
    // Given
    const input = { ...snapshotFixture(), [field]: value };
    // When
    const parse = () => parseSnapshot(input);
    // Then
    expect(parse).toThrow(new RegExp(field));
  });

  it('rejects malformed JSON with an actionable root error', () => {
    // Given
    const input = '{"schemaVersion":';
    // When
    const parse = () => parseSnapshot(input);
    // Then
    expect(parse).toThrow('$: Malformed JSON');
  });

  it('enforces UTF-8 byte limits before parsing', () => {
    // Given
    const input = JSON.stringify({ padding: '한'.repeat(Math.ceil(MAX_IMPORT_BYTES / 3)) });
    // When
    const parse = () => parseSnapshot(input);
    // Then
    expect(parse).toThrow('2 MiB');
  });

  it('rejects oversized object input as well as text imports', () => {
    // Given
    const input = { ...snapshotFixture(), extra: 'x'.repeat(MAX_IMPORT_BYTES) };
    // When
    const parse = () => parseSnapshot(input);
    // Then
    expect(parse).toThrow('2 MiB');
  });

  it('rejects circular non-JSON objects through the typed boundary', () => {
    // Given
    const input: { self?: unknown } = {};
    input.self = input;
    // When
    const parse = () => parseSnapshot(input);
    // Then
    expect(parse).toThrow(InputValidationError);
  });

  it('reports settings field errors inside imported settings', () => {
    // Given
    const input = {
      schemaVersion: 1,
      kind: 'maeul-settings',
      username: 'octocat',
      settings: { motion: 'invalid' },
    };
    // When
    const parse = () => parseSettings(input);
    // Then
    expect(parse).toThrow(/settings.motion/);
  });

  it.each([
    ['title', 'prefix\u0000suffix'],
    ['layoutSeed', 'prefix\uD800suffix'],
  ] as const)('rejects XML-forbidden %s characters from settings JSON', (field, value) => {
    // Given
    const input = JSON.stringify({
      schemaVersion: 1,
      kind: 'maeul-settings',
      username: 'octocat',
      settings: { [field]: value },
    });
    // When
    const parse = () => parseSettings(input);
    // Then
    expect(parse).toThrow(new RegExp(`settings\\.${field}.*XML 1\\.0`));
  });

  it.each([
    ['title', 'prefix\uFFFEsuffix'],
    ['layoutSeed', 'prefix\uFFFFsuffix'],
  ] as const)('rejects XML-forbidden %s characters from snapshots', (field, value) => {
    // Given
    const input = { ...snapshotFixture(), settings: { [field]: value } };
    // When
    const parse = () => parseSnapshot(input);
    // Then
    expect(parse).toThrow(new RegExp(`settings\\.${field}.*XML 1\\.0`));
  });

  it('rejects aggregate totals that cannot be represented exactly', () => {
    // Given
    const input = {
      ...snapshotFixture(),
      weeks: [
        {
          firstDay: '2024-02-25',
          days: [
            { date: '2024-02-28', count: Number.MAX_SAFE_INTEGER, level: 4 },
            { date: '2024-02-29', count: 1, level: 1 },
          ],
        },
      ],
    };
    // When
    const parse = () => parseSnapshot(input);
    // Then
    expect(parse).toThrow(/weeks.*safe integer/);
  });

  it('rejects invalid source provenance dates', () => {
    // Given
    const input = {
      ...snapshotFixture(),
      source: { kind: 'github', fetchedAt: '2025-02-29T00:00:00Z' },
    };
    // When
    const parse = () => parseSnapshot(input);
    // Then
    expect(parse).toThrow(/source.fetchedAt/);
  });

  it('rejects invalid week date labels before canonical regrouping', () => {
    // Given
    const input = snapshotFixture();
    input.weeks[0].firstDay = '2024-02-30';
    // When
    const parse = () => parseSnapshot(input);
    // Then
    expect(parse).toThrow(/weeks.0.firstDay/);
  });

  it('rejects year-zero contribution days before producing a negative-year Sunday', () => {
    // Given
    const input = {
      ...snapshotFixture(),
      year: 1,
      weeks: [{ firstDay: '0000-01-01', days: [{ date: '0000-01-01', count: 1, level: 1 }] }],
    };
    // When
    const parse = () => parseSnapshot(input);
    // Then
    expect(parse).toThrow(/weeks.0.days.0.date/);
  });
});
