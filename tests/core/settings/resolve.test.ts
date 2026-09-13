import { describe, expect, it } from 'vitest';
import type { RenderSettingsInput } from '../../../src/core/render-options.js';
import type { ThemeOptions } from '../../../src/core/types.js';
import { resolveRenderSettings } from '../../../src/core/settings/resolve.js';

describe('C01-precedence', () => {
  it('resolves library defaults when fields are absent', () => {
    // Given
    const input = {};
    // When
    const settings = resolveRenderSettings(input, {}, 'octocat');
    // Then
    expect(settings).toEqual({
      preset: 'balanced',
      density: 5,
      title: '@octocat',
      hemisphere: 'north',
      motion: 'full',
      layout: 'banner',
      style: 'classic',
      normalization: { kind: 'relative' },
    });
  });

  it('uses explicit fields above loaded fields above preset defaults', () => {
    // Given
    const loaded = { preset: 'nature', density: 3, motion: 'off', layout: 'card' };
    // When
    const settings = resolveRenderSettings({ preset: 'civilization', motion: 'subtle' }, loaded);
    // Then
    expect(settings).toMatchObject({
      preset: 'civilization',
      density: 3,
      motion: 'subtle',
      layout: 'card',
    });
  });

  it('uses the selected preset density when both layers omit density', () => {
    // Given
    const input = { preset: 'civilization', density: undefined };
    // When
    const settings = resolveRenderSettings(input);
    // Then
    expect(settings.density).toBe(9);
  });

  it.each([
    { density: 0 },
    { density: 11 },
    { density: 2.5 },
    { density: '5' },
    { preset: 'toString' },
    { motion: '' },
    { layout: 'wide' },
    { style: 'unknown' },
    { hemisphere: 'west' },
    { normalization: { kind: 'fixed', maxCount: 0 } },
    { normalization: { kind: 'fixed', maxCount: NaN } },
    { normalization: { kind: 'fixed', maxCount: Infinity } },
    { normalization: { kind: 'relative', maxCount: 10 } },
    { token: 'secret' },
  ])('rejects explicit invalid fields rather than falling back: %j', (input) => {
    // Given
    const loaded = { density: 5 };
    // When / Then
    expect(() => resolveRenderSettings(input, loaded)).toThrow();
  });

  it('preserves inert title text and a literal seed', () => {
    // Given
    const title = '<script>alert("x")</script> & ${{ value }}';
    // When
    const settings = resolveRenderSettings({ title, layoutSeed: 'year-independent' });
    // Then
    expect(settings).toMatchObject({ title, layoutSeed: 'year-independent' });
  });

  it('accepts villageStyle as a typed public input alias', () => {
    // Given
    const input = { villageStyle: 'korean' } satisfies RenderSettingsInput;
    const themeOptions = {
      title: '@octocat',
      width: 840,
      height: 240,
      villageStyle: 'korean',
    } satisfies ThemeOptions;
    // When
    const settings = resolveRenderSettings(input);
    // Then
    expect(settings.style).toBe(themeOptions.villageStyle);
    expect(settings).not.toHaveProperty('villageStyle');
  });

  it.each([
    [{ style: 'korean', villageStyle: 'korean' }, 'korean'],
    [{ style: 'classic', villageStyle: 'classic' }, 'classic'],
  ] as const)(
    'accepts identical style aliases and keeps canonical output for %j',
    (input, style) => {
      // Given / When
      const settings = resolveRenderSettings(input);
      // Then
      expect(settings.style).toBe(style);
      expect(settings).not.toHaveProperty('villageStyle');
    },
  );

  it('rejects conflicting style aliases within one input layer', () => {
    // Given
    const input = { style: 'classic', villageStyle: 'korean' };
    // When / Then
    expect(() => resolveRenderSettings(input)).toThrow(/settings\.villageStyle.*conflicts/i);
  });

  it('rejects conflicting style aliases within the loaded input layer', () => {
    // Given
    const loaded = { style: 'classic', villageStyle: 'korean' };
    // When / Then
    expect(() => resolveRenderSettings({}, loaded)).toThrow(/settings\.villageStyle.*conflicts/i);
  });

  it.each([
    [{ villageStyle: 'korean' }, { style: 'classic' }, 'korean'],
    [{ style: 'classic' }, { villageStyle: 'korean' }, 'classic'],
  ] as const)(
    'honors explicit style aliases above normalized loaded aliases for %j',
    (explicit, loaded, style) => {
      // Given / When
      const settings = resolveRenderSettings(explicit, loaded);
      // Then
      expect(settings.style).toBe(style);
    },
  );

  it.each([
    ['title', 'prefix\u0000suffix', 'NUL'],
    ['title', 'prefix\u0008suffix', 'forbidden C0'],
    ['title', 'prefix\uD800suffix', 'lone high surrogate'],
    ['title', 'prefix\uDC00suffix', 'lone low surrogate'],
    ['title', 'prefix\uFFFEsuffix', 'U+FFFE'],
    ['title', 'prefix\uFFFFsuffix', 'U+FFFF'],
    ['layoutSeed', 'prefix\u0000suffix', 'NUL'],
    ['layoutSeed', 'prefix\u000Bsuffix', 'forbidden C0'],
    ['layoutSeed', 'prefix\uD800suffix', 'lone high surrogate'],
    ['layoutSeed', 'prefix\uDC00suffix', 'lone low surrogate'],
    ['layoutSeed', 'prefix\uFFFEsuffix', 'U+FFFE'],
    ['layoutSeed', 'prefix\uFFFFsuffix', 'U+FFFF'],
  ] as const)('rejects XML 1.0 forbidden %s %s characters', (field, value, _description) => {
    // Given
    const input = { [field]: value };
    // When / Then
    expect(() => resolveRenderSettings(input)).toThrow(
      new RegExp(`settings\\.${field}.*XML 1\\.0`),
    );
  });

  it('preserves XML-safe whitespace, supplementary Unicode, Korean, and quoted markup', () => {
    // Given
    const value = '\tline one\nline two\r😀𠮷한글 <svg aria-label="quoted">& text</svg>';
    // When
    const settings = resolveRenderSettings({ title: value, layoutSeed: value });
    // Then
    expect(settings).toMatchObject({ title: value, layoutSeed: value });
  });
});
