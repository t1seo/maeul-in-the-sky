import { describe, expect, it } from 'vitest';
import { createWorldShareUrl, parseWorldSourceUrl } from '../../../src/world/data/urls.js';

const source = 'https://raw.githubusercontent.com/octocat/world/main/world.json';

describe('world source URLs', () => {
  it('opens published JSON from an explorer link', () => {
    // Given: a friend copied the world app address rather than the JSON address.
    const link = `https://octocat.github.io/world/?world=${encodeURIComponent(source)}`;
    // When / Then: only the explicit public JSON source is returned.
    expect(parseWorldSourceUrl(link)).toBe(source);
  });

  it('opens the same public JSON when a copied profile link requests 3D', () => {
    // Given: the profile links directly to the interactive Three view.
    const link = `https://octocat.github.io/world/?world=${encodeURIComponent(source)}&view=three`;
    // When / Then: presentation is accepted without changing the source boundary.
    expect(parseWorldSourceUrl(link)).toBe(source);
  });

  it.each(['view=invalid', 'view=three&view=map', 'view=three&token=secret'])(
    'rejects ambiguous or unsupported visit presentation: %s',
    (query) => {
      // Given / When / Then: only one explicit supported view can accompany a source.
      expect(() =>
        parseWorldSourceUrl(
          `https://octocat.github.io/world/?world=${encodeURIComponent(source)}&${query}`,
        ),
      ).toThrow();
    },
  );

  it('shares an explicitly requested 3D view with its exact public source', () => {
    // Given / When: the visitor is viewing the published world in Three.
    const link = new URL(createWorldShareUrl('https://octocat.github.io/world/', source, 'three'));
    // Then: opening or copying the link retains both source and renderer intent.
    expect(link.searchParams.get('view')).toBe('three');
    expect(parseWorldSourceUrl(link.href)).toBe(source);
  });

  it.each([
    'http://raw.githubusercontent.com/a/b/main/world.json',
    'https://user:password@octocat.github.io/world.json',
    'https://octocat.github.io/world.json#secret',
    'https://octocat.github.io.evil.example/world.json',
    'https://127.0.0.1/world.json',
    'http://localhost:4318/world.json',
    'file:///tmp/world.json',
    'data:application/json,{}',
    `${source}?token=secret`,
  ])('rejects unsupported remote source %s', (input) => {
    // Given / When / Then: invalid destinations never reach a transport.
    expect(() => parseWorldSourceUrl(input)).toThrowError();
  });

  it('allows a fixture only on the same local page origin', () => {
    // Given: the app itself runs on this loopback test origin.
    const options = { pageUrl: 'http://127.0.0.1:4317/world/' };
    // When / Then: a same-origin fixture resolves; other loopback origins do not.
    expect(parseWorldSourceUrl('/fixtures/world.json', options)).toBe(
      'http://127.0.0.1:4317/fixtures/world.json',
    );
    expect(() => parseWorldSourceUrl('http://127.0.0.1:4318/world.json', options)).toThrow();
  });

  it('does not treat a local download as publication', () => {
    // Given / When / Then: no remote source means no sharable visit link.
    expect(() => createWorldShareUrl('https://octocat.github.io/world/')).toThrowError(/Publish/);
  });

  it('shares the known public source without old view parameters', () => {
    // Given: view parameters are local presentation, not a publication record.
    const app = 'https://octocat.github.io/world/?token=old&month=2025-01';
    // When: a public source is shared.
    const link = new URL(createWorldShareUrl(app, source));
    // Then: only the world source is carried.
    expect([...link.searchParams]).toEqual([['world', source]]);
  });
});
