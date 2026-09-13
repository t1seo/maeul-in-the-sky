import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchContributions } from '../../src/api/client.js';

describe('total GitHub request deadline', () => {
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

  it('bounds all requests, body reads, and backoff to 30 seconds by default', async () => {
    // Given
    fetchMock.mockImplementation(() => new Promise<Response>(() => {}));
    const startedAt = Date.now();
    // When
    const result = fetchContributions('testuser', 2025).catch((error: unknown) => error);
    await vi.runAllTimersAsync();
    // Then
    expect(await result).toMatchObject({ code: 'timeout' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(Date.now() - startedAt).toBe(30_000);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not wait a rate-limit hint beyond the remaining total deadline', async () => {
    // Given
    fetchMock.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          setTimeout(
            () =>
              resolve(
                new Response('limited', {
                  status: 429,
                  headers: { 'retry-after': '30' },
                }),
              ),
            5000,
          );
        }),
    );
    // When
    const result = fetchContributions('testuser', 2025, undefined, {
      maxRetryWaitMs: 60_000,
    }).catch((error: unknown) => error);
    await vi.runAllTimersAsync();
    // Then
    expect(await result).toMatchObject({ code: 'ratelimit', retryAfterMs: 30_000 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
