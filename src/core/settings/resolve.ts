import type { ResolvedRenderSettings } from '../render-options.js';
import { VILLAGE_PRESETS } from '../presets.js';
import { parseBoundary } from './boundary.js';
import { renderSettingsInputSchema } from './schema.js';

export function resolveRenderSettings(
  explicit: unknown = {},
  loaded: unknown = {},
  username = '',
): ResolvedRenderSettings {
  const overrides = parseBoundary(renderSettingsInputSchema, explicit, 'settings');
  const stored = parseBoundary(renderSettingsInputSchema, loaded, 'settings');
  const preset = overrides.preset ?? stored.preset ?? 'balanced';
  const layoutSeed = overrides.layoutSeed ?? stored.layoutSeed;
  const terrainMode = overrides.terrainMode ?? stored.terrainMode ?? 'calendar';
  const settings: ResolvedRenderSettings = {
    preset,
    density: overrides.density ?? stored.density ?? VILLAGE_PRESETS[preset].density,
    title: overrides.title ?? stored.title ?? (username ? `@${username}` : 'My Village'),
    hemisphere: overrides.hemisphere ?? stored.hemisphere ?? 'north',
    motion: overrides.motion ?? stored.motion ?? 'full',
    layout: overrides.layout ?? stored.layout ?? 'banner',
    style: overrides.style ?? stored.style ?? 'classic',
    artStyle: overrides.artStyle ?? stored.artStyle ?? 'miniature',
    normalization: overrides.normalization ?? stored.normalization ?? { kind: 'relative' },
    ...(layoutSeed === undefined ? {} : { layoutSeed }),
  };
  switch (terrainMode) {
    case 'calendar':
      return settings;
    case 'landscape':
      return {
        ...settings,
        terrainMode,
        landscapeLayout: overrides.landscapeLayout ?? stored.landscapeLayout ?? 'island',
      };
    default:
      return terrainMode satisfies never;
  }
}
