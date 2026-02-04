import type { ColorMode } from '../../core/types.js';
import { lerp, clamp } from '../../utils/math.js';

/** RGB color tuple */
type RGB = [number, number, number];

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

/** Colors used for terrain assets */
export interface AssetColors {
  trunk: string;
  pine: string;
  leaf: string;
  bush: string;
  roofA: string;
  roofB: string;
  wall: string;
  wallShade: string;
  church: string;
  fence: string;
  wheat: string;
  sheep: string;
  sheepHead: string;
  cow: string;
  cowSpot: string;
  chicken: string;
  whale: string;
  whaleBelly: string;
  boat: string;
  sail: string;
  fish: string;
  flag: string;
  windmill: string;
  windBlade: string;
  well: string;
  chimney: string;
  path: string;
  water: string;
  waterLight: string;
  // New asset colors for 38-type expansion
  deer: string;
  horse: string;
  flower: string;
  flowerCenter: string;
  mushroom: string;
  mushroomCap: string;
  rock: string;
  boulder: string;
  palm: string;
  willow: string;
  seagull: string;
  dock: string;
  tent: string;
  tentStripe: string;
  hut: string;
  market: string;
  marketAwning: string;
  inn: string;
  innSign: string;
  blacksmith: string;
  anvil: string;
  castle: string;
  castleRoof: string;
  tower: string;
  bridge: string;
  cart: string;
  barrel: string;
  torch: string;
  torchFlame: string;
  cobble: string;
  smoke: string;
  bird: string;
  scarecrow: string;
  scarecrowHat: string;
  stump: string;
  riverOverlay: string;
  pondOverlay: string;
  reeds: string;
  fountain: string;
  fountainWater: string;
  canal: string;
  gardenTree: string;
  ricePaddy: string;
  ricePaddyWater: string;
  // New asset colors for 118-type expansion
  jellyfish: string;
  coral: string;
  turtle: string;
  buoy: string;
  lighthouse: string;
  crab: string;
  driftwood: string;
  sandcastle: string;
  tidePools: string;
  heron: string;
  shellfish: string;
  cattail: string;
  frog: string;
  lily: string;
  rabbit: string;
  fox: string;
  butterfly: string;
  butterflyWing: string;
  beehive: string;
  wildflower: string;
  tallGrass: string;
  birchBark: string;
  haybale: string;
  owl: string;
  squirrel: string;
  moss: string;
  fern: string;
  deadTree: string;
  log: string;
  berryBush: string;
  berry: string;
  spiderWeb: string;
  silo: string;
  pig: string;
  trough: string;
  haystack: string;
  orchard: string;
  orchardFruit: string;
  beeFarm: string;
  pumpkin: string;
  tavern: string;
  tavernSign: string;
  bakery: string;
  stable: string;
  gardenFence: string;
  laundry: string;
  doghouse: string;
  shrine: string;
  wagon: string;
  cathedral: string;
  cathedralWindow: string;
  library: string;
  clocktower: string;
  clockFace: string;
  statue: string;
  parkBench: string;
  warehouse: string;
  gatehouse: string;
  manor: string;
  manorGarden: string;
  signpost: string;
  lantern: string;
  lanternGlow: string;
  woodpile: string;
  puddle: string;
  campfire: string;
  campfireFlame: string;
}

/** A color anchor point for interpolation */
interface ColorAnchor {
  level: number;
  rgb: RGB;
}

