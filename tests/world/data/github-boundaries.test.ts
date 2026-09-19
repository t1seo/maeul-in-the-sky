import { expect, it } from 'vitest';
import { createPublicGithubClient } from '../../../src/world/data/github.js';
import { dataHttpFixture, repositoryApiFixture } from './http-fixture.js';

it('rejects deeply nested invalid public JSON with a friendly typed error', async () => {
  const server = await dataHttpFixture((_request, response) =>
    response.end(`${'['.repeat(12000)}0${']'.repeat(12000)}`),
  );
  try {
    await expect(
      createPublicGithubClient({ fetch: server.fetch }).listRepositories('octocat'),
    ).rejects.toMatchObject({ code: 'invalid_input' });
  } finally {
    await server.close();
  }
});

it('expires and explicitly clears cached public responses', async () => {
  let calls = 0;
  let now = Date.parse('2026-09-19T00:00:00Z');
  const server = await dataHttpFixture((_request, response) => {
    calls++;
    response.end('[]');
  });
  try {
    const client = createPublicGithubClient({ fetch: server.fetch, now: () => now });
    await client.listRepositories('octocat');
    await client.listRepositories('octocat');
    expect(calls).toBe(1);
    now += 300001;
    await client.listRepositories('octocat');
    client.clearCache();
    await client.listRepositories('octocat');
    expect(calls).toBe(3);
    for (let index = 0; index < 41; index++) await client.listRepositories(`user-${index}`);
    await client.listRepositories('octocat');
    expect(calls).toBe(45);
  } finally {
    await server.close();
  }
});

it('bounds the public search at five pages and labels incomplete coverage', async () => {
  let calls = 0;
  const server = await dataHttpFixture((_request, response) => {
    calls++;
    response.writeHead(200, {
      Link: '<https://api.github.com/users/octocat/repos?page=99>; rel="next"',
    });
    response.end(JSON.stringify([{ ...repositoryApiFixture(calls), description: null }]));
  });
  try {
    const result = await createPublicGithubClient({ fetch: server.fetch }).searchRepositories(
      'octocat',
      'repo',
    );
    expect(calls).toBe(5);
    expect(result.repositories).toHaveLength(5);
    expect(result.coverage).toMatchObject({
      complete: false,
      truncatedReason: 'Repository page limit reached.',
    });
  } finally {
    await server.close();
  }
});

it('refuses invalid selections, paging, cancellation and malformed wire payloads', async () => {
  let calls = 0;
  const server = await dataHttpFixture((_request, response) => {
    calls++;
    response.end('{}');
  });
  try {
    const client = createPublicGithubClient({ fetch: server.fetch });
    await expect(client.listRepositories('bad/name')).rejects.toMatchObject({
      code: 'invalid_input',
    });
    await expect(client.listRepositories('octocat', { page: 6 })).rejects.toMatchObject({
      code: 'invalid_input',
    });
    await expect(client.getRepository('bad/name/extra')).rejects.toMatchObject({
      code: 'invalid_input',
    });
    await expect(
      client.getReleases('octocat/repo', { signal: AbortSignal.abort() }),
    ).rejects.toMatchObject({ code: 'cancelled' });
    expect(calls).toBe(0);
    await expect(client.listRepositories('octocat')).rejects.toMatchObject({
      code: 'invalid_input',
    });
    await expect(client.getReleases('octocat/repo')).rejects.toMatchObject({
      code: 'invalid_input',
    });
  } finally {
    await server.close();
  }
});

it('rejects a different repository identity before requesting its releases', async () => {
  let calls = 0;
  const server = await dataHttpFixture((_request, response) => {
    calls++;
    response.end(JSON.stringify(repositoryApiFixture(2)));
  });
  try {
    await expect(
      createPublicGithubClient({ fetch: server.fetch }).getRepository('octocat/repo-1'),
    ).rejects.toMatchObject({ code: 'invalid_input' });
    expect(calls).toBe(1);
  } finally {
    await server.close();
  }
});

it('bounds simultaneous requests and releases every slot after cancellation', async () => {
  const server = await dataHttpFixture(() => undefined);
  const controller = new AbortController();
  const client = createPublicGithubClient({ fetch: server.fetch });
  const pending = Array.from({ length: 4 }, (_, page) =>
    client.listRepositories('octocat', { page: page + 1, signal: controller.signal }),
  );
  const settled = Promise.allSettled(pending);
  try {
    await expect(client.listRepositories('another-user')).rejects.toMatchObject({
      code: 'network',
    });
    controller.abort();
    expect((await settled).every((result) => result.status === 'rejected')).toBe(true);
    await expect(
      client.listRepositories('another-user', { signal: AbortSignal.abort() }),
    ).rejects.toMatchObject({ code: 'cancelled' });
  } finally {
    controller.abort();
    await settled;
    await server.close();
  }
});
