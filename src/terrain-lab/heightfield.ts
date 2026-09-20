import { clamp } from '../utils/math.js';
import { createNoise2D } from '../utils/noise.js';
import type { Biome, TerrainOptions } from './types.js';

export type HeightField = {
  readonly elevation: (x: number, z: number) => number;
  readonly moisture: (x: number, z: number) => number;
};

const ellipse = (x: number, z: number, cx: number, cz: number, rx: number, rz: number): number =>
  Math.hypot((x - cx) / rx, (z - cz) / rz);
const hill = (x: number, z: number, cx: number, cz: number, rx: number, rz: number): number =>
  Math.exp(-(ellipse(x, z, cx, cz, rx, rz) ** 2));

function landform(
  x: number,
  z: number,
  options: TerrainOptions,
  coastalNoise: number,
): readonly [number, number] {
  switch (options.layout) {
    case 'island': {
      const bend = 2.8 * Math.sin(z / 7) + 1.2 * Math.sin(z / 3.8);
      const shore = 1 - ellipse(x + bend, z, -1, 0, 27, 18.5) + coastalNoise;
      const peaks = hill(x, z, -8, -3, 8, 7) + 0.64 * hill(x, z, 7, 3, 7, 5);
      return [shore, peaks];
    }
    case 'archipelago': {
      const islands = [
        1 - ellipse(x, z, -15, -5, 12.5, 12),
        1 - ellipse(x, z, 14, -7, 12, 10),
        1 - ellipse(x, z, 4, 14, 10, 7),
        1 - ellipse(x, z, -21, 14, 6, 4.8),
      ];
      const peaks = Math.max(
        hill(x, z, -17, -7, 5.5, 5),
        0.86 * hill(x, z, 16, -9, 5, 4.5),
        0.68 * hill(x, z, 2, 14, 4.5, 3.5),
        0.4 * hill(x, z, -22, 14, 3, 2.5),
      );
      return [Math.max(...islands) + coastalNoise * 0.8, peaks];
    }
    case 'valley': {
      const channel = 3.7 * Math.sin(z / 6.8) - 1.5;
      const shore = 1 - ellipse(x, z, 0, 0, 28.5, 20.5) + coastalNoise * 0.6;
      const ridges =
        hill(x, z, channel - 12, -2, 5.5, 16) + 0.88 * hill(x, z, channel + 11, 1, 5, 15);
      return [shore, ridges];
    }
    default: {
      const unreachable: never = options.layout;
      return unreachable;
    }
  }
}

export function createHeightField(options: TerrainOptions): HeightField {
  const noise = createNoise2D(options.seed >>> 0);
  const rain = createNoise2D((options.seed + 731) >>> 0);
  return {
    elevation: (x, z) => {
      const shoreNoise =
        noise(x * 0.085, z * 0.085) * (0.07 + options.roughness * 0.12) +
        noise(x * 0.22 + 91, z * 0.22 - 33) * options.roughness * 0.045;
      const [shore, peaks] = landform(x, z, options, shoreNoise);
      if (shore <= 0) return shore * 4;
      const coastFade = clamp(shore * 5, 0, 1);
      const detail = noise(x * 0.3, z * 0.3) * options.roughness * 0.48;
      const elevation = shore * 1.3 + (peaks * 5.2 + detail) * coastFade;
      return clamp(elevation * options.relief, 0.025, 11.5);
    },
    moisture: (x, z) => clamp(0.5 + rain(x * 0.075, z * 0.075) * 0.34, 0, 1),
  };
}

export function classifyBiome(elevation: number, slope: number, moisture: number): Biome {
  if (elevation < 0.38) return 'sand';
  if (elevation > 7.4) return 'snow';
  if (elevation > 4.6 || slope > 1.12) return 'rock';
  if (moisture > 0.53 && elevation > 0.7) return 'forest';
  return 'meadow';
}
