import { z } from 'zod';
import type { PublicRepoRecord } from '../model/types.js';
import { WorldDataError } from './errors.js';

export const timestampSchema = z.iso.datetime({ offset: true });
export const repoNameSchema = z.string().regex(/^[a-z\d](?:[a-z\d-]{0,38})\/[a-z\d_.-]{1,100}$/i);
const githubUrl = z.url().refine((value) => {
  const url = new URL(value);
  return (
    url.protocol === 'https:' &&
    url.hostname === 'github.com' &&
    !url.port &&
    !url.username &&
    !url.password &&
    !url.search &&
    !url.hash
  );
}, 'Expected a public GitHub URL');

export const releaseRecordSchema = z
  .object({
    id: z.string().min(1).max(100),
    tag: z.string().min(1).max(256),
    name: z.string().max(256).optional(),
    url: githubUrl,
    publishedAt: timestampSchema,
  })
  .strict();

export const repositoryRecordSchema = z
  .object({
    id: z.string().min(1).max(100),
    fullName: repoNameSchema,
    url: githubUrl,
    description: z.string().max(10000).nullable(),
    primaryLanguage: z.string().max(100).nullable().optional(),
    createdAt: timestampSchema,
    visibility: z.literal('public'),
    stars: z.number().int().nonnegative().optional(),
    releases: z.array(releaseRecordSchema).max(300),
    retrievedAt: timestampSchema,
    coverage: z
      .object({ complete: z.boolean(), truncatedReason: z.string().max(300).optional() })
      .strict(),
  })
  .strict()
  .superRefine((repository, context) => {
    if (new URL(repository.url).pathname.toLowerCase() !== `/${repository.fullName}`.toLowerCase())
      context.addIssue({ code: 'custom', message: 'Repository URL does not match its name' });
    const ids = new Set<string>();
    for (const release of repository.releases) {
      if (
        ids.has(release.id) ||
        !new URL(release.url).pathname
          .toLowerCase()
          .startsWith(`/${repository.fullName}/releases/`.toLowerCase())
      )
        context.addIssue({
          code: 'custom',
          message: 'Release identity or repository URL is invalid',
        });
      ids.add(release.id);
    }
  });

export function parseRepositoryRecords(input: unknown): readonly PublicRepoRecord[] {
  const parsed = z.array(repositoryRecordSchema).max(12).safeParse(input);
  if (!parsed.success)
    throw new WorldDataError(
      'invalid_input',
      'World repositories must contain at most 12 valid public GitHub records.',
    );
  if (new Set(parsed.data.map((repository) => repository.id)).size !== parsed.data.length)
    throw new WorldDataError('invalid_input', 'The same repository appears more than once.');
  return parsed.data;
}
