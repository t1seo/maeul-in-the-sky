import { describe, expect, it } from 'vitest';
import { demoQuery, parseDemoQuery } from '../../src/demo/state.js';
import { settingsFixture } from './fixtures.js';

describe('C06 restore and validation', () => {
  it('restores all settings when a settings link is reopened', () => {
    const state = { document: settingsFixture('A: "B" & <C>'), mode: 'light' } as const;
    const restored = parseDemoQuery(demoQuery(state));
    expect(restored).toEqual(state);
  });

  it('uses selected preset density when no explicit density is present', () => {
    const state = parseDemoQuery('?preset=civilization&mode=light');
    expect(state.document.settings.density).toBe(9);
    expect(state.mode).toBe('light');
  });

  it('keeps explicit density when preset and density are both in the URL', () => {
    const state = parseDemoQuery('?preset=nature&density=8');
    expect(state.document.settings.density).toBe(8);
  });

  it.each([
    '?year=not-a-year',
    '?year=0',
    '?density=11',
    '?motion=fast',
    '?v=2',
    '?mode=sepia',
    '?normalization=fixed&maxCount=0',
  ])('rejects invalid query %s', (query) => {
    expect(() => parseDemoQuery(query)).toThrow();
  });

  it('shares only settings when an unrelated secret query is present', () => {
    const state = parseDemoQuery('?user=octocat&token=private&snapshot=payload');
    const query = demoQuery(state);
    expect(query).not.toContain('private');
    expect(query).not.toContain('payload');
  });

  it('restores Korean style when the old villageStyle alias is used', () => {
    expect(parseDemoQuery('?villageStyle=korean').document.settings.style).toBe('korean');
  });

  it.each(['classic', 'korean'] as const)(
    'preserves pixel art independently when the culture is %s',
    (style) => {
      // Given: an existing culture choice and the pixel art style.
      const document = settingsFixture();
      const state = {
        document: { ...document, settings: { ...document.settings, style, artStyle: 'pixel' } },
        mode: 'dark',
      } as const;

      // When: the settings link is shared and reopened.
      const query = demoQuery(state);
      const restored = parseDemoQuery(query);

      // Then: both independent choices survive the round trip.
      expect(new URLSearchParams(query).get('artStyle')).toBe('pixel');
      expect(restored).toEqual(state);
    },
  );

  it.each(['', '?style=korean', '?villageStyle=korean', '?v=1&preset=nature'])(
    'uses miniature art when an older link omits artStyle: %s',
    (query) => {
      // Given: a settings link made before art styles were introduced.
      // When: the link is reopened.
      const restored = parseDemoQuery(query);

      // Then: its art remains miniature.
      expect(restored.document.settings.artStyle).toBe('miniature');
    },
  );

  it('rejects an unsupported art style when a shared link is opened', () => {
    // Given: an unrecognized art style in a shared link.
    const query = '?style=korean&artStyle=watercolor';

    // When / Then: parsing the link reports the invalid setting.
    expect(() => parseDemoQuery(query)).toThrow();
  });
});
