/**
 * GraphQL queries for GitHub contributions API
 */

/**
 * Query to fetch a user's contribution calendar for a specific time period
 *
 * @param $username - GitHub username
 * @param $from - Start date (ISO 8601 DateTime)
 * @param $to - End date (ISO 8601 DateTime)
 */
export const CONTRIBUTIONS_QUERY = `
  query ContributionsCalendar($username: String!, $from: DateTime!, $to: DateTime!) {
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
    }
  }
`;
