import { z } from 'zod';
import type { PublicReleaseRecord, PublicRepoRecord } from '../model/types.js';
import { WorldDataError } from './errors.js';
import { repositoryRecordSchema, repoNameSchema, timestampSchema } from './repository-schema.js';

const repositoryApi = z.object({
  id: z.number().int().positive(),
  full_name: repoNameSchema,
  private: z.boolean(),
  visibility: z.string().optional(),
  html_url: z.string(),
  description: z.string().nullable(),
  language: z.string().nullable().optional(),
  created_at: timestampSchema,
  stargazers_count: z.number().int().nonnegative().optional(),
});
const releaseApi = z.object({
  id: z.number().int().positive(),
  tag_name: z.string().min(1).max(256),
  name: z.string().max(256).nullable(),
  html_url: z.url(),
  published_at: timestampSchema.nullable(),
  draft: z.boolean(),
});

export function repositoryFromApi(input: unknown, retrievedAt: string): PublicRepoRecord {
  const result = repositoryApi.safeParse(input);
  if (!result.success)
    throw new WorldDataError('invalid_input', 'GitHub returned invalid repository metadata.');
  const repo = result.data;
  if (repo.private || (repo.visibility !== undefined && repo.visibility !== 'public'))
    throw new WorldDataError(
      'private_repository',
      'Only public repository metadata can be added to a world.',
    );
  const parsed = repositoryRecordSchema.safeParse({
    id: String(repo.id),
    fullName: repo.full_name,
    url: repo.html_url,
    description: repo.description,
    primaryLanguage: repo.language,
    createdAt: repo.created_at,
    visibility: 'public',
    stars: repo.stargazers_count,
    retrievedAt,
    releases: [],
    coverage: { complete: false, truncatedReason: 'Releases have not been loaded.' },
  });
  if (!parsed.success)
    throw new WorldDataError('invalid_input', 'GitHub repository links or metadata are invalid.');
  return parsed.data;
}

export function releasesFromApi(input: unknown, fullName: string): readonly PublicReleaseRecord[] {
  const parsed = z.array(releaseApi).max(100).safeParse(input);
  if (!parsed.success)
    throw new WorldDataError('invalid_input', 'GitHub returned invalid release metadata.');
  const releases: PublicReleaseRecord[] = [];
  for (const release of parsed.data) {
    if (release.draft || release.published_at === null) continue;
    const url = new URL(release.html_url);
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'github.com' ||
      url.port ||
      url.username ||
      url.password ||
      url.hash ||
      url.search ||
      !url.pathname.toLowerCase().startsWith(`/${fullName}/releases/`.toLowerCase())
    )
      throw new WorldDataError(
        'invalid_input',
        'GitHub returned a release outside the selected public repository.',
      );
    releases.push({
      id: String(release.id),
      tag: release.tag_name,
      ...(release.name ? { name: release.name } : {}),
      url: url.href,
      publishedAt: release.published_at,
    });
  }
  return releases;
}
