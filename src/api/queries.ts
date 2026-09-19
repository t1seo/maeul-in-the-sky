import { activityAlias, type ActivityRequest } from './activity.js';

/**
 * Query to fetch a user's contribution calendar for a specific time period
 *
 * @param $username - GitHub username
 * @param $from - Start date (ISO 8601 DateTime)
 * @param $to - End date (ISO 8601 DateTime)
 */
export function contributionsQuery(activity?: ActivityRequest): string {
  const declarations =
    activity?.months.map((_, index) => {
      const alias = activityAlias(index);
      return `$${alias}From: DateTime!, $${alias}To: DateTime!`;
    }) ?? [];
  const selections =
    activity?.months.map((_, index) => {
      const alias = activityAlias(index);
      return `${alias}: contributionsCollection(from: $${alias}From, to: $${alias}To) {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      totalRepositoryContributions
      restrictedContributionsCount
    }`;
    }) ?? [];
  return `
  query ContributionsCalendar($username: String!, $from: DateTime!, $to: DateTime!${declarations.length ? `, ${declarations.join(', ')}` : ''}) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
      ${selections.join('\n')}
    }
  }
`;
}

export const CONTRIBUTIONS_QUERY = contributionsQuery();
