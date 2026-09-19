import { z } from 'zod';
import type { ActivityBreakdown, ActivityMonth } from '../core/activity-types.js';
import {
  activityMatchesCalendar,
  activitySchema,
  activityTimestampSchema,
  MAX_ACTIVITY_MONTHS,
} from '../core/settings/activity-schema.js';
import { GitHubApiError } from './errors.js';

export type ActivityRequest = {
  readonly from: string;
  readonly to: string;
  readonly months: readonly Pick<ActivityMonth, 'month' | 'from' | 'to'>[];
};

const rangeSchema = z.object({ from: activityTimestampSchema, to: activityTimestampSchema });
const countSchema = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const totalsSchema = z.object({
  totalCommitContributions: countSchema,
  totalPullRequestContributions: countSchema,
  totalIssueContributions: countSchema,
  totalPullRequestReviewContributions: countSchema,
  totalRepositoryContributions: countSchema,
  restrictedContributionsCount: countSchema,
});

export function activityAlias(index: number): string {
  return `month${String(index).padStart(2, '0')}`;
}

export function createActivityRequest(from: string, to: string): ActivityRequest {
  const parsed = rangeSchema.safeParse({ from, to });
  if (!parsed.success || parsed.data.from > parsed.data.to)
    throw new GitHubApiError('configuration');
  const range = parsed.data;
  const months: Pick<ActivityMonth, 'month' | 'from' | 'to'>[] = [];
  const end = Date.parse(range.to);
  let cursor = Date.parse(range.from);
  while (cursor <= end) {
    if (months.length === MAX_ACTIVITY_MONTHS) throw new GitHubApiError('configuration');
    const start = new Date(cursor).toISOString();
    const nextMonth = new Date(`${start.slice(0, 7)}-01T00:00:00.000Z`);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    const last = Math.min(end, nextMonth.getTime() - 1);
    months.push({ month: start.slice(0, 7), from: start, to: new Date(last).toISOString() });
    cursor = last + 1;
  }
  return { ...range, months };
}

export function parseActivityResponse(
  user: Readonly<Record<string, unknown>>,
  request: ActivityRequest | undefined,
  calendarDates: readonly string[],
): ActivityBreakdown | undefined {
  const aliases = Object.keys(user).filter((key) => /^month\d+$/.test(key));
  if (aliases.length === 0) return undefined;
  if (!request || aliases.length !== request.months.length)
    throw new GitHubApiError('invalidresponse');
  const months = request.months.map((month, index): ActivityMonth => {
    const parsed = totalsSchema.safeParse(user[activityAlias(index)]);
    if (!parsed.success) throw new GitHubApiError('invalidresponse');
    const counts = parsed.data;
    return {
      ...month,
      commits: counts.totalCommitContributions,
      pullRequests: counts.totalPullRequestContributions,
      issues: counts.totalIssueContributions,
      reviews: counts.totalPullRequestReviewContributions,
      repositories: counts.totalRepositoryContributions,
      restricted: counts.restrictedContributionsCount,
    };
  });
  const parsed = activitySchema.safeParse({ ...request, source: 'github-contributions', months });
  if (!parsed.success || !activityMatchesCalendar(parsed.data, calendarDates))
    throw new GitHubApiError('invalidresponse');
  return parsed.data;
}
