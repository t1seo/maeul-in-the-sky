import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchContributions } from '../../src/api/client.js';
import { calendarResponse, jsonResponse } from './response-fixtures.js';

describe('GitHub response boundary', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it.each([
    ['impossible date', { date: '2025-02-30' }],
    ['wrong date format', { date: '2025-1-05' }],
    ['negative count', { contributionCount: -1 }],
    ['fractional count', { contributionCount: 0.5 }],
    ['nonfinite count', { contributionCount: Infinity }],
    ['string count', { contributionCount: '3' }],
    ['unknown level', { contributionLevel: 'FIFTH_QUARTILE' }],
  ])('rejects %s before normalization without retrying', async (_name, day) => {
    // Given
    fetchMock.mockResolvedValue(jsonResponse(calendarResponse(day)));
    // When
    const result = fetchContributions('testuser', 2025).catch((error: unknown) => error);
    await vi.runAllTimersAsync();
    // Then
    expect(await result).toMatchObject({ code: 'invalidresponse', retryable: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([-1, 0.5, Infinity, '3'])('rejects invalid total %s without retrying', async (total) => {
    // Given
    fetchMock.mockResolvedValue(jsonResponse(calendarResponse({}, total)));
    // When
    const result = fetchContributions('testuser', 2025).catch((error: unknown) => error);
    await vi.runAllTimersAsync();
    // Then
    expect(await result).toMatchObject({ code: 'invalidresponse' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([{}, null, { data: {} }, { data: { user: {} } }, { errors: 'invalid' }])(
    'classifies malformed envelope %j as invalidresponse, not missing user',
    async (body) => {
      // Given
      fetchMock.mockResolvedValue(jsonResponse(body));
      // When
      const result = fetchContributions('testuser', 2025).catch((error: unknown) => error);
      await vi.runAllTimersAsync();
      // Then
      expect(await result).toMatchObject({ code: 'invalidresponse' });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    [401, 'auth'],
    [404, 'notfound'],
    [400, 'http'],
    [403, 'auth'],
  ])('classifies non-JSON HTTP %s before parsing', async (status, code) => {
    // Given
    fetchMock.mockImplementation(async () => new Response('<html>error</html>', { status }));
    // When
    const result = fetchContributions('testuser', 2025).catch((error: unknown) => error);
    await vi.runAllTimersAsync();
    // Then
    expect(await result).toMatchObject({ code, status, retryable: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('never includes an upstream error message or cause containing a token', async () => {
    // Given
    const token = 'ghp_test_secret_do_not_echo';
    fetchMock.mockResolvedValue(jsonResponse({ errors: [{ message: `Invalid query ${token}` }] }));
    // When
    const result = fetchContributions('testuser', 2025, token).catch((error: unknown) => error);
    await vi.runAllTimersAsync();
    // Then
    const error = await result;
    expect(error).toMatchObject({ code: 'invalidresponse', retryable: false });
    expect(String(error)).not.toContain(token);
    expect(JSON.stringify(error)).not.toContain(token);
    expect(error).not.toHaveProperty('cause');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('recognizes structured GraphQL rate-limit errors on HTTP 403', async () => {
    // Given
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          errors: [{ type: 'RATE_LIMITED', message: 'Temporarily throttled' }],
        },
        403,
      ),
    );
    // When
    const result = fetchContributions('testuser', 2025).catch((error: unknown) => error);
    await vi.runAllTimersAsync();
    // Then
    expect(await result).toMatchObject({ code: 'ratelimit', status: 403 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
