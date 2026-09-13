import { PreviewError } from './errors.js';

type Cached<T> = { readonly value: T; readonly expires: number };
/** Mutable waiter counts keep shared work alive until its last consumer leaves. */
type Pending<T> = {
  readonly controller: AbortController;
  readonly promise: Promise<T>;
  waiters: number;
};

export class PreviewCache<T> {
  private readonly cached = new Map<string, Cached<T>>();
  private readonly pending = new Map<string, Pending<T>>();
  private closed = false;

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries: number,
    private readonly timeoutMs: number,
  ) {}

  async get(
    key: string,
    signal: AbortSignal,
    load: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    if (this.closed || signal.aborted)
      throw new PreviewError(503, 'cancelled', 'Preview request was cancelled.');
    const hit = this.cached.get(key);
    if (hit && hit.expires > Date.now()) {
      this.cached.delete(key);
      this.cached.set(key, hit);
      return hit.value;
    }
    this.cached.delete(key);
    let entry = this.pending.get(key);
    if (!entry) {
      if (this.pending.size >= this.maxEntries)
        throw new PreviewError(503, 'busy', 'Too many pending previews. Try again shortly.');
      entry = this.begin(key, load);
    }
    return this.subscribe(entry, signal);
  }

  private begin(key: string, load: (signal: AbortSignal) => Promise<T>): Pending<T> {
    const controller = new AbortController();
    const timer = setTimeout(
      () =>
        controller.abort(new PreviewError(504, 'timeout', 'GitHub request timed out. Try again.')),
      this.timeoutMs,
    );
    const interrupted = new Promise<never>((_resolve, reject) => {
      controller.signal.addEventListener('abort', () => reject(controller.signal.reason), {
        once: true,
      });
    });
    const promise = Promise.race([
      Promise.resolve().then(() => load(controller.signal)),
      interrupted,
    ])
      .then((value) => {
        if (!controller.signal.aborted && !this.closed && this.ttlMs > 0) {
          this.cached.set(key, { value, expires: Date.now() + this.ttlMs });
          while (this.cached.size > this.maxEntries) {
            const oldest = this.cached.keys().next().value;
            if (oldest !== undefined) this.cached.delete(oldest);
          }
        }
        return value;
      })
      .finally(() => {
        clearTimeout(timer);
        if (this.pending.get(key)?.controller === controller) this.pending.delete(key);
        controller.abort();
      });
    const entry = { controller, promise, waiters: 0 };
    this.pending.set(key, entry);
    return entry;
  }

  private async subscribe(entry: Pending<T>, signal: AbortSignal): Promise<T> {
    entry.waiters++;
    let rejectAbort: () => void = () => {};
    const interrupted = new Promise<never>((_resolve, reject) => {
      rejectAbort = () =>
        reject(new PreviewError(503, 'cancelled', 'Preview request was cancelled.'));
      signal.addEventListener('abort', rejectAbort, { once: true });
      if (signal.aborted) rejectAbort();
    });
    try {
      return await Promise.race([entry.promise, interrupted]);
    } finally {
      signal.removeEventListener('abort', rejectAbort);
      entry.waiters--;
      if (entry.waiters === 0)
        entry.controller.abort(
          new PreviewError(503, 'cancelled', 'Preview request was cancelled.'),
        );
    }
  }

  close(): void {
    this.closed = true;
    this.cached.clear();
    for (const entry of this.pending.values())
      entry.controller.abort(new PreviewError(503, 'shutdown', 'Preview server is closing.'));
    this.pending.clear();
  }
}
