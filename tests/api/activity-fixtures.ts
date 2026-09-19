export const ACTIVITY_COUNTS = {
  totalCommitContributions: 8,
  totalPullRequestContributions: 1,
  totalIssueContributions: 2,
  totalPullRequestReviewContributions: 3,
  totalRepositoryContributions: 0,
  restrictedContributionsCount: 1,
} as const;

export function activityResponse(
  from = '2024-01-01T00:00:00Z',
  to = '2024-12-31T23:59:59Z',
  missingDate?: string,
) {
  const days: { date: string; contributionCount: number; contributionLevel: string }[] = [];
  for (
    let time = Date.parse(`${from.slice(0, 10)}T00:00:00Z`);
    time <= Date.parse(to);
    time += 86_400_000
  ) {
    const date = new Date(time).toISOString().slice(0, 10);
    if (date !== missingDate)
      days.push({ date, contributionCount: 3, contributionLevel: 'FIRST_QUARTILE' });
  }
  const months = [...new Set(days.map((day) => day.date.slice(0, 7)))];
  const user: Record<string, unknown> = {
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: days.length * 3,
        weeks: Array.from({ length: Math.ceil(days.length / 7) }, (_, index) => ({
          contributionDays: days.slice(index * 7, index * 7 + 7),
        })),
      },
    },
  };
  months.forEach((_month, index) => {
    user[`month${String(index).padStart(2, '0')}`] = { ...ACTIVITY_COUNTS };
  });
  return { data: { user } };
}
