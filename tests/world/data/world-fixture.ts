import { defaultWorldView } from '../../../src/world/model/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import type { WorldDocumentV1 } from '../../../src/world/data/types.js';
import type { PublicRepoRecord } from '../../../src/world/model/types.js';

export function worldDocumentFixture(): WorldDocumentV1 {
  return structuredClone({
    kind: 'maeul-world',
    schemaVersion: 1,
    scene: TINY_WORLD_SCENE,
    sourceSnapshot: TINY_WORLD_INPUT.snapshot,
    repositoryData: [],
    view: defaultWorldView(TINY_WORLD_SCENE),
    savedAt: '2026-09-19T00:00:00Z',
  });
}

export function publicRepositoryFixture(): PublicRepoRecord {
  return {
    id: '1',
    fullName: 'octocat/repo-1',
    url: 'https://github.com/octocat/repo-1',
    description: 'A public repository',
    primaryLanguage: 'TypeScript',
    visibility: 'public',
    createdAt: '2020-01-01T00:00:00Z',
    retrievedAt: '2026-09-19T00:00:00Z',
    stars: 10,
    coverage: { complete: true },
    releases: [
      {
        id: '10',
        tag: 'v1',
        name: 'Release',
        url: 'https://github.com/octocat/repo-1/releases/tag/v1',
        publishedAt: '2024-02-28T12:00:00Z',
      },
    ],
  };
}
