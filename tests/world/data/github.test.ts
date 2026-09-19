import { expect, it } from 'vitest';
import { createPublicGithubClient } from '../../../src/world/data/github.js';
import { dataHttpFixture, repositoryApiFixture, releaseApiFixture } from './http-fixture.js';

it('lists explicit pages and caches metadata without making requests on construction', async () => {
  const requests: string[] = [];
  const server = await dataHttpFixture((request, response) => {
    requests.push(request.url ?? '');
    const page = new URL(request.url ?? '/', 'http://localhost').searchParams.get('page');
    response.writeHead(
      200,
      page === '1'
        ? { Link: '<https://api.github.com/users/octocat/repos?page=2>; rel="next"' }
        : {},
    );
    response.end(JSON.stringify([repositoryApiFixture(Number(page))]));
  });
  try {
    const client = createPublicGithubClient({ fetch: server.fetch });
    expect(requests).toEqual([]);
    const first = await client.listRepositories('octocat');
    expect(first.nextPage).toBe(2);
    expect(first.coverage.complete).toBe(false);
    expect((await client.listRepositories('octocat')).repositories).toEqual(first.repositories);
    const result = await client.searchRepositories('octocat', 'repo-2');
    expect(result.repositories.map((repository) => repository.fullName)).toEqual([
      'octocat/repo-2',
    ]);
    expect(result.coverage.complete).toBe(true);
    expect(requests).toHaveLength(3);
  } finally {
    await server.close();
  }
});

it('selects actual public metadata and uses publishedAt instead of release creation time', async () => {
  const server = await dataHttpFixture((request, response) => {
    response.end(
      JSON.stringify(
        request.url?.includes('/releases')
          ? [releaseApiFixture(), { ...releaseApiFixture(11), draft: true }]
          : repositoryApiFixture(),
      ),
    );
  });
  try {
    const result = await createPublicGithubClient({ fetch: server.fetch }).getRepository(
      'octocat/repo-1',
    );
    expect(result.releases).toHaveLength(1);
    expect(result.releases[0].publishedAt).toBe('2024-02-29T12:00:00Z');
    expect(result.coverage.complete).toBe(true);
    expect(result).not.toHaveProperty('contributionCount');
  } finally {
    await server.close();
  }
});

it('refuses private repository metadata even if a server returns it', async () => {
  const server = await dataHttpFixture((_request, response) =>
    response.end(JSON.stringify({ ...repositoryApiFixture(), private: true })),
  );
  try {
    await expect(
      createPublicGithubClient({ fetch: server.fetch }).getRepository('octocat/repo-1'),
    ).rejects.toMatchObject({ code: 'private_repository' });
  } finally {
    await server.close();
  }
});

it('keeps partial release evidence and labels truncated coverage after a rate limit', async () => {
  const server = await dataHttpFixture((request, response) => {
    if (new URL(request.url ?? '/', 'http://localhost').searchParams.get('page') === '1') {
      response.writeHead(200, {
        Link: '<https://api.github.com/repos/octocat/repo-1/releases?page=2>; rel="next"',
      });
      response.end(JSON.stringify([releaseApiFixture()]));
    } else response.writeHead(429).end('{}');
  });
  try {
    const result = await createPublicGithubClient({ fetch: server.fetch }).getReleases(
      'octocat/repo-1',
    );
    expect(result.releases).toHaveLength(1);
    expect(result.coverage).toMatchObject({
      complete: false,
      truncatedReason: expect.stringMatching(/rate limited/),
    });
  } finally {
    await server.close();
  }
});

it('stops release pagination at its hard cap', async () => {
  let calls = 0;
  const server = await dataHttpFixture((_request, response) => {
    calls++;
    response.writeHead(200, {
      Link: '<https://api.github.com/repos/octocat/repo-1/releases?page=99>; rel="next"',
    });
    response.end(JSON.stringify([releaseApiFixture(calls)]));
  });
  try {
    const result = await createPublicGithubClient({ fetch: server.fetch }).getReleases(
      'octocat/repo-1',
    );
    expect(calls).toBe(3);
    expect(result.coverage.complete).toBe(false);
    expect(result.releases).toHaveLength(3);
  } finally {
    await server.close();
  }
});
