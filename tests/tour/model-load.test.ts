import { describe, expect, it, vi } from 'vitest';
import { loadTourModel } from '../../src/tour/model/load.js';
import { sceneFor, snapshotFor } from './model/helpers.js';

const APP = 'https://t1seo.github.io/maeul-in-the-sky/tour/';
const SOURCE = 'https://raw.githubusercontent.com/t1seo/t1seo/main/maeul-in-the-sky.snapshot.json';
const PAGE = `${APP}?snapshot=${encodeURIComponent(SOURCE)}`;

describe('tour public source loading', () => {
  it('opens a deterministic explicitly labelled sample only when no query was provided', async () => {
    // Given: a direct tour visit with no personal source.
    const fetch = vi.fn<typeof globalThis.fetch>();

    // When: two visitors open the same blank URL.
    const first = await loadTourModel({ pageUrl: APP, fetch });
    const second = await loadTourModel({ pageUrl: APP, fetch });

    // Then: the sample is stable, identifiable and requires no account request.
    expect(first.source).toBeNull();
    expect(first.model.scene.username).toBe('maeul-sky');
    expect(first.model.scene.settings.title).toContain('Sample');
    expect(second.model.scene).toEqual(first.model.scene);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('loads the requested public snapshot and retains its canonical source identities', async () => {
    // Given: a valid public snapshot delivered by the bounded HTTP transport.
    const snapshot = snapshotFor(['2025-04-01', '2025-04-02']);
    const requests: Request[] = [];
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (input, init) => {
      requests.push(new Request(input, init));
      return new Response(JSON.stringify(snapshot), {
        headers: { 'content-type': 'application/json' },
      });
    });

    // When: a linked village is opened.
    const result = await loadTourModel({ pageUrl: PAGE, fetch });

    // Then: this exact source is returned without browser credentials or redirects.
    expect(result.source).toBe(SOURCE);
    expect(result.model.scene).toEqual(sceneFor(snapshot));
    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe(SOURCE);
    expect(requests[0]?.credentials).toBe('omit');
    expect(requests[0]?.redirect).toBe('error');
  });

  it.each([
    `${APP}?snapshot=`,
    `${APP}?snapshot=   `,
    `${PAGE}&snapshot=${encodeURIComponent(SOURCE)}`,
    `${APP}?snapshott=${encodeURIComponent(SOURCE)}`,
    `${APP}?snapshot=${encodeURIComponent('https://example.com/private.json')}`,
    `${APP}?snapshot=${encodeURIComponent('https://user:password@raw.githubusercontent.com/t1seo/t1seo/main/file.json')}`,
    `${APP}?snapshot=${encodeURIComponent(`${SOURCE}?token=untrusted`)}`,
    `${APP}?snapshot=${encodeURIComponent(`${SOURCE}#fragment`)}`,
    `${APP}?snapshot=${encodeURIComponent('http://localhost:8080/private.json')}`,
  ])(
    'rejects an ambiguous or prohibited source URL without choosing a sample: %s',
    async (pageUrl) => {
      // Given: an explicit personal-source intent that cannot be safely resolved.
      const fetch = vi.fn<typeof globalThis.fetch>();

      // When / Then: invalid links fail before fetching and never fall back to other data.
      await expect(loadTourModel({ pageUrl, fetch })).rejects.toMatchObject({
        code: 'invalid_url',
      });
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it.each([404, 403, 429, 500])(
    'propagates HTTP %i without falling back to a previous village',
    async (status) => {
      // Given: a public server error for the specifically requested snapshot.
      const fetch = vi
        .fn<typeof globalThis.fetch>()
        .mockResolvedValue(new Response('Unavailable', { status }));

      // When / Then: the caller gets the failure and can retain its own current view.
      await expect(loadTourModel({ pageUrl: PAGE, fetch })).rejects.toThrow();
      expect(fetch).toHaveBeenCalledTimes(1);
    },
  );

  it.each(['{broken', JSON.stringify({ kind: 'maeul-world' }), 'x'.repeat(2 * 1024 * 1024 + 1)])(
    'rejects malformed, incompatible and oversized responses',
    async (body) => {
      // Given: untrusted content from an otherwise permitted public source.
      const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(body));

      // When / Then: no invalid content is substituted with a sample village.
      await expect(loadTourModel({ pageUrl: PAGE, fetch })).rejects.toThrow();
    },
  );

  it('respects cancellation before opening either a linked village or a sample', async () => {
    // Given: a navigation that has already been superseded.
    const controller = new AbortController();
    controller.abort();
    const fetch = vi.fn<typeof globalThis.fetch>();

    // When / Then: cancelled navigations cannot commit a model or start an HTTP request.
    for (const pageUrl of [PAGE, APP]) {
      await expect(
        loadTourModel({ pageUrl, fetch, signal: controller.signal }),
      ).rejects.toMatchObject({ code: 'cancelled' });
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it('cancels an in-flight source load while allowing the replacement source to resolve', async () => {
    // Given: one pending source request and a different later navigation.
    const controller = new AbortController();
    const snapshot = snapshotFor(['2025-05-01']);
    const pendingRequests: Request[] = [];
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      if (request.url.includes('/old.json')) {
        pendingRequests.push(request);
        return new Promise<Response>((_resolve, reject) => {
          request.signal.addEventListener(
            'abort',
            () => reject(new DOMException('Cancelled', 'AbortError')),
            { once: true },
          );
        });
      }
      return new Response(JSON.stringify(snapshot));
    });
    const older = loadTourModel({
      pageUrl: `${APP}?snapshot=${encodeURIComponent('https://t1seo.github.io/old.json')}`,
      fetch,
      signal: controller.signal,
    });
    const rejected = expect(older).rejects.toMatchObject({ code: 'cancelled' });
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // When: the visitor switches destination while the first request is pending.
    controller.abort();
    expect(pendingRequests[0]?.signal.aborted).toBe(true);
    const current = await loadTourModel({ pageUrl: PAGE, fetch });

    // Then: the cancelled request fails and only the replacement source supplies a model.
    await rejected;
    expect(current.source).toBe(SOURCE);
    expect(current.model.scene.fromDate).toBe('2025-05-01');
  });

  it('permits a same-origin localhost fixture without opening arbitrary local hosts', async () => {
    // Given: a local preview linking its own public fixture.
    const snapshot = snapshotFor(['2025-04-01']);
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response(JSON.stringify(snapshot)));

    // When: the local tour loads that relative fixture.
    const result = await loadTourModel({
      pageUrl: 'http://127.0.0.1:8080/tour/?snapshot=/fixture.json',
      fetch,
    });

    // Then: the loopback exception remains restricted to the preview's origin.
    expect(result.source).toBe('http://127.0.0.1:8080/fixture.json');
  });
});
