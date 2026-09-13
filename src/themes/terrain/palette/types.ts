import type { AssetColors } from './asset-colors.js';

/** Colors for one elevation level: top face, left face, right face */
export interface ElevationColors {
  top: string;
  left: string;
  right: string;
}

/** Cloud rendering properties */
export interface CloudColors {
  fill: string;
  stroke: string;
  opacity: number;
}

/** 100-level terrain palette with smooth interpolation */
export interface TerrainPalette100 {
  getElevation(level: number): ElevationColors;
  getHeight(level: number): number;
  text: { primary: string; secondary: string; accent: string };
  bg: { subtle: string };
  cloud: CloudColors;
  assets: AssetColors;
  /** Pre-computed array for backward compatibility (10 sampled elevations) */
  elevations: ElevationColors[];
  /** Pre-computed array for backward compatibility (10 sampled heights) */
  heights: number[];
}

/** @deprecated Use getTerrainPalette100 instead */
export interface TerrainPalette {
  elevations: ElevationColors[];
  heights: number[];
  text: { primary: string; secondary: string; accent: string };
  bg: { subtle: string };
  cloud: string;
  assets: AssetColors;
}
