import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createArchive } from '../../../src/core/archive/comparison.js';
import { parseArchive } from '../../../src/core/archive/parse.js';
import { serializeArchive } from '../../../src/core/archive/serialize.js';
import { parseSettings, parseSnapshot } from '../../../src/core/settings/parse.js';
import { resolveRenderSettings } from '../../../src/core/settings/resolve.js';
import { serializeSettings, serializeSnapshot } from '../../../src/core/settings/serialize.js';
import { parseGenerationSettings } from '../../../src/generate/options.js';
import { renderTerrain } from '../../../src/themes/terrain/index.js';
import { calendarFixture, sceneOptions } from '../../themes/terrain/scene/fixtures.js';
import { annualSnapshot } from './archive-fixtures.js';

const legacySettings =
  '{"preset":"balanced","density":5,"title":"@octocat","hemisphere":"north","motion":"full","layout":"banner","style":"classic","artStyle":"miniature","normalization":{"kind":"relative"}}';

describe('calendar and landscape settings', () => {
  it.each([{}, { terrainMode: 'calendar' }, { landscapeLayout: 'valley' }])(
    'preserves the exact legacy settings JSON when calendar is selected: %j',
    (input) => {
      // Given / When
      const settings = resolveRenderSettings(input, {}, 'octocat');
      // Then
      expect(JSON.stringify(settings)).toBe(legacySettings);
    },
  );

  it('preserves both legacy SVG hashes when no terrain mode is supplied', () => {
    // Given
    const data = calendarFixture('2025-01-01', 3, 4);
    // When
    const output = renderTerrain(data, sceneOptions);
    // Then
    const digest = (svg: string) => createHash('sha256').update(svg).digest('hex');
    expect(digest(output.light)).toBe(
      '50c72bf4296f3aabc7bc2349f4af0e9e13390ef5749865adb10ae7714158ffea',
    );
    expect(digest(output.dark)).toBe(
      '0ef5aa46b29a767d39c8847a178b7d84bc78d5e3e45d8513db98ecdf7dd8789b',
    );
  });

  it('removes stored geography when an explicit calendar override is applied', () => {
    // Given
    const stored = { terrainMode: 'landscape', landscapeLayout: 'valley' };
    // When
    const settings = resolveRenderSettings({ terrainMode: 'calendar' }, stored, 'octocat');
    // Then
    expect(JSON.stringify(settings)).toBe(legacySettings);
  });

  it('resolves island as the default only when landscape is selected', () => {
    // Given / When
    const settings = resolveRenderSettings({ terrainMode: 'landscape' });
    // Then
    expect(settings).toMatchObject({ terrainMode: 'landscape', landscapeLayout: 'island' });
  });

  it('lets an explicit landform override a saved landform without discarding its mode', () => {
    // Given
    const stored = { terrainMode: 'landscape', landscapeLayout: 'valley', style: 'korean' };
    // When
    const settings = resolveRenderSettings({ landscapeLayout: 'archipelago' }, stored);
    // Then
    expect(settings).toMatchObject({
      terrainMode: 'landscape',
      landscapeLayout: 'archipelago',
      style: 'korean',
    });
  });

  it.each(['island', 'archipelago', 'valley'])('roundtrips %s settings and snapshots', (layout) => {
    // Given
    const settings = { terrainMode: 'landscape', landscapeLayout: layout };
    const document = parseSettings({
      schemaVersion: 1,
      kind: 'maeul-settings',
      username: 'octocat',
      settings,
    });
    const snapshot = parseSnapshot({ ...annualSnapshot(2025), settings });
    // When
    const restored = [
      parseSettings(serializeSettings(document)),
      parseSnapshot(serializeSnapshot(snapshot)),
    ];
    // Then
    expect(restored.map((entry) => entry.settings)).toEqual([document.settings, snapshot.settings]);
    expect(restored.every((entry) => entry.settings.terrainMode === 'landscape')).toBe(true);
  });

  it('preserves mixed calendar and landscape modes through an archive export', () => {
    // Given
    const geographic = parseSnapshot({
      ...annualSnapshot(2025),
      settings: { terrainMode: 'landscape', landscapeLayout: 'valley' },
    });
    const archive = createArchive([annualSnapshot(2024), geographic]);
    // When
    const restored = parseArchive(serializeArchive(archive));
    // Then
    expect(restored.snapshots[0].settings).not.toHaveProperty('terrainMode');
    expect(restored.snapshots[1].settings).toMatchObject({
      terrainMode: 'landscape',
      landscapeLayout: 'valley',
    });
  });

  it.each([
    { terrainMode: 'hex' },
    { terrainMode: '' },
    { terrainMode: null },
    { landscapeLayout: 'banner' },
    { landscapeLayout: '' },
    { landscapeLayout: 1 },
  ])('rejects invalid geography settings at the boundary: %j', (settings) => {
    // Given / When / Then
    expect(() => resolveRenderSettings(settings)).toThrow(/terrainMode|landscapeLayout/);
  });

  it('retains omitted generation settings for saved-mode precedence', () => {
    // Given / When
    const settings = parseGenerationSettings({});
    // Then
    expect(settings.terrainMode).toBeUndefined();
    expect(settings.landscapeLayout).toBeUndefined();
  });
});
