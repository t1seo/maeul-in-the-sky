import { snapshotToContributionData } from '../browser.js';
import { CURRENT_RENDERER, type DemoRenderer } from './renderers.js';
import type { ResolvedRenderSettings } from '../core/render-options.js';
import type { SnapshotV1 } from '../core/snapshot-types.js';
import type { ColorMode, ThemeOptions } from '../core/types.js';
import type { TerrainRenderResult } from '../core/scene-types.js';
import { resolveDisplaySize } from '../core/display-size.js';
import { settingsForRenderer } from './renderer-settings.js';

export function renderOptions(settings: ResolvedRenderSettings): ThemeOptions {
  return {
    ...settings,
    ...resolveDisplaySize(settings),
  };
}

export function renderSnapshot(
  snapshot: SnapshotV1,
  settings = snapshot.settings,
  namespace = 'village',
  renderer: DemoRenderer = CURRENT_RENDERER,
): TerrainRenderResult {
  const presented =
    snapshot.source.kind === 'sample' && !settings.title.endsWith(' · sample data')
      ? { ...settings, title: `${settings.title.slice(0, 986)} · sample data` }
      : settings;
  return renderer.renderTerrain(snapshotToContributionData(snapshot), {
    ...renderOptions(settingsForRenderer(presented, renderer.version)),
    namespace,
  });
}

export function staticSnapshotSvg(
  snapshot: SnapshotV1,
  mode: ColorMode,
  renderer: DemoRenderer = CURRENT_RENDERER,
): string {
  return renderSnapshot(snapshot, { ...snapshot.settings, motion: 'off' }, 'village', renderer)[
    mode
  ];
}

export function mountSvg(target: HTMLElement, svg: string): SVGSVGElement {
  const parsed = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const root = parsed.documentElement;
  if (!(root instanceof SVGSVGElement))
    throw new DOMException('Generated village is not a valid SVG');
  const imported = document.importNode(root, true);
  target.replaceChildren(imported);
  return imported;
}
