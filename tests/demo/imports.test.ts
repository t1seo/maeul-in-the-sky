import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseImportedData } from '../../src/demo/imports.js';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { localCapability, isLoopbackPage } from '../../src/demo/local-client.js';

describe('C12 real data boundaries', () => {
  it('imports an actual partial calendar when its snapshot is selected', () => {
    const text = readFileSync('tests/fixtures/improvements/partial-2025.json', 'utf8');
    const imported = parseImportedData(text);
    expect(imported.snapshots[0]?.weeks[0]?.days[0]?.date).toBe('2025-01-01');
    expect(imported.snapshots[0]?.username).toBe('benchmark');
  });

  it('keeps the sample identity and source when setup accounts are unrelated', () => {
    const sample = sampleSnapshot();
    expect(sample.username).toBe('maeul-sky');
    expect(sample.source.kind).toBe('sample');
    expect(sample.weeks).toHaveLength(52);
  });

  it('rejects malformed data before an import can mutate the archive', () => {
    expect(() =>
      parseImportedData(readFileSync('tests/fixtures/improvements/malformed.json', 'utf8')),
    ).toThrow();
  });

  it('does not fetch any address when hosted on a public page', async () => {
    const result = await localCapability(new URL('https://t1seo.github.io/maeul-in-the-sky/'));
    expect(result.available).toBe(false);
    expect(result.message).toContain('never contacts localhost');
  });

  it.each(['https://127.0.0.1:4318/', 'http://127.0.0.1.example.com/', 'https://example.com/'])(
    'rejects nonlocal service origin %s',
    (origin) => {
      expect(isLoopbackPage(new URL(origin))).toBe(false);
    },
  );
});
