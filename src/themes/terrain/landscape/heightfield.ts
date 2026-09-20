import { clamp } from '../../../utils/math.js';
import { createNoise2D } from '../../../utils/noise.js';
import type { LandscapeBiome, LandscapeOptions } from './types.js';

export interface LandscapeHeightField {
  readonly elevation: (x: number, z: number) => number;
  readonly moisture: (x: number, z: number) => number;
}

type RidgeNode = readonly [number, number, number];
const ellipse = (x: number, z: number, cx: number, cz: number, rx: number, rz: number): number =>
  Math.hypot((x - cx) / rx, (z - cz) / rz);
const bell = (x: number, z: number, cx: number, cz: number, rx: number, rz: number): number =>
  Math.exp(-(ellipse(x, z, cx, cz, rx, rz) ** 2));

function ridge(x: number, z: number, nodes: readonly RidgeNode[], width: number): number {
  let height = 0;
  for (let index = 1; index < nodes.length; index++) {
    const [ax, az, ah] = nodes[index - 1],
      [bx, bz, bh] = nodes[index];
    const dx = bx - ax,
      dz = bz - az;
    const t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz), 0, 1);
    const distance = Math.hypot(x - ax - dx * t, z - az - dz * t);
    const peak = ah + (bh - ah) * t;
    height = Math.max(height, peak * Math.max(0, 1 - distance / width) ** 1.35);
  }
  return height;
}

function landform(
  x: number,
  z: number,
  options: LandscapeOptions,
  noise: number,
): readonly [number, number] {
  switch (options.layout) {
    case 'island': {
      const shore =
        Math.max(1 - ellipse(x, z, -3, -1, 27, 19.5), 0.85 - ellipse(x, z, 14, 8, 15, 12)) -
        0.24 * bell(x, z, -17, 12, 7, 6) -
        0.2 * bell(x, z, 20, -5, 7, 5) +
        noise;
      const mountains = ridge(
        x,
        z,
        [
          [-20, -5, 3.8],
          [-14, -9, 7],
          [-8, -11, 8.8],
          [-1, -8, 5.5],
          [6, -11, 7],
          [14, -6, 3.8],
        ],
        6.4,
      );
      return [shore, mountains];
    }
    case 'archipelago': {
      const shore =
        Math.max(
          1 - ellipse(x, z, -15, -6, 14, 12.5),
          1 - ellipse(x, z, 14, -7, 12, 10.5),
          1 - ellipse(x, z, 7, 15, 10.5, 7),
          1 - ellipse(x, z, -20, 15.5, 6, 4.8),
        ) +
        noise * 0.55;
      const mountains = Math.max(
        ridge(
          x,
          z,
          [
            [-23, -8, 3],
            [-17, -11, 8],
            [-9, -8, 5],
          ],
          5.2,
        ),
        ridge(
          x,
          z,
          [
            [7, -10, 3.5],
            [15, -12, 7.4],
            [22, -6, 3],
          ],
          4.6,
        ),
        ridge(
          x,
          z,
          [
            [0, 13, 2.7],
            [7, 12, 4.5],
            [14, 14, 2],
          ],
          3.7,
        ),
      );
      return [shore, mountains];
    }
    case 'valley': {
      const shore = 1 - ellipse(x, z, -1, 0, 29, 21) + noise * 0.65;
      const mountains = Math.max(
        ridge(
          x,
          z,
          [
            [-15, 10, 2.2],
            [-15, 2, 5.7],
            [-12, -8, 8.6],
            [-7, -15, 6],
          ],
          6,
        ),
        ridge(
          x,
          z,
          [
            [14, 13, 2],
            [15, 2, 5],
            [12, -10, 7.2],
            [5, -15, 4.6],
          ],
          5.5,
        ),
      );
      return [shore, mountains];
    }
    default: {
      const unreachable: never = options.layout;
      return unreachable;
    }
  }
}

export function createHeightField(options: LandscapeOptions): LandscapeHeightField {
  const noise = createNoise2D(options.seed >>> 0);
  const rain = createNoise2D((options.seed + 731) >>> 0);
  return {
    elevation: (x, z) => {
      const coastNoise =
        noise(x * 0.08, z * 0.08) * (0.075 + options.roughness * 0.11) +
        noise(x * 0.22 + 81, z * 0.22 - 29) * options.roughness * 0.045;
      const [shore, mountains] = landform(x, z, options, coastNoise);
      if (shore <= 0) return shore * 5 * options.relief;
      const coastFade = clamp(shore * 6, 0, 1);
      const channel = 2 + Math.sin(z * 0.2) * 2.1;
      const valley = Math.exp(-(((x - channel) / 3.2) ** 2));
      const plain = 0.72 + (17 - z) * 0.024 + Math.min(shore, 0.7) * 0.15;
      const mountainRelief = mountains * (1 - valley * 0.7);
      const detail =
        noise(x * 0.38, z * 0.38) * options.roughness * Math.min(0.65, mountains * 0.16);
      return (
        Math.max(0.015, (plain - valley * 0.38 + mountainRelief + detail) * coastFade) *
        options.relief
      );
    },
    moisture: (x, z) =>
      clamp(
        0.47 +
          rain(x * 0.055, z * 0.055) * 0.17 +
          bell(x, z, -15, 1, 12, 15) * 0.19 -
          bell(x, z, 16, 8, 14, 16) * 0.29,
        0.05,
        0.95,
      ),
  };
}

export function classifyBiome(
  elevation: number,
  slope: number,
  moisture: number,
  relief: number,
): LandscapeBiome {
  const height = elevation / relief;
  if (height < 0.16) return 'sand';
  if (height > 6.9) return 'snow';
  if (height > 4.1 || slope > relief * 1.05) return 'rock';
  if (height < 1.9 && slope < relief * 0.22 && moisture > 0.72) return 'wetland';
  if (moisture < 0.34) return 'dry';
  if (moisture > 0.55) return 'forest';
  return 'meadow';
}
