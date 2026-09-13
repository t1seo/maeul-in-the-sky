import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchContributions } from '../../src/api/client.js';
import { calendarResponse, jsonResponse } from './response-fixtures.js';

describe('retry policy edge cases', () => {
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

  it.each(['-1', '1'.repeat(400)])(
    'does not retry early for unsafe Retry-After %s',
    async (retryAfter) => {
      // Given
      fetchMock.mockImplementation(
        async () =>
          new Response('limited', { status: 429, headers: { 'retry-after': retryAfter } }),
      );
      // When
      const result = fetchContributions('testuser', 2025, undefined, {
        maxRetryWaitMs: 60_000,
      }).catch((error: unknown) => error);
      await vi.runAllTimersAsync();
      // Then
      expect(await result).toMatchObject({ code: 'ratelimit' });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it('honors a valid HTTP-date Retry-After', async () => {
    // Given
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    fetchMock
      .mockResolvedValueOnce(
        new Response('limited', {
          status: 429,
          headers: { 'retry-after': 'Thu, 01 Jan 2026 00:00:02 GMT' },
        }),
      )
      .mockResolvedValueOnce(jsonResponse(calendarResponse()));
    // When
    const result = fetchContributions('testuser', 2025);
    await vi.advanceTimersByTimeAsync(1999);
    // Then
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect((await result).stats.total).toBe(3);
  });

  it('does not retry any GraphQL response containing an authentication failure', async () => {
    // Given
    fetchMock.mockImplementation(async () =>
      jsonResponse(
        {
          errors: [
            { type: 'RATE_LIMITED', message: 'rate limit' },
            { type: 'UNAUTHORIZED', message: 'invalid credentials' },
          ],
        },
        200,
        { 'retry-after': '0' },
      ),
    );
    // When
    const result = fetchContributions('testuser', 2025).catch((error: unknown) => error);
    await vi.runAllTimersAsync();
    // Then
    expect(await result).toMatchObject({ code: 'auth', retryable: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([408, 500, 502, 503, 504])(
    'retries transient non-JSON HTTP %s up to three attempts',
    async (status) => {
      // Given
      fetchMock.mockImplementation(async () => new Response('upstream unavailable', { status }));
      // When
      const result = fetchContributions('testuser', 2025).catch((error: unknown) => error);
      await vi.runAllTimersAsync();
      // Then
      expect(await result).toMatchObject({ code: 'http', status, retryable: true });
      expect(fetchMock).toHaveBeenCalledTimes(3);
    },
  );

  it.each([400, 422, 501])('does not retry permanent HTTP %s', async (status) => {
    // Given
    fetchMock.mockImplementation(async () => new Response('unsupported request', { status }));
    // When
    const result = fetchContributions('testuser', 2025).catch((error: unknown) => error);
    await vi.runAllTimersAsync();
    // Then
    expect(await result).toMatchObject({ code: 'http', status, retryable: false });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([0, -1, Infinity, NaN, 0.5, 120_001])(
    'rejects invalid timeout %s before fetching',
    async (timeoutMs) => {
      // Given
      const options = { timeoutMs };
      // When
      const result = fetchContributions('testuser', 2025, undefined, options).catch(
        (error: unknown) => error,
      );
      await vi.runAllTimersAsync();
      // Then
      expect(await result).toMatchObject({ code: 'configuration' });
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
});
