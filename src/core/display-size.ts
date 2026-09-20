import type { ResolvedRenderSettings, TerrainLayout, TerrainMode } from './render-options.js';

export type DisplaySize = { readonly width: number; readonly height: number };

const sizes = {
  calendar: { banner: { width: 840, height: 240 }, card: { width: 420, height: 360 } },
  landscape: { banner: { width: 1200, height: 840 }, card: { width: 840, height: 840 } },
} as const satisfies Record<TerrainMode, Record<TerrainLayout, DisplaySize>>;

export function resolveDisplaySize(
  settings: Pick<ResolvedRenderSettings, 'layout' | 'terrainMode'>,
): DisplaySize {
  return sizes[settings.terrainMode ?? 'calendar'][settings.layout];
}
