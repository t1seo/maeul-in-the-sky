import type { ColorMode } from '../../../core/types.js';
import type { LandscapeBiome } from './types.js';

export interface LandscapePalette {
  readonly sky: readonly [string, string];
  readonly text: string;
  readonly muted: string;
  readonly rule: string;
  readonly accent: string;
  readonly ocean: string;
  readonly foam: string;
  readonly water: string;
  readonly waterLight: string;
  readonly bank: string;
  readonly cliff: string;
  readonly soil: string;
  readonly road: string;
  readonly roadEdge: string;
  readonly paving: string;
  readonly biomes: Readonly<Record<LandscapeBiome, string>>;
}

const PALETTES: Readonly<Record<ColorMode, LandscapePalette>> = {
  light: {
    sky: ['#edf1e9', '#dbe6dd'],
    text: '#2d423c',
    muted: '#67796d',
    rule: '#c0cdbd',
    accent: '#90703b',
    ocean: '#84bcb1',
    foam: '#d4e5d7',
    water: '#4f9ba0',
    waterLight: '#b9e0cf',
    bank: '#82966c',
    cliff: '#746f59',
    soil: '#a89773',
    road: '#d6c59b',
    roadEdge: '#9b9874',
    paving: '#bebaa1',
    biomes: {
      sand: '#cfc196',
      meadow: '#a5b879',
      forest: '#829b64',
      rock: '#929788',
      snow: '#e2e9dc',
      wetland: '#87a580',
      dry: '#b7ad78',
    },
  },
  dark: {
    sky: ['#14252b', '#253c3d'],
    text: '#e4e8d6',
    muted: '#9cad9e',
    rule: '#425a51',
    accent: '#d6b575',
    ocean: '#315d60',
    foam: '#618884',
    water: '#438b93',
    waterLight: '#93c9c1',
    bank: '#536e56',
    cliff: '#394d49',
    soil: '#69715b',
    road: '#a19b73',
    roadEdge: '#536952',
    paving: '#8d9580',
    biomes: {
      sand: '#9b9b73',
      meadow: '#688c65',
      forest: '#52775b',
      rock: '#798a7f',
      snow: '#b4cec7',
      wetland: '#527d6b',
      dry: '#85916a',
    },
  },
};

export function landscapePalette(mode: ColorMode): LandscapePalette {
  return PALETTES[mode];
}

export function shade(hex: string, multiplier: number): string {
  const channels = [1, 3, 5].map((offset) =>
    Math.max(
      0,
      Math.min(255, Math.round(parseInt(hex.slice(offset, offset + 2), 16) * multiplier)),
    ),
  );
  return `rgb(${channels.join(',')})`;
}
