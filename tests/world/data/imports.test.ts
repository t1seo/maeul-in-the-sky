import { expect, it } from 'vitest';
import { importWorldData, readWorldFile } from '../../../src/world/data/imports.js';
import { beginVisit, returnFromVisit } from '../../../src/world/data/visits.js';
import { MAX_IMPORT_BYTES } from '../../../src/core/settings/boundary.js';
import { MAX_WORLD_BYTES } from '../../../src/world/data/json.js';
import { annualSnapshot } from '../../core/settings/archive-fixtures.js';
import { worldDocumentFixture } from './world-fixture.js';

it('adapts a legacy snapshot without changing its actual contribution evidence', () => {
  const snapshot = annualSnapshot(2024, [0, 5]);
  const result = importWorldData(snapshot, {
    savedAt: '2026-09-19T00:00:00Z',
    settings: { culture: 'korean' },
  });
  expect(result.kind).toBe('snapshot');
  expect(result.documents[0].sourceSnapshot).toEqual(snapshot);
  expect(
    result.documents[0].scene.days.filter((day) => day.kind === 'observed').map((day) => day.count),
  ).toEqual([0, 5]);
  expect(result.documents[0].scene.settings.culture).toBe('korean');
  expect(result).not.toHaveProperty('publicSourceUrl');
});

it('adapts every annual snapshot in an existing comparison archive', () => {
  const snapshots = [annualSnapshot(2023), annualSnapshot(2024)];
  const result = importWorldData({
    kind: 'maeul-archive',
    schemaVersion: 1,
    snapshots,
    comparison: { normalization: { kind: 'fixed', maxCount: 50 }, years: [2023, 2024] },
  });
  expect(result.kind).toBe('archive');
  expect(result.documents.map((document) => document.sourceSnapshot)).toEqual(snapshots);
});

it('keeps the original 2 MiB snapshot/archive limit including wire whitespace', () => {
  const snapshot = annualSnapshot(2024);
  expect(() =>
    importWorldData(`${JSON.stringify(snapshot)}${' '.repeat(MAX_IMPORT_BYTES)}`),
  ).toThrow(expect.objectContaining({ code: 'too_large' }));
  expect(() => importWorldData({ ...snapshot, schemaVersion: 2 })).toThrow(
    expect.objectContaining({ code: 'unsupported_version' }),
  );
  expect(() => importWorldData({ kind: 'maeul-snapshot', schemaVersion: 1 })).toThrow(
    expect.objectContaining({ code: 'invalid_input' }),
  );
  expect(() => importWorldData({ kind: 'unknown' })).toThrow(
    expect.objectContaining({ code: 'invalid_input' }),
  );
});

it('loads a local download without inventing a public share URL', async () => {
  const document = worldDocumentFixture();
  const result = await readWorldFile(new Blob([JSON.stringify(document)]));
  expect(result.documents[0]).toEqual(document);
  expect(result).not.toHaveProperty('publicSourceUrl');
  await expect(readWorldFile(new Blob([' '.repeat(MAX_WORLD_BYTES + 1)]))).rejects.toMatchObject({
    code: 'too_large',
  });
});

it('includes a local file byte order mark in the legacy 2 MiB size boundary', async () => {
  const json = JSON.stringify(annualSnapshot(2024));
  const file = new Blob([
    '\uFEFF',
    json,
    ' '.repeat(MAX_IMPORT_BYTES - new TextEncoder().encode(json).length),
  ]);
  expect(file.size).toBe(MAX_IMPORT_BYTES + 3);
  await expect(readWorldFile(file)).rejects.toMatchObject({ code: 'too_large' });
});

it('restores the exact home state after a visit and refuses unpublished remote sources', () => {
  const home = worldDocumentFixture();
  const visitor = { ...home, savedAt: '2026-09-18T00:00:00Z' };
  const visit = beginVisit(home, visitor, 'https://octocat.github.io/world.json');
  expect(visit.document).toBe(visitor);
  expect(returnFromVisit(visit)).toBe(home);
  expect(() => beginVisit(home, visitor, 'file:///tmp/world.json')).toThrow(
    expect.objectContaining({ code: 'invalid_url' }),
  );
  expect(beginVisit(home, visitor)).not.toHaveProperty('publicSourceUrl');
});
