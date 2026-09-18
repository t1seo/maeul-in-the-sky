import type { VillagePreset } from './presets.js';

export type MotionMode = 'full' | 'subtle' | 'off';
export type TerrainLayout = 'banner' | 'card';
export type VillageStyle = 'classic' | 'korean';
export type ArtStyle = 'miniature' | 'pixel';
export type Hemisphere = 'north' | 'south';
export type NormalizationOptions =
  { readonly kind: 'relative' } | { readonly kind: 'fixed'; readonly maxCount: number };

export type ResolvedRenderSettings = {
  readonly preset: VillagePreset;
  readonly density: number;
  readonly title: string;
  readonly hemisphere: Hemisphere;
  readonly motion: MotionMode;
  readonly layout: TerrainLayout;
  readonly style: VillageStyle;
  readonly artStyle: ArtStyle;
  readonly normalization: NormalizationOptions;
  readonly layoutSeed?: string;
};

export type RenderSettingsInput = Omit<Partial<ResolvedRenderSettings>, 'style'> & {
  readonly style?: VillageStyle;
  readonly villageStyle?: VillageStyle;
};

export type NormalizationSummary = {
  readonly kind: 'relative' | 'fixed';
  readonly maxCount: number;
  readonly source: 'relative-p90' | 'explicit-fixed' | 'shared-p90';
};
