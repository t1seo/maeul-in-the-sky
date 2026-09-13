import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fixtureSnapshot, improvementFixtures } from '../../scripts/qa/fixtures.js';
import { parseSnapshot, snapshotToContributionData } from '../../src/core/settings/parse.js';
import { parseArchive } from '../../src/core/archive/parse.js';

describe('portable snapshot fixtures', () => {
  it('converts legacy data to the actual version-1 contract without trusted stats or mutable aliases', () => {
    const data = improvementFixtures()['partial-2025'];
    const snapshot = fixtureSnapshot(data);
    expect(parseSnapshot(snapshot)).toMatchObject({
      schemaVersion: 1,
      kind: 'maeul-snapshot',
      source: { kind: 'sample' },
    });
    expect(snapshot).not.toHaveProperty('stats');
    expect(snapshotToContributionData(snapshot)).toEqual(data);
    data.weeks[0].days[0].count = 999;
    expect(snapshot.weeks[0].days[0].count).not.toBe(999);
  });
  it('parses all checked-in snapshots and archive while explicitly rejecting the malformed fixture', async () => {
    const directory = resolve('tests/fixtures/improvements');
    const files = (await readdir(directory)).filter((name) => name.endsWith('.json'));
    expect(files.length).toBeGreaterThanOrEqual(22);
    for (const file of files) {
      const text = await readFile(resolve(directory, file), 'utf8');
      if (file === 'malformed.json') expect(() => parseSnapshot(text)).toThrow();
      else if (file === 'two-year-archive.json')
        expect(parseArchive(text).snapshots).toHaveLength(2);
      else {
        const snapshot = parseSnapshot(text);
        expect(snapshot.username).toBe('benchmark');
        expect(snapshot.source.kind).toBe('sample');
      }
    }
  });
});
