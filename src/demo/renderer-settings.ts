import type { ResolvedRenderSettings } from '../core/render-options.js';
import { resolveRenderSettings } from '../core/settings/resolve.js';
import { RENDERER_VERSIONS, type RendererVersion } from './renderer-version.js';

export const LANDSCAPE_REVISION = 't1seo/civilization-terrain';

export function settingsForRenderer(
  settings: ResolvedRenderSettings,
  renderer: RendererVersion,
): ResolvedRenderSettings {
  return renderer === 'classic'
    ? resolveRenderSettings({ terrainMode: 'calendar' }, settings)
    : settings;
}

export function workflowVersion(settings: ResolvedRenderSettings, renderer: RendererVersion) {
  return renderer === 'current' && settings.terrainMode === 'landscape'
    ? {
        label: 'Current · landscape',
        revision: LANDSCAPE_REVISION,
        description: `Landscape preview branch ${LANDSCAPE_REVISION}; it must be pushed with its built Action files before this workflow can run on GitHub. This local preview does not publish anything.`,
      }
    : RENDERER_VERSIONS[renderer];
}