/** A height anchor point for interpolation */
interface HeightAnchor {
  level: number;
  height: number;
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

// ── Interpolation Engine ─────────────────────────────────────

function interpolateRGB(anchors: ColorAnchor[], level: number): RGB {
  const l = clamp(level, 0, 99);
  // Find surrounding anchors
  let lower = anchors[0];
  let upper = anchors[anchors.length - 1];
  for (let i = 0; i < anchors.length - 1; i++) {
    if (l >= anchors[i].level && l <= anchors[i + 1].level) {
      lower = anchors[i];
      upper = anchors[i + 1];
      break;
    }
  }
  if (lower.level === upper.level) return lower.rgb;
  const t = (l - lower.level) / (upper.level - lower.level);
  return [
    Math.round(lerp(lower.rgb[0], upper.rgb[0], t)),
    Math.round(lerp(lower.rgb[1], upper.rgb[1], t)),
    Math.round(lerp(lower.rgb[2], upper.rgb[2], t)),
  ];
}

function interpolateHeight(anchors: HeightAnchor[], level: number): number {
  const l = clamp(level, 0, 99);
  let lower = anchors[0];
  let upper = anchors[anchors.length - 1];
  for (let i = 0; i < anchors.length - 1; i++) {
    if (l >= anchors[i].level && l <= anchors[i + 1].level) {
      lower = anchors[i];
      upper = anchors[i + 1];
      break;
    }
  }
  if (lower.level === upper.level) return lower.height;
  const t = (l - lower.level) / (upper.level - lower.level);
  return Math.round(lerp(lower.height, upper.height, t));
}

function darken(rgb: RGB, factor: number): string {
  return `rgb(${Math.round(rgb[0] * factor)},${Math.round(rgb[1] * factor)},${Math.round(rgb[2] * factor)})`;
}

function rgbToHex(rgb: RGB): string {
  return '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');
}

function makeElevation(rgb: RGB): ElevationColors {
  return {
    top: rgbToHex(rgb),
    left: darken(rgb, 0.75),
    right: darken(rgb, 0.60),
  };
}

// ── Dark Mode Anchors ────────────────────────────────────────

const DARK_COLOR_ANCHORS: ColorAnchor[] = [
  { level: 0,  rgb: [160, 130, 90] },     // Desert sand
  { level: 4,  rgb: [140, 120, 85] },     // Dry earth
  { level: 8,  rgb: [100, 115, 100] },    // Scrubland
  { level: 12, rgb: [40, 80, 130] },      // Shallow water / oasis
  { level: 18, rgb: [30, 70, 120] },      // Deeper water
  { level: 24, rgb: [80, 130, 95] },      // Wetland shore
  { level: 30, rgb: [130, 160, 90] },     // Grassland
  { level: 40, rgb: [90, 145, 60] },      // Lush grass
  { level: 52, rgb: [55, 120, 42] },      // Forest
  { level: 65, rgb: [45, 105, 38] },      // Dense forest
  { level: 75, rgb: [90, 140, 55] },      // Rich green farmland
  { level: 85, rgb: [80, 125, 50] },      // Village green
  { level: 93, rgb: [70, 110, 52] },      // Town with parks
  { level: 99, rgb: [65, 100, 55] },      // Lush city
];

