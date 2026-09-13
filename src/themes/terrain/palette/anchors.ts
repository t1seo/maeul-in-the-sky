export type RGB = readonly [number, number, number];
export interface ColorAnchor {
  readonly level: number;
  readonly rgb: RGB;
}
export interface HeightAnchor {
  readonly level: number;
  readonly height: number;
}

// ── Dark Mode Anchors ────────────────────────────────────────

export const DARK_COLOR_ANCHORS: readonly ColorAnchor[] = [
  { level: 0, rgb: [160, 130, 90] }, // Desert sand
  { level: 4, rgb: [140, 120, 85] }, // Dry earth
  { level: 8, rgb: [100, 115, 100] }, // Scrubland
  { level: 12, rgb: [40, 80, 130] }, // Shallow water / oasis
  { level: 18, rgb: [30, 70, 120] }, // Deeper water
  { level: 24, rgb: [80, 130, 95] }, // Wetland shore
  { level: 30, rgb: [130, 160, 90] }, // Grassland
  { level: 40, rgb: [90, 145, 60] }, // Lush grass
  { level: 52, rgb: [55, 120, 42] }, // Forest
  { level: 65, rgb: [45, 105, 38] }, // Dense forest
  { level: 75, rgb: [90, 140, 55] }, // Rich green farmland
  { level: 85, rgb: [80, 125, 50] }, // Village green
  { level: 93, rgb: [70, 110, 52] }, // Town with parks
  { level: 99, rgb: [65, 100, 55] }, // Lush city
];

export const DARK_HEIGHT_ANCHORS: readonly HeightAnchor[] = [
  { level: 0, height: 0 },
  { level: 8, height: 0 },
  { level: 12, height: 0 }, // Water: flat
  { level: 18, height: 0 },
  { level: 24, height: 1 },
  { level: 30, height: 3 },
  { level: 40, height: 5 },
  { level: 52, height: 8 },
  { level: 65, height: 11 },
  { level: 75, height: 14 },
  { level: 85, height: 18 },
  { level: 93, height: 21 },
  { level: 99, height: 24 },
];

// ── Light Mode Anchors ───────────────────────────────────────

export const LIGHT_COLOR_ANCHORS: readonly ColorAnchor[] = [
  { level: 0, rgb: [195, 170, 130] }, // Desert sand
  { level: 4, rgb: [180, 158, 120] }, // Dry earth
  { level: 8, rgb: [145, 155, 135] }, // Scrubland
  { level: 12, rgb: [100, 160, 210] }, // Shallow water / oasis
  { level: 18, rgb: [85, 148, 200] }, // Deeper water
  { level: 24, rgb: [120, 168, 140] }, // Wetland shore
  { level: 30, rgb: [160, 195, 115] }, // Grassland
  { level: 40, rgb: [115, 175, 80] }, // Lush grass
  { level: 52, rgb: [75, 150, 58] }, // Forest
  { level: 65, rgb: [65, 135, 52] }, // Dense forest
  { level: 75, rgb: [115, 170, 75] }, // Rich green farmland
  { level: 85, rgb: [100, 155, 68] }, // Village green
  { level: 93, rgb: [90, 140, 65] }, // Town with parks
  { level: 99, rgb: [80, 128, 62] }, // Lush city
];
