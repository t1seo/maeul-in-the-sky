export function calendarResponse(
  day: Readonly<Record<string, unknown>> = {},
  total: unknown = 3,
): unknown {
  return {
    data: {
      user: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: total,
            weeks: [
              {
                contributionDays: [
                  {
                    date: '2025-01-05',
                    contributionCount: 3,
                    contributionLevel: 'FIRST_QUARTILE',
                    ...day,
                  },
                ],
              },
            ],
          },
        },
      },
    },
  };
}

export function jsonResponse(body: unknown, status = 200, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(body), { status, headers });
}
