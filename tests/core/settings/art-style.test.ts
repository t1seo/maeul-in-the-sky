import { describe, expect, it } from 'vitest';
import { parseSettings, parseSnapshot } from '../../../src/core/settings/parse.js';
import { resolveRenderSettings } from '../../../src/core/settings/resolve.js';
import { serializeSettings } from '../../../src/core/settings/serialize.js';
import { parseGenerationSettings } from '../../../src/generate/options.js';
import { snapshotFixture } from './fixtures.js';

describe('independent miniature and pixel art styles', () => {
  it('uses miniature artwork when importing an older snapshot without an art style', () => {
    // Given
    const snapshot = snapshotFixture();
    // When
    const imported = parseSnapshot(snapshot);
    // Then
    expect(imported.settings).toMatchObject({ artStyle: 'miniature', style: 'classic' });
  });

  it('combines pixel artwork with Korean cultural content', () => {
    // Given
    const input = { artStyle: 'pixel', villageStyle: 'korean' };
    // When
    const settings = resolveRenderSettings(input);
    // Then
    expect(settings).toMatchObject({ artStyle: 'pixel', style: 'korean' });
  });

  it('allows an explicit miniature choice to override a stored pixel choice', () => {
    // Given
    const stored = { artStyle: 'pixel', style: 'korean' };
    // When
    const settings = resolveRenderSettings({ artStyle: 'miniature' }, stored);
    // Then
    expect(settings).toMatchObject({ artStyle: 'miniature', style: 'korean' });
  });

  it('preserves a selected art style through a settings export and import', () => {
    // Given
    const document = parseSettings({
      schemaVersion: 1,
      kind: 'maeul-settings',
      username: 'octocat',
      settings: { artStyle: 'pixel', style: 'korean' },
    });
    // When
    const restored = parseSettings(serializeSettings(document));
    // Then
    expect(restored.settings).toMatchObject({ artStyle: 'pixel', style: 'korean' });
  });

  it.each(['watercolor', '', null, 1])('rejects an unsupported art style: %j', (artStyle) => {
    // Given / When / Then
    expect(() => resolveRenderSettings({ artStyle })).toThrow(/artStyle/);
  });

  it('passes a pixel choice through generation option parsing', () => {
    // Given
    const request = { artStyle: 'pixel', style: 'korean' };
    // When
    const settings = parseGenerationSettings(request);
    // Then
    expect(settings).toMatchObject({ artStyle: 'pixel', style: 'korean' });
  });

  it('keeps an omitted generation art style available for stored settings precedence', () => {
    // Given / When
    const settings = parseGenerationSettings({});
    // Then
    expect(settings.artStyle).toBeUndefined();
  });
});
