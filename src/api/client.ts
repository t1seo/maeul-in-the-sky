import type { ContributionData, ContributionWeek, ContributionDay } from '../core/types.js';
import { normalizeContributionWeeks } from '../core/calendar.js';
import { computeStats } from '../core/stats.js';
import { CONTRIBUTIONS_QUERY } from './queries.js';
import { makeGraphQLRequest, type FetchContributionsOptions } from './request.js';

export { GitHubApiError, type GitHubApiErrorCode } from './errors.js';
export type { FetchContributionsOptions } from './request.js';

const CONTRIBUTION_LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} as const;

/**
 * Fetch GitHub contribution data for a specific user.
 *
 * When `year` is provided, fetches the full calendar year (Jan 1 – Dec 31).
 * When `year` is omitted, fetches a rolling 52-week window ending today,
 * matching GitHub's own profile contribution graph.
 *
 * @param username - GitHub username
 * @param year - Optional year to fetch. Omit for rolling 52 weeks.
 * @param token - Optional GitHub personal access token (required for private profiles)
 * @param options - Request timeout, cancellation, and fixture endpoint; total duration is capped at 30 seconds
 * @returns Promise resolving to ContributionData
 * @throws GitHubApiError with a stable code and sanitized message
 */
export async function fetchContributions(
  username: string,
  year?: number,
  token?: string,
  options: FetchContributionsOptions = {},
): Promise<ContributionData> {
  let from: string;
  let to: string;
  let effectiveYear: number;

  if (year != null) {
    // Fixed calendar year
    from = `${year}-01-01T00:00:00Z`;
    to = `${year}-12-31T23:59:59Z`;
    effectiveYear = year;
  } else {
    // Rolling 52-week window ending today
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    from = oneYearAgo.toISOString();
    to = now.toISOString();
    effectiveYear = now.getFullYear();
  }

  // Make the GraphQL request
  const calendar = await makeGraphQLRequest(
    CONTRIBUTIONS_QUERY,
    { username, from, to },
    token,
    options,
  );

  // Transform GitHub API response to ContributionWeek format
  const rawWeeks: ContributionWeek[] = calendar.weeks.map((week) => {
    const days: ContributionDay[] = week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: CONTRIBUTION_LEVELS[day.contributionLevel],
    }));

    return {
      days,
      firstDay: days[0]?.date ?? '',
    };
  });

  const weeks = normalizeContributionWeeks(rawWeeks);
  const stats = computeStats(weeks);

  return {
    weeks,
    stats: {
      ...stats,
      total: calendar.totalContributions,
    },
    year: effectiveYear,
    username,
  };
}
