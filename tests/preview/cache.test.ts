import { afterEach, describe, expect, it, vi } from 'vitest';
import { PreviewCache } from '../../src/preview/cache.js';

afterEach(() => vi.useRealTimers());

describe('C09-cache-timeout bounded work', () => {
  it('deduplicates in-flight requests when one subscriber cancels', async () => {
    // Given two subscribers sharing a pending lookup.
    const cache = new PreviewCache<number>(300000, 32, 1000);
    const first = new AbortController();
    const second = new AbortController();
    let finish: (value: number) => void = () => {};
    let loads = 0;
    let upstream: AbortSignal | undefined;
    const load = (signal: AbortSignal) => {
      loads++;
      upstream = signal;
      return new Promise<number>((resolve) => {
        finish = resolve;
      });
    };
    const a = cache.get('account', first.signal, load);
    const b = cache.get('account', second.signal, load);
    await Promise.resolve();
    // When the first subscriber disconnects and the shared request succeeds.
    first.abort();
    finish(12);
    // Then the other subscriber still receives its result from one lookup.
    await expect(a).rejects.toMatchObject({ code: 'cancelled' });
    await expect(b).resolves.toBe(12);
    expect(loads).toBe(1);
    expect(upstream?.aborted).toBe(true);
    cache.close();
  });
  it('evicts the least recently used result when the bounded cache fills', async () => {
    // Given two retained accounts and an access refreshing the first one.
    const cache = new PreviewCache<string>(300000, 2, 1000);
    const calls: string[] = [];
    const read = (key: string) =>
      cache.get(key, new AbortController().signal, async () => {
        calls.push(key);
        return key;
      });
    await read('a');
    await read('b');
    await read('a');
    // When a third entry displaces the least recently used second account.
    await read('c');
    await read('b');
    // Then only that account requires another load.
    expect(calls).toEqual(['a', 'b', 'c', 'b']);
    cache.close();
  });
  it('expires cached data when five minutes elapse', async () => {
    // Given an account fetched at a frozen clock.
    vi.useFakeTimers();
    const cache = new PreviewCache<number>(300000, 32, 1000);
    let loads = 0;
    const read = () => cache.get('a', new AbortController().signal, async () => ++loads);
    await read();
    await vi.advanceTimersByTimeAsync(299999);
    expect(await read()).toBe(1);
    // When the TTL expires.
    await vi.advanceTimersByTimeAsync(1);
    // Then the next request fetches fresh data.
    expect(await read()).toBe(2);
    cache.close();
  });
  it('aborts the upstream when the last waiting request disconnects', async () => {
    // Given a pending upstream request.
    const cache = new PreviewCache<number>(300000, 32, 1000);
    const requester = new AbortController();
    let upstream: AbortSignal | undefined;
    const pending = cache.get('a', requester.signal, (signal) => {
      upstream = signal;
      return new Promise<number>(() => {});
    });
    await Promise.resolve();
    // When its only subscriber leaves.
    requester.abort();
    // Then the request settles and its downstream work is cancelled.
    await expect(pending).rejects.toMatchObject({ code: 'cancelled' });
    expect(upstream?.aborted).toBe(true);
    cache.close();
  });
  it('settles by the deadline when a dependency ignores its cancellation signal', async () => {
    // Given a stalled dependency and a finite deadline.
    vi.useFakeTimers();
    const cache = new PreviewCache<number>(300000, 32, 100);
    const pending = cache.get(
      'a',
      new AbortController().signal,
      () => new Promise<number>(() => {}),
    );
    const settled = expect(pending).rejects.toMatchObject({ status: 504, code: 'timeout' });
    // When the deadline arrives.
    await vi.advanceTimersByTimeAsync(100);
    // Then callers are not trapped by the dependency.
    await settled;
    cache.close();
  });
  it('cancels pending work and rejects future work when closed', async () => {
    // Given a pending lookup.
    const cache = new PreviewCache<number>(300000, 32, 1000);
    const pending = cache.get(
      'a',
      new AbortController().signal,
      () => new Promise<number>(() => {}),
    );
    // When shutdown starts.
    cache.close();
    // Then both current and new consumers settle with explicit cancellation.
    await expect(pending).rejects.toMatchObject({ code: 'shutdown' });
    await expect(cache.get('b', new AbortController().signal, async () => 1)).rejects.toMatchObject(
      { code: 'cancelled' },
    );
  });
});
