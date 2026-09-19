import { expect, it } from 'vitest';
import { parseRepositoryRecords } from '../../../src/world/data/repository-schema.js';
import { releasesFromApi, repositoryFromApi } from '../../../src/world/data/github-schema.js';
import { publicRepositoryFixture } from './world-fixture.js';
import { releaseApiFixture, repositoryApiFixture } from './http-fixture.js';

it('keeps only actual public repository metadata with matching release links', () => {
  const repository = publicRepositoryFixture();
  expect(parseRepositoryRecords([repository])).toEqual([repository]);
  expect(
    releasesFromApi([{ ...releaseApiFixture(), published_at: null }], repository.fullName),
  ).toEqual([]);
});

it.each([
  { visibility: 'private' },
  { url: 'https://github.com/octocat/different' },
  { url: 'https://github.com/octocat/repo-1?token=secret' },
  { stars: Infinity },
  { createdAt: 'yesterday' },
  { contributionCount: 12 },
])('rejects invalid or inferred repository evidence: %j', (changes) => {
  expect(() => parseRepositoryRecords([{ ...publicRepositoryFixture(), ...changes }])).toThrow(
    expect.objectContaining({ code: 'invalid_input' }),
  );
});

it('bounds chosen repositories and rejects duplicate identities or release evidence', () => {
  const repository = publicRepositoryFixture();
  expect(() => parseRepositoryRecords(Array.from({ length: 13 }, () => repository))).toThrow(
    expect.objectContaining({ code: 'invalid_input' }),
  );
  expect(() => parseRepositoryRecords([repository, repository])).toThrow(
    expect.objectContaining({ code: 'invalid_input' }),
  );
  expect(() =>
    parseRepositoryRecords([
      { ...repository, releases: [...repository.releases, ...repository.releases] },
    ]),
  ).toThrow(expect.objectContaining({ code: 'invalid_input' }));
  expect(() =>
    parseRepositoryRecords([
      {
        ...repository,
        releases: [
          { ...repository.releases[0], url: 'https://github.com/other/repo/releases/tag/v1' },
        ],
      },
    ]),
  ).toThrow(expect.objectContaining({ code: 'invalid_input' }));
});

it.each([
  { html_url: 'https://github.com:444/octocat/repo-1/releases/tag/v10' },
  { html_url: 'https://github.com/other/repo/releases/tag/v10' },
  { tag_name: '' },
  { published_at: 'not a timestamp' },
])('rejects invalid GitHub release wire data: %j', (changes) => {
  expect(() => releasesFromApi([{ ...releaseApiFixture(), ...changes }], 'octocat/repo-1')).toThrow(
    expect.objectContaining({ code: 'invalid_input' }),
  );
});

it('rejects malformed API repository identities, private visibility and unsafe URLs', () => {
  const at = '2026-09-19T00:00:00Z';
  expect(() => repositoryFromApi({}, at)).toThrow(
    expect.objectContaining({ code: 'invalid_input' }),
  );
  expect(() =>
    repositoryFromApi({ ...repositoryApiFixture(), visibility: 'internal' }, at),
  ).toThrow(expect.objectContaining({ code: 'private_repository' }));
  expect(() =>
    repositoryFromApi({ ...repositoryApiFixture(), html_url: 'javascript:void(0)' }, at),
  ).toThrow(expect.objectContaining({ code: 'invalid_input' }));
});
