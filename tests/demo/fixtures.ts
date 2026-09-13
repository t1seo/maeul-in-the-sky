import type { SettingsV1 } from '../../src/core/snapshot-types.js';

export function settingsFixture(title = 'My village'): SettingsV1 {
  return {
    schemaVersion: 1,
    kind: 'maeul-settings',
    username: 'octocat',
    year: 2025,
    settings: {
      title,
      preset: 'civilization',
      density: 9,
      hemisphere: 'north',
      motion: 'full',
      layout: 'banner',
      style: 'classic',
      normalization: { kind: 'relative' },
    },
  };
}
