import { describe, expect, it } from 'vitest';
import {
  buildWorld,
  defaultWorldSettings,
  defaultWorldView,
  frameWorld,
  parseWorldScene,
} from '../../../src/world/model/index.js';
import type { PublicRepoRecord } from '../../../src/world/model/types.js';
import { inputFor, sequence } from './helpers.js';

const repository: PublicRepoRecord = {
  id: '123',
  fullName: 'user/repo',
  url: 'https://github.com/user/repo',
  description: null,
  visibility: 'public',
  createdAt: '2024-01-01T00:00:00Z',
  retrievedAt: '2024-12-31T00:00:00Z',
  releases: [
    {
      id: '456',
      tag: 'v1',
      url: 'https://github.com/user/repo/releases/tag/v1',
      publishedAt: '2024-02-01T00:00:00Z',
    },
  ],
  coverage: { complete: true },
};

describe('world input bounds', () => {
  it('keeps existing public project plots fixed when future contribution rewards appear', () => {
    const previous = inputFor(sequence('2024-01-01', 31, 1));
    const next = inputFor([...sequence('2024-01-01', 31, 1), ...sequence('2024-02-01', 335, 50)]);
    const repositories = Array.from({ length: 12 }, (_, index) => ({
      ...repository,
      id: String(index + 1),
      fullName: `user/repo-${index}`,
      releases: [],
    }));
    const first = buildWorld({ ...previous, repositories });
    const second = buildWorld({ ...next, repositories });
    const view = { ...defaultWorldView(first), cursorDate: '2024-01-31' };
    expect(frameWorld(second, view)).toEqual(frameWorld(first, view));
  });
  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid observed count %s',
    (count) => {
      expect(() => buildWorld(inputFor([['2024-01-01', count]]))).toThrow();
    },
  );

  it('rejects duplicate and impossible dates and unsafe totals', () => {
    expect(() =>
      buildWorld(
        inputFor([
          ['2024-01-01', 1],
          ['2024-01-01', 2],
        ]),
      ),
    ).toThrow();
    expect(() => buildWorld(inputFor([['2024-02-30', 1]]))).toThrow();
    expect(() => buildWorld(inputFor([['0000-01-01', 1]]))).toThrow();
    expect(() =>
      buildWorld(
        inputFor([
          ['2024-01-01', Number.MAX_SAFE_INTEGER],
          ['2024-01-02', 1],
        ]),
      ),
    ).toThrow();
  });

  it('rejects inverted and oversized ranges without dropping input', () => {
    expect(() =>
      buildWorld(inputFor([], 2024, { from: '2024-12-31', to: '2024-01-01' })),
    ).toThrow();
    expect(() =>
      buildWorld(inputFor([], 2024, { from: '2020-01-01', to: '2024-12-31' })),
    ).toThrow();
  });

  it('expands a requested range to preserve earlier and later supplied observations', () => {
    const scene = buildWorld(
      inputFor(
        [
          ['2023-12-31', 2],
          ['2024-03-01', 3],
        ],
        2024,
        { from: '2024-01-01', to: '2024-02-01' },
      ),
    );
    expect(scene.range).toEqual({ from: '2023-12-01', to: '2024-03-31' });
    expect(scene.days.filter((day) => day.kind === 'observed')).toHaveLength(2);
  });

  it.each([
    [{ date: '2024-03-01', count: 1, level: 0 as const }],
    [{ date: '2024-01-01', count: 1, level: 0 as const }],
    [
      { date: '2024-02-29', count: 1, level: 0 as const },
      { date: '2024-02-29', count: 2, level: 0 as const },
    ],
  ])('rejects context that is inside the range, too old or duplicated', (...contextDays) => {
    const input = inputFor([], 2024, { from: '2024-03-01', to: '2024-03-31' });
    expect(() => buildWorld({ ...input, contextDays })).toThrow();
  });

  it('marks a complete trailing window and bounds festivals at year 9999', () => {
    const records = sequence('9999-12-04', 28);
    const scene = buildWorld(inputFor(records, 9999, { from: '9999-12-01', to: '9999-12-31' }));
    expect(scene.days.at(-1)).toMatchObject({
      consistency: { complete: true, observedDays: 28, activeDays: 28, tier: 3 },
    });
    expect(parseWorldScene(JSON.parse(JSON.stringify(scene)))).toEqual(scene);
  });

  it('normalizes usernames but does not use retrieval timestamps as a layout seed', () => {
    const input = inputFor([['2024-03-01', 1]]);
    const first = buildWorld(input);
    const second = buildWorld({
      ...input,
      snapshot: {
        ...input.snapshot,
        username: 'TEST-VILLAGE',
        source: { kind: 'github', fetchedAt: '2026-09-19T00:00:00Z' },
      },
    });
    expect(second).toEqual(first);
    expect(
      defaultWorldSettings({
        ...input.snapshot,
        settings: { ...input.snapshot.settings, layoutSeed: 'seed' },
      }).layoutSeed,
    ).toBe('seed');
  });

  it('rejects unsafe repository links, duplicate IDs and duplicate release identities', () => {
    const input = inputFor([]);
    expect(() =>
      buildWorld({
        ...input,
        repositories: [{ ...repository, url: 'http://github.com/user/repo' }],
      }),
    ).toThrow();
    expect(() =>
      buildWorld({
        ...input,
        repositories: [{ ...repository, url: 'https://user:secret@github.com/user/repo' }],
      }),
    ).toThrow();
    expect(() => buildWorld({ ...input, repositories: [repository, repository] })).toThrow();
    expect(() =>
      buildWorld({
        ...input,
        repositories: [
          { ...repository, releases: [...repository.releases, ...repository.releases] },
        ],
      }),
    ).toThrow();
  });

  it('canonicalizes repository and release order and preserves real project labels', () => {
    const input = inputFor(sequence('2024-01-01', 31, 1));
    const later = {
      ...repository.releases[0],
      id: '789',
      publishedAt: '2024-03-01T00:00:00Z',
      tag: 'v2',
    };
    const repos = [
      { ...repository, releases: [later, ...repository.releases] },
      { ...repository, id: '321', fullName: 'user/second' },
    ];
    const first = buildWorld({ ...input, repositories: repos });
    const second = buildWorld({
      ...input,
      repositories: [...repos]
        .reverse()
        .map((repo) => ({ ...repo, releases: [...repo.releases].reverse() })),
    });
    expect(first).toEqual(second);
    expect(first.entities.find((entity) => entity.id === 'repo:123')?.label).toBe('user/repo');
    expect(parseWorldScene(JSON.parse(JSON.stringify(first)))).toEqual(first);
  });
});
