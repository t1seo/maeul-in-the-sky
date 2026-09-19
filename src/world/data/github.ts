import { z } from 'zod';
import type { PublicReleaseRecord, PublicRepoRecord } from '../model/types.js';
import { WorldDataError } from './errors.js';
import { freezeWorldValue } from './json.js';
import { repoNameSchema } from './repository-schema.js';
import { repositoryFromApi, releasesFromApi } from './github-schema.js';
import { requestWorldJson, type WorldRequestOptions } from './transport.js';

export type GithubPageOptions = {
  readonly page?: number;
  readonly perPage?: number;
  readonly signal?: AbortSignal;
};
export type RepositoryPage = {
  readonly repositories: readonly PublicRepoRecord[];
  readonly page: number;
  readonly nextPage?: number;
  readonly coverage: PublicRepoRecord['coverage'];
};
export type ReleasePage = {
  readonly releases: readonly PublicReleaseRecord[];
  readonly coverage: PublicRepoRecord['coverage'];
};
const MAX_PAGES = 5;

export function createPublicGithubClient(
  options: Pick<WorldRequestOptions, 'fetch' | 'timeoutMs'> & { readonly now?: () => number } = {},
) {
  const now = options.now ?? Date.now;
  const cache = new Map<
    string,
    {
      readonly value: unknown;
      readonly headers: Headers;
      readonly retrievedAt: string;
      readonly expires: number;
    }
  >();
  let active = 0;
  async function get(path: string, signal?: AbortSignal) {
    if (signal?.aborted) throw new WorldDataError('cancelled', 'GitHub loading was cancelled.');
    const cached = cache.get(path);
    if (cached && cached.expires > now()) return cached;
    if (active >= 4)
      throw new WorldDataError(
        'network',
        'Wait for the current public requests before starting another.',
      );
    active++;
    try {
      const response = await requestWorldJson(`https://api.github.com${path}`, {
        ...options,
        signal,
        maxBytes: 2 * 1024 * 1024,
        headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10' },
      });
      const entry = {
        ...response,
        value: response.value,
        retrievedAt: new Date(now()).toISOString(),
        expires: now() + 300000,
      };
      if (cache.size >= 40) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) cache.delete(oldest);
      }
      cache.set(path, entry);
      return entry;
    } finally {
      active--;
    }
  }
  function name(input: string): string {
    const parsed = repoNameSchema.safeParse(input.trim());
    if (!parsed.success)
      throw new WorldDataError('invalid_input', 'Enter a public repository as owner/name.');
    return parsed.data;
  }
  function pageOptions(input: GithubPageOptions) {
    const result = z
      .object({
        page: z.number().int().min(1).max(MAX_PAGES).default(1),
        perPage: z.number().int().min(1).max(100).default(30),
      })
      .safeParse(input);
    if (!result.success)
      throw new WorldDataError('invalid_input', 'Choose a valid repository page and page size.');
    return result.data;
  }
  async function listRepositories(
    username: string,
    input: GithubPageOptions = {},
  ): Promise<RepositoryPage> {
    if (!/^[a-z\d][a-z\d-]{0,38}$/i.test(username))
      throw new WorldDataError('invalid_input', 'Enter a valid GitHub username.');
    const { page, perPage } = pageOptions(input);
    const response = await get(
      `/users/${encodeURIComponent(username)}/repos?type=owner&sort=full_name&per_page=${perPage}&page=${page}`,
      input.signal,
    );
    const list = z.array(z.unknown()).max(100).safeParse(response.value);
    if (!list.success)
      throw new WorldDataError('invalid_input', 'GitHub returned an invalid repository list.');
    const repositories = list.data.map((item) => repositoryFromApi(item, response.retrievedAt));
    const more = /rel="next"/.test(response.headers.get('link') ?? '');
    return {
      repositories,
      page,
      ...(more && page < MAX_PAGES ? { nextPage: page + 1 } : {}),
      coverage: {
        complete: !more && page === 1,
        ...(more || page > 1
          ? {
              truncatedReason: more
                ? page === MAX_PAGES
                  ? 'Repository page limit reached.'
                  : 'More repository pages are available.'
                : 'Earlier repository pages are not included in this page.',
            }
          : {}),
      },
    };
  }
  async function getReleases(
    fullName: string,
    input: { readonly signal?: AbortSignal } = {},
  ): Promise<ReleasePage> {
    const selected = name(fullName);
    const releases = new Map<string, PublicReleaseRecord>();
    for (let page = 1; page <= 3; page++) {
      try {
        const response = await get(
          `/repos/${selected}/releases?per_page=100&page=${page}`,
          input.signal,
        );
        for (const release of releasesFromApi(response.value, selected))
          releases.set(release.id, release);
        if (!/rel="next"/.test(response.headers.get('link') ?? ''))
          return { releases: [...releases.values()], coverage: { complete: true } };
      } catch (error) {
        if (!(error instanceof WorldDataError) || error.code === 'cancelled' || releases.size === 0)
          throw error;
        return {
          releases: [...releases.values()],
          coverage: { complete: false, truncatedReason: error.message },
        };
      }
    }
    return {
      releases: [...releases.values()],
      coverage: { complete: false, truncatedReason: 'Release page limit reached (300 records).' },
    };
  }
  return {
    listRepositories,
    getReleases,
    async getRepository(
      fullName: string,
      input: { readonly signal?: AbortSignal } = {},
    ): Promise<PublicRepoRecord> {
      const response = await get(`/repos/${name(fullName)}`, input.signal);
      const repository = repositoryFromApi(response.value, response.retrievedAt);
      if (repository.fullName.toLowerCase() !== name(fullName).toLowerCase())
        throw new WorldDataError(
          'invalid_input',
          'GitHub returned a different repository than the one selected.',
        );
      const releases = await getReleases(repository.fullName, input);
      return freezeWorldValue({ ...repository, ...releases });
    },
    async searchRepositories(
      username: string,
      query: string,
      input: { readonly signal?: AbortSignal } = {},
    ): Promise<RepositoryPage> {
      const repositories: PublicRepoRecord[] = [];
      const needle = query.trim().toLowerCase();
      for (let page = 1; page <= MAX_PAGES; page++) {
        const result = await listRepositories(username, { ...input, page, perPage: 100 });
        repositories.push(
          ...result.repositories.filter((repo) =>
            `${repo.fullName} ${repo.description ?? ''}`.toLowerCase().includes(needle),
          ),
        );
        if (!result.nextPage)
          return {
            repositories,
            page,
            coverage: {
              complete: result.coverage.truncatedReason !== 'Repository page limit reached.',
              ...(result.coverage.truncatedReason === 'Repository page limit reached.'
                ? { truncatedReason: result.coverage.truncatedReason }
                : {}),
            },
          };
      }
      return {
        repositories,
        page: MAX_PAGES,
        coverage: { complete: false, truncatedReason: 'Repository page limit reached.' },
      };
    },
    clearCache(): void {
      cache.clear();
    },
  };
}

export type PublicGithubClient = ReturnType<typeof createPublicGithubClient>;
