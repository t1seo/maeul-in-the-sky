import type { ThemeOptions } from '../../../core/types.js';
import type { VillagePreset } from '../../../core/presets.js';

export type TerrainRenderOptions = Partial<ThemeOptions> & {
  readonly preset?: VillagePreset;
  readonly namespace?: string;
};

export type TerrainSceneRenderOptions = Pick<
  TerrainRenderOptions,
  'width' | 'height' | 'title' | 'motion' | 'layout' | 'namespace' | 'artStyle'
>;
