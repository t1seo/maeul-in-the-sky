import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchContributions } from '../../src/api/client.js';
import { calendarResponse, jsonResponse } from './response-fixtures.js';

describe('bounded GitHub transport', () => {
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

  it.each([429, 503])('honors Retry-After on HTTP %s before a successful retry', async (status) => {
    // Given
    fetchMock
      .mockResolvedValueOnce(new Response('busy', { status, headers: { 'retry-after': '2' } }))
      .mockResolvedValueOnce(jsonResponse(calendarResponse()));
    // When
    const result = fetchContributions('testuser', 2025);
    await vi.advanceTimersByTimeAsync(1999);
    // Then
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect((await result).stats.total).toBe(3);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('honors exhausted rate reset on HTTP 200 GraphQL errors', async () => {
    // Given
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ errors: [{ type: 'RATE_LIMITED', message: 'limit' }] }, 200, {
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': String(Date.now() / 1000 + 3),
        }),
      )
      .mockResolvedValueOnce(jsonResponse(calendarResponse()));
    // When
    const result = fetchContributions('testuser', 2025);
    await vi.advanceTimersByTimeAsync(2999);
    // Then
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect((await result).stats.total).toBe(3);
  });

  it.each(['3600', 'Sun, 01 Jan 2040 00:00:00 GMT'])(
    'does not wait beyond budget or retry early for %s',
    async (retryAfter) => {
      // Given
      fetchMock.mockResolvedValue(
        new Response('limited', { status: 429, headers: { 'retry-after': retryAfter } }),
      );
      // When
      const result = fetchContributions('testuser', 2025).catch((error: unknown) => error);
      await vi.runAllTimersAsync();
      // Then
      expect(await result).toMatchObject({ code: 'ratelimit', status: 429 });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it('bounds total retry wait across attempts', async () => {
    // Given
    fetchMock.mockImplementation(
      async () => new Response('limited', { status: 429, headers: { 'retry-after': '6' } }),
    );
    // When
    const result = fetchContributions('testuser', 2025).catch((error: unknown) => error);
    await vi.runAllTimersAsync();
    // Then
    expect(await result).toMatchObject({ code: 'ratelimit' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('times out a stalled fetch even when the stub ignores its AbortSignal', async () => {
    // Given
    fetchMock.mockImplementation(() => new Promise<Response>(() => {}));
    // When
    const result = fetchContributions('testuser', 2025, undefined, { timeoutMs: 20 }).catch(
      (error: unknown) => error,
    );
    await vi.runAllTimersAsync();
    // Then
    expect(await result).toMatchObject({ code: 'timeout', retryable: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls.every(([, init]) => init?.signal?.aborted)).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('includes stalled response body reads in the request timeout', async () => {
    // Given
    const response = jsonResponse(calendarResponse());
    vi.spyOn(response, 'json').mockImplementation(() => new Promise<unknown>(() => {}));
    fetchMock.mockResolvedValue(response);
    // When
    const result = fetchContributions('testuser', 2025, undefined, { timeoutMs: 20 }).catch(
      (error: unknown) => error,
    );
    await vi.runAllTimersAsync();
    // Then
    expect(await result).toMatchObject({ code: 'timeout' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels pending retry waits without another fetch or leaking the abort reason', async () => {
    // Given
    const controller = new AbortController();
    fetchMock.mockRejectedValue(new TypeError('secret in network failure'));
    // When
    const result = fetchContributions('testuser', 2025, undefined, {
      signal: controller.signal,
    }).catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(1);
    controller.abort(new Error('secret abort reason'));
    await vi.runAllTimersAsync();
    // Then
    expect(await result).toMatchObject({ code: 'aborted', retryable: false });
    expect(String(await result)).not.toContain('secret');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not send a request for an already aborted signal', async () => {
    // Given
    const signal = AbortSignal.abort();
    // When
    const result = fetchContributions('testuser', 2025, undefined, { signal }).catch(
      (error: unknown) => error,
    );
    await vi.runAllTimersAsync();
    // Then
    expect(await result).toMatchObject({ code: 'aborted' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects arbitrary endpoints without sending credentials or echoing the URL', async () => {
    // Given
    const endpoint = 'https://attacker.invalid/graphql?token=secret';
    // When
    const result = fetchContributions('testuser', 2025, 'ghp_secret', { endpoint }).catch(
      (error: unknown) => error,
    );
    await vi.runAllTimersAsync();
    // Then
    expect(await result).toMatchObject({ code: 'configuration' });
    expect(String(await result)).not.toContain('secret');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('omits credentials for loopback fixtures and disables redirects', async () => {
    // Given
    fetchMock.mockResolvedValue(jsonResponse(calendarResponse()));
    // When
    await fetchContributions('testuser', 2025, 'ghp_secret', {
      endpoint: 'http://127.0.0.1:45678/graphql',
    });
    // Then
    const init = fetchMock.mock.calls[0]?.[1];
    expect(new Headers(init?.headers).has('authorization')).toBe(false);
    expect(init?.redirect).toBe('manual');
  });
});
