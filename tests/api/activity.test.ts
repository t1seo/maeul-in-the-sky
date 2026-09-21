import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { fetchContributions } from '../../src/api/client.js';
import { ACTIVITY_COUNTS, activityResponse } from './activity-fixtures.js';
import { calendarResponse } from './response-fixtures.js';

const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function requested() {
  const body = fetchMock.mock.calls[0]?.[1]?.body;
  if (typeof body !== 'string') throw new TypeError('Expected a GraphQL JSON request');
  const raw: unknown = JSON.parse(body);
  return z.object({ query: z.string(), variables: z.record(z.string(), z.string()) }).parse(raw);
}

describe('monthly activity in the calendar request', () => {
  it('fetches twelve exact UTC months with one calendar and one authenticated request', async () => {
    // Given a complete leap-year response.
    fetchMock.mockResolvedValue(Response.json(activityResponse()));
    // When the annual calendar is acquired.
    const data = await fetchContributions('octocat', 2024, 'fixture-token');
    const body = requested();
    // Then aliases share one request and use exact nonoverlapping month bounds.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('authorization')).toBe(
      'bearer fixture-token',
    );
    expect(body.query.match(/month\d{2}: contributionsCollection/g)).toHaveLength(12);
    expect(body.query.match(/contributionCalendar\s*\{/g)).toHaveLength(1);
    expect(body.variables.month00From).toBe('2024-01-01T00:00:00.000Z');
    expect(body.variables.month00To).toBe('2024-01-31T23:59:59.999Z');
    expect(body.variables.month01To).toBe('2024-02-29T23:59:59.999Z');
    expect(body.variables.month11To).toBe('2024-12-31T23:59:59.000Z');
    for (let index = 1; index < 12; index++) {
      const previous = `month${String(index - 1).padStart(2, '0')}`;
      const current = `month${String(index).padStart(2, '0')}`;
      expect(
        Date.parse(body.variables[`${current}From`]) - Date.parse(body.variables[`${previous}To`]),
      ).toBe(1);
    }
    expect(data.activity?.months).toHaveLength(12);
    expect(data.activity?.months[1]).toEqual({
      month: '2024-02',
      from: '2024-02-01T00:00:00.000Z',
      to: '2024-02-29T23:59:59.999Z',
      commits: 8,
      pullRequests: 1,
      issues: 2,
      reviews: 3,
      repositories: 0,
      restricted: 1,
    });
    expect(data.stats.total).toBe(1098);
  });

  it('preserves both partial ends of the existing rolling year with thirteen aliases', async () => {
    // Given a rolling range ending partway through a UTC day.
    vi.useFakeTimers();
    vi.setSystemTime('2025-03-05T12:34:56.789Z');
    fetchMock.mockResolvedValue(
      Response.json(activityResponse('2024-03-05T12:34:56.789Z', '2025-03-05T12:34:56.789Z')),
    );
    // When the existing rolling range is acquired.
    const data = await fetchContributions('octocat');
    const body = requested();
    // Then there are no extra requests or invented full first/last months.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(body.query.match(/month\d{2}: contributionsCollection/g)).toHaveLength(13);
    expect(data.activity?.from).toBe(body.variables.from);
    expect(data.activity?.to).toBe(body.variables.to);
    expect(data.activity?.months[0]?.from).toBe('2024-03-05T12:34:56.789Z');
    expect(data.activity?.months.at(-1)?.to).toBe('2025-03-05T12:34:56.789Z');
  });

  it.each([
    ['2026-09-20T21:09:39.907Z', '2025-09-21T00:00:00.000Z'],
    ['2024-09-22T06:00:00.000Z', '2023-09-24T00:00:00.000Z'],
    ['2024-09-23T06:00:00.000Z', '2023-09-24T00:00:00.000Z'],
  ])('keeps rolling activity within GitHub’s 53 calendar weeks on %s', async (now, from) => {
    // Given GitHub omits the leading partial week when a rolling year spans 54 weeks.
    vi.useFakeTimers();
    vi.setSystemTime(now);
    fetchMock.mockResolvedValue(Response.json(activityResponse(from, now)));

    // When the rolling calendar and its monthly evidence are requested together.
    const result = await fetchContributions('octocat');
    const body = requested();

    // Then every claimed activity date is present, including across a leap year.
    expect(body.variables.from).toBe(from);
    expect(body.variables.month00From).toBe(from);
    expect(result.activity?.from).toBe(from);
    expect(result.activity?.to).toBe(now);
    expect(result.weeks[0]?.days[0]?.date).toBe(from.slice(0, 10));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('accepts legacy responses without claiming an available breakdown', async () => {
    // Given an old fixture with no monthly aliases.
    fetchMock.mockResolvedValue(Response.json(calendarResponse()));
    // When the calendar is fetched.
    const result = await fetchContributions('octocat', 2025);
    // Then the calendar remains usable and evidence stays absent.
    expect(result.stats.total).toBe(3);
    expect(result).not.toHaveProperty('activity');
  });

  it.each(['missing alias', 'null alias', 'extra alias', 'missing metric'])(
    'rejects %s without retrying or filling in zero',
    async (problem) => {
      // Given incomplete evidence in an otherwise valid response.
      const body = activityResponse();
      if (problem === 'missing alias') delete body.data.user.month11;
      if (problem === 'null alias') body.data.user.month11 = null;
      if (problem === 'extra alias') body.data.user.month12 = ACTIVITY_COUNTS;
      if (problem === 'missing metric') body.data.user.month00 = { totalCommitContributions: 8 };
      fetchMock.mockResolvedValue(Response.json(body));
      // When / Then the acquisition fails at the response boundary.
      await expect(fetchContributions('octocat', 2024)).rejects.toMatchObject({
        code: 'invalidresponse',
        retryable: false,
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each(Object.keys(ACTIVITY_COUNTS))('rejects an unsafe %s count', async (key) => {
    // Given a metric too large for exact JavaScript arithmetic.
    const body = activityResponse();
    body.data.user.month00 = { ...ACTIVITY_COUNTS, [key]: Number.MAX_SAFE_INTEGER + 1 };
    fetchMock.mockResolvedValue(Response.json(body));
    // When / Then no invalid evidence is exposed.
    await expect(fetchContributions('octocat', 2024)).rejects.toMatchObject({
      code: 'invalidresponse',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects monthly claims whose requested calendar has an unobserved day', async () => {
    // Given a missing date inside the purported activity coverage.
    fetchMock.mockResolvedValue(
      Response.json(activityResponse(undefined, undefined, '2024-06-20')),
    );
    // When / Then evidence cannot be called complete.
    await expect(fetchContributions('octocat', 2024)).rejects.toMatchObject({
      code: 'invalidresponse',
    });
  });
});
