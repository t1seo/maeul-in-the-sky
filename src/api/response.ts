import { z } from 'zod';
import { GitHubApiError } from './errors.js';
import type { ActivityBreakdown } from '../core/activity-types.js';
import { parseActivityResponse, type ActivityRequest } from './activity.js';

const countSchema = z.number().finite().int().nonnegative();
const calendarSchema = z
  .object({
    totalContributions: countSchema,
    weeks: z.array(
      z.object({
        contributionDays: z.array(
          z.object({
            date: z.iso.date(),
            contributionCount: countSchema,
            contributionLevel: z.enum([
              'NONE',
              'FIRST_QUARTILE',
              'SECOND_QUARTILE',
              'THIRD_QUARTILE',
              'FOURTH_QUARTILE',
            ]),
          }),
        ),
      }),
    ),
  })
  .refine((calendar) => {
    const dates = calendar.weeks.flatMap((week) => week.contributionDays.map((day) => day.date));
    return new Set(dates).size === dates.length;
  });

const graphQLErrorSchema = z.object({
  type: z.string().optional(),
  message: z.string(),
  extensions: z.object({ code: z.string().optional() }).optional(),
});

const envelopeSchema = z.object({
  data: z
    .object({
      user: z
        .object({ contributionsCollection: z.object({ contributionCalendar: calendarSchema }) })
        .catchall(z.unknown())
        .nullable(),
    })
    .nullish(),
  errors: z.array(graphQLErrorSchema).optional(),
});

const errorBodySchema = z.object({
  message: z.string().optional(),
  errors: z.array(graphQLErrorSchema).optional(),
});

export type GitHubCalendar = z.infer<typeof calendarSchema> & {
  readonly activity?: ActivityBreakdown;
};

function retryAfterMs(headers: Headers): number | undefined {
  const retryAfter = headers.get('retry-after');
  const reset = headers.get('x-ratelimit-reset');
  const delays: number[] = [];
  if (retryAfter !== null) {
    if (/^\d+(?:\.\d+)?$/.test(retryAfter)) {
      delays.push(Math.min(Math.ceil(Number(retryAfter) * 1000), Number.MAX_SAFE_INTEGER));
    } else if (/^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(retryAfter)) {
      const delay = Date.parse(retryAfter) - Date.now();
      if (Number.isFinite(delay)) delays.push(Math.max(0, delay));
    }
  }
  if (headers.get('x-ratelimit-remaining') === '0' && reset !== null && /^\d+$/.test(reset)) {
    const delay = Math.min(Number(reset) * 1000 - Date.now(), Number.MAX_SAFE_INTEGER);
    delays.push(Math.max(0, delay));
  }
  return delays.length > 0 ? Math.max(...delays) : undefined;
}

function rateLimitError(response: Response): GitHubApiError {
  return new GitHubApiError('ratelimit', {
    status: response.status,
    retryAfterMs: retryAfterMs(response.headers) ?? 60_000,
  });
}

export async function parseGitHubResponse(
  response: Response,
  requestedActivity?: ActivityRequest,
): Promise<GitHubCalendar> {
  const { status } = response;
  if (status === 401) throw new GitHubApiError('auth', { status });
  if (status === 404) throw new GitHubApiError('notfound', { status });
  if (
    status === 429 ||
    (status === 403 &&
      (response.headers.get('x-ratelimit-remaining') === '0' ||
        response.headers.has('retry-after')))
  )
    throw rateLimitError(response);
  if (!response.ok && status !== 403) {
    const delay = retryAfterMs(response.headers);
    throw new GitHubApiError('http', {
      status,
      ...(delay === undefined ? {} : { retryAfterMs: delay }),
    });
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    if (status === 403) throw new GitHubApiError('auth', { status });
    if (error instanceof SyntaxError) throw new GitHubApiError('invalidresponse', { status });
    throw error;
  }

  if (status === 403) {
    const parsed = errorBodySchema.safeParse(body);
    if (
      parsed.success &&
      parsed.data.errors?.some(
        (error) => error.type === 'RATE_LIMITED' || error.extensions?.code === 'RATE_LIMITED',
      )
    )
      throw rateLimitError(response);
    const messages = parsed.success
      ? [parsed.data.message ?? '', ...(parsed.data.errors?.map((error) => error.message) ?? [])]
      : [];
    if (messages.some((message) => /rate limit/i.test(message))) throw rateLimitError(response);
    throw new GitHubApiError('auth', { status });
  }

  const parsed = envelopeSchema.safeParse(body);
  if (!parsed.success) throw new GitHubApiError('invalidresponse', { status });
  const errors = parsed.data.errors ?? [];
  const codes = new Set(errors.flatMap((error) => [error.type, error.extensions?.code]));
  if (['UNAUTHORIZED', 'UNAUTHENTICATED', 'FORBIDDEN'].some((code) => codes.has(code))) {
    throw new GitHubApiError('auth', { status });
  }
  if (errors.length > 0) {
    if (
      codes.has('NOT_FOUND') ||
      errors.some((error) => /Could not resolve to a User/i.test(error.message))
    ) {
      throw new GitHubApiError('notfound', { status });
    }
    if (
      codes.has('RATE_LIMITED') ||
      errors.some((error) => /rate limit/i.test(error.message)) ||
      response.headers.get('x-ratelimit-remaining') === '0'
    )
      throw rateLimitError(response);
    throw new GitHubApiError('invalidresponse', { status });
  }
  if (parsed.data.data?.user === null) throw new GitHubApiError('notfound', { status });
  if (!parsed.data.data) throw new GitHubApiError('invalidresponse', { status });
  const user = parsed.data.data.user;
  const calendar = user.contributionsCollection.contributionCalendar;
  const activity = parseActivityResponse(
    user,
    requestedActivity,
    calendar.weeks.flatMap((week) => week.contributionDays.map((day) => day.date)),
  );
  return { ...calendar, ...(activity === undefined ? {} : { activity }) };
}