const DARK_HEIGHT_ANCHORS: HeightAnchor[] = [
  { level: 0,  height: 0 },
  { level: 8,  height: 0 },
  { level: 12, height: 0 },    // Water: flat
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

const LIGHT_COLOR_ANCHORS: ColorAnchor[] = [
  { level: 0,  rgb: [195, 170, 130] },    // Desert sand
  { level: 4,  rgb: [180, 158, 120] },    // Dry earth
  { level: 8,  rgb: [145, 155, 135] },    // Scrubland
  { level: 12, rgb: [100, 160, 210] },    // Shallow water / oasis
  { level: 18, rgb: [85, 148, 200] },     // Deeper water
  { level: 24, rgb: [120, 168, 140] },    // Wetland shore
  { level: 30, rgb: [160, 195, 115] },    // Grassland
  { level: 40, rgb: [115, 175, 80] },     // Lush grass
  { level: 52, rgb: [75, 150, 58] },      // Forest
  { level: 65, rgb: [65, 135, 52] },      // Dense forest
  { level: 75, rgb: [115, 170, 75] },     // Rich green farmland
  { level: 85, rgb: [100, 155, 68] },     // Village green
  { level: 93, rgb: [90, 140, 65] },      // Town with parks
  { level: 99, rgb: [80, 128, 62] },      // Lush city
];

const LIGHT_HEIGHT_ANCHORS: HeightAnchor[] = DARK_HEIGHT_ANCHORS;

// ── Asset Colors ─────────────────────────────────────────────

const DARK_ASSETS: AssetColors = {
  trunk: '#6b4226',
  pine: '#2a6e1e',
  leaf: '#3d8c2a',
  bush: '#357a22',
  roofA: '#c45435',
  roofB: '#d4924a',
  wall: '#d4c8a0',
  wallShade: '#b0a078',
  church: '#e0d8c0',
  fence: '#9e8a60',
  wheat: '#d4b840',
  sheep: '#e8e8e0',
  sheepHead: '#333',
  cow: '#8b5e3c',
  cowSpot: '#f5f0e0',
  chicken: '#d4a030',
  whale: '#4a7a9e',
  whaleBelly: '#8ab4c8',
  boat: '#8b6840',
  sail: '#e8e0d0',
  fish: '#70b0c8',
  flag: '#cc3333',
  windmill: '#c8b888',
  windBlade: '#d8d0b8',
  well: '#7a6a4a',
  chimney: '#8a6a4a',
  path: '#a09068',
  water: '#3a6a9e',
  waterLight: '#5a90be',
  deer: '#8a6030',
  horse: '#6e4422',
  flower: '#e06080',
  flowerCenter: '#f0d040',
  mushroom: '#e8dcc8',
  mushroomCap: '#c44030',
  rock: '#808080',
  boulder: '#6a6a6a',
  palm: '#4a8828',
  willow: '#558838',
  seagull: '#e0e0e0',
  dock: '#7a6040',
  tent: '#c8b888',
  tentStripe: '#cc4444',
  hut: '#a08860',
  market: '#d8c898',
  marketAwning: '#cc5533',
  inn: '#c8a878',
  innSign: '#d4a040',
  blacksmith: '#555555',
  anvil: '#444444',
  castle: '#a0a0a0',
  castleRoof: '#606080',
  tower: '#909090',
  bridge: '#8a7a5a',
  cart: '#8a6a40',
  barrel: '#7a5a30',
  torch: '#6a5030',
  torchFlame: '#ff9922',
  cobble: '#888878',
  smoke: 'rgba(180,180,180,0.4)',
  bird: '#444444',
  scarecrow: '#8a7040',
  scarecrowHat: '#5a4020',
  stump: '#6b4a26',
  riverOverlay: 'rgba(35,85,160,0.60)',
  pondOverlay: 'rgba(25,75,150,0.65)',
  reeds: '#6a8838',
  fountain: '#909090',
  fountainWater: '#70a8d0',
  canal: '#7a7a6a',
  gardenTree: '#4a9a3a',
  ricePaddy: '#8aaa48',
  ricePaddyWater: '#4a88b0',
  // New 118-type expansion colors
  jellyfish: '#9a70c0',
  coral: '#d06858',
  turtle: '#5a8848',
  buoy: '#cc4444',
  lighthouse: '#d8d0b8',
  crab: '#c06030',
  driftwood: '#8a7050',
  sandcastle: '#d8c890',
  tidePools: '#5a90b0',
  heron: '#a0a8b0',
  shellfish: '#c0a880',
  cattail: '#6a8838',
  frog: '#4a8830',
  lily: '#e088a0',
  rabbit: '#b0a090',
  fox: '#c06a28',
  butterfly: '#d070a0',
  butterflyWing: '#e0a040',
  beehive: '#c0a040',
  wildflower: '#d060d0',
  tallGrass: '#5a9838',
  birchBark: '#e0d8c8',
  haybale: '#c0a848',
  owl: '#8a7050',
  squirrel: '#a06030',
  moss: '#4a7a30',
  fern: '#3a8828',
  deadTree: '#6a5a40',
  log: '#7a5a30',
  berryBush: '#3a7828',
  berry: '#cc3030',
  spiderWeb: 'rgba(200,200,200,0.5)',
  silo: '#a0a0a0',
  pig: '#e0a8a0',
  trough: '#7a6a50',
  haystack: '#c8a838',
  orchard: '#4a8828',
  orchardFruit: '#cc4430',
  beeFarm: '#c8b060',
  pumpkin: '#d07020',
  tavern: '#a08860',
  tavernSign: '#8a6830',
  bakery: '#c8a878',
  stable: '#8a7050',
  gardenFence: '#e0d8c0',
  laundry: '#e0d8e8',
  doghouse: '#8a6030',
  shrine: '#a0a0a8',
  wagon: '#8a6840',
  cathedral: '#c0b8a8',
  cathedralWindow: '#4080c0',
  library: '#b0a088',
  clocktower: '#a0a0a0',
  clockFace: '#e8e0c8',
  statue: '#909098',
  parkBench: '#6a5a40',
  warehouse: '#8a8078',
  gatehouse: '#a09888',
  manor: '#c8b898',
  manorGarden: '#4a8838',
  signpost: '#7a6040',
  lantern: '#6a5a40',
  lanternGlow: '#ffc840',
  woodpile: '#7a5a30',
  puddle: '#5a88b8',
  campfire: '#6a5030',
  campfireFlame: '#ff6622',
};

const LIGHT_ASSETS: AssetColors = {
  trunk: '#7a5030',
  pine: '#358025',
  leaf: '#4a9e35',
  bush: '#40882a',
  roofA: '#d05a3a',
  roofB: '#daa055',
  wall: '#f0e8d0',
  wallShade: '#d0c498',
  church: '#f0e8d8',
  fence: '#b09a68',
  wheat: '#dac040',
  sheep: '#f5f5f0',
  sheepHead: '#444',
  cow: '#9a6e45',
  cowSpot: '#fff',
  chicken: '#daa835',
  whale: '#4580aa',
  whaleBelly: '#90bcd0',
  boat: '#9a7848',
  sail: '#fff',
  fish: '#60a0b8',
  flag: '#dd3838',
  windmill: '#d8c898',
  windBlade: '#eee',
  well: '#8a7a55',
  chimney: '#9a7a55',
  path: '#b8a078',
  water: '#4578aa',
  waterLight: '#65a0cc',
  deer: '#9a7038',
  horse: '#7e5430',
  flower: '#f07090',
  flowerCenter: '#ffe050',
  mushroom: '#f0e8d8',
  mushroomCap: '#d05040',
  rock: '#909090',
  boulder: '#7a7a7a',
  palm: '#55a030',
  willow: '#609840',
  seagull: '#f0f0f0',
  dock: '#8a7050',
  tent: '#d8c898',
  tentStripe: '#dd5555',
  hut: '#b09870',
  market: '#e8d8a8',
  marketAwning: '#dd6644',
  inn: '#d8b888',
  innSign: '#e4b050',
  blacksmith: '#666666',
  anvil: '#555555',
  castle: '#b0b0b0',
  castleRoof: '#707090',
  tower: '#a0a0a0',
  bridge: '#9a8a6a',
  cart: '#9a7a50',
  barrel: '#8a6a38',
  torch: '#7a6038',
  torchFlame: '#ffaa33',
  cobble: '#989888',
  smoke: 'rgba(160,160,160,0.35)',
  bird: '#555555',
  scarecrow: '#9a8050',
  scarecrowHat: '#6a5030',
  stump: '#7a5a30',
  riverOverlay: 'rgba(60,130,210,0.55)',
  pondOverlay: 'rgba(50,120,200,0.60)',
  reeds: '#7a9848',
  fountain: '#a0a0a0',
  fountainWater: '#80b8e0',
  canal: '#8a8a7a',
  gardenTree: '#55aa45',
  ricePaddy: '#9aba58',
  ricePaddyWater: '#5a98c0',
  // New 118-type expansion colors
  jellyfish: '#b080d8',
  coral: '#e07868',
  turtle: '#6a9858',
  buoy: '#dd5555',
  lighthouse: '#f0e8d8',
  crab: '#d07040',
  driftwood: '#9a8060',
  sandcastle: '#e8d8a0',
  tidePools: '#6aa0c0',
  heron: '#b0b8c0',
  shellfish: '#d0b890',
  cattail: '#7a9848',
  frog: '#5a9838',
  lily: '#f098b0',
  rabbit: '#c0b0a0',
  fox: '#d07a38',
  butterfly: '#e080b0',
  butterflyWing: '#f0b050',
  beehive: '#d0b050',
  wildflower: '#e070e0',
  tallGrass: '#6aa848',
  birchBark: '#f0e8d8',
  haybale: '#d0b858',
  owl: '#9a8060',
  squirrel: '#b07040',
  moss: '#5a8a38',
  fern: '#4a9838',
  deadTree: '#7a6a50',
  log: '#8a6a40',
  berryBush: '#4a8838',
  berry: '#dd4040',
  spiderWeb: 'rgba(180,180,180,0.45)',
  silo: '#b0b0b0',
  pig: '#f0b8b0',
  trough: '#8a7a60',
  haystack: '#d8b848',
  orchard: '#55a038',
  orchardFruit: '#dd5540',
  beeFarm: '#d8c070',
  pumpkin: '#e08030',
  tavern: '#b09870',
  tavernSign: '#9a7838',
  bakery: '#d8b888',
  stable: '#9a8060',
  gardenFence: '#f0e8d0',
  laundry: '#f0e8f0',
  doghouse: '#9a7040',
  shrine: '#b0b0b8',
  wagon: '#9a7850',
  cathedral: '#d0c8b8',
  cathedralWindow: '#5090d0',
  library: '#c0b098',
  clocktower: '#b0b0b0',
  clockFace: '#f8f0d8',
  statue: '#a0a0a8',
  parkBench: '#7a6a50',
  warehouse: '#9a9088',
  gatehouse: '#b0a898',
  manor: '#d8c8a8',
  manorGarden: '#55a048',
  signpost: '#8a7050',
  lantern: '#7a6a50',
  lanternGlow: '#ffd850',
  woodpile: '#8a6a40',
  puddle: '#6a98c8',
  campfire: '#7a6038',
  campfireFlame: '#ff7733',
};

// ── Palette Factory ──────────────────────────────────────────

export function getTerrainPalette100(mode: ColorMode): TerrainPalette100 {
  const colorAnchors = mode === 'dark' ? DARK_COLOR_ANCHORS : LIGHT_COLOR_ANCHORS;
  const heightAnchors = mode === 'dark' ? DARK_HEIGHT_ANCHORS : LIGHT_HEIGHT_ANCHORS;

  const getElevation = (level: number): ElevationColors => {
    const rgb = interpolateRGB(colorAnchors, level);
    return makeElevation(rgb);
  };

  const getHeight = (level: number): number => {
    return interpolateHeight(heightAnchors, level);
  };

  // Pre-compute 10 sampled elevations for backward compatibility
  const sampleLevels = [0, 5, 12, 25, 40, 55, 70, 82, 92, 99];
  const elevations = sampleLevels.map(l => getElevation(l));
  const heights = sampleLevels.map(l => getHeight(l));

  return {
    getElevation,
    getHeight,
    elevations,
    heights,
    text: mode === 'dark'
      ? { primary: '#e6edf3', secondary: '#8b949e', accent: '#58a6ff' }
      : { primary: '#1f2328', secondary: '#656d76', accent: '#0969da' },
    bg: { subtle: mode === 'dark' ? '#161b22' : '#f6f8fa' },
    cloud: mode === 'dark'
      ? { fill: 'rgba(200,210,220,0.12)', stroke: 'rgba(200,210,220,0.06)', opacity: 0.8 }
      : { fill: 'rgba(190,205,220,0.35)', stroke: 'rgba(160,175,195,0.30)', opacity: 0.85 },
    assets: mode === 'dark' ? DARK_ASSETS : LIGHT_ASSETS,
  };
}

// ── Legacy API ────────────────────────────────────────────────

/** @deprecated Use getTerrainPalette100 instead */
export interface TerrainPalette {
  elevations: ElevationColors[];
  heights: number[];
  text: { primary: string; secondary: string; accent: string };
  bg: { subtle: string };
  cloud: string;
  assets: AssetColors;
}

/** @deprecated Use getTerrainPalette100 instead */
export function getTerrainPalette(mode: ColorMode): TerrainPalette {
  const p100 = getTerrainPalette100(mode);
  return {
    elevations: p100.elevations,
    heights: p100.heights,
    text: p100.text,
    bg: p100.bg,
    cloud: mode === 'dark' ? 'rgba(200,210,220,0.10)' : 'rgba(255,255,255,0.45)',
    assets: p100.assets,
  };
}
