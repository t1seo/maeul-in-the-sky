import { svgNumber } from '../../../core/svg.js';
import { motionId } from '../../../core/animation.js';
import { hash } from '../../../utils/math.js';
import type { IsoCell } from '../blocks.js';
import type { BiomeContext } from '../biomes.js';

const EDGES = [
  [-1, 0, -8, 0, 0, -3.5],
  [0, -1, 0, -3.5, 8, 0],
  [1, 0, 8, 0, 0, 3.5],
  [0, 1, 0, 3.5, -8, 0],
] as const;

const RIPPLES = [
  'M-4.8,-.2Q-3.5,.65-1.8,.15M-.8,-1.7Q.5,-.9 2.3,-1.2M.7,1.2Q2.2,1.6 3.8,.65',
  'M-4.1,.15Q-2.9,-.6-1.3,-.25M.3,-1.45Q1.6,-.8 3.7,-.55M-1,1.45Q.3,.6 1.9,1',
  'M-5,0Q-3.7,.5-2.4,-.1M-1.7,-1.15Q-.3,-1.85 1.1,-1.25M.2,.75Q2,1.5 4.1,.35',
  'M-3.9,-.65Q-2.7,.05-1.3,-.2M1,-1.45Q2.2,-.9 4,-.55M-1.4,1.2Q.2,1.85 1.7,1.2',
] as const;

const DEPTH = [
  'M-5.8,0Q-2,-2.4 2.1,-1.5Q4.8,-.8 5.4,.2Q1.6,.1-.7,1.5Q-3.5,1.1-5.8,0Z',
  'M-5.4,-.1Q-2.1,-.5-.6,-2Q3.5,-1.3 5.5,.1Q2.9,1.6-.4,1.8Q-4,1.1-5.4,-.1Z',
  'M-5.6,.1Q-3.1,-1.4.1,-1.9Q3.7,-1.1 5.6,-.1Q3,.2 1.2,1.5Q-2.2,1.9-5.6,.1Z',
  'M-5.7,0Q-3.4,-1.8-.6,-1.7Q1.8,-.3 5.5,0Q3.1,1.4.2,1.9Q-1.2,.4-5.7,0Z',
] as const;

export function riverArtwork(cell: IsoCell): {
  readonly ripples: string;
  readonly depthId: string;
} {
  const variant = hash(cell.date ?? `${cell.week},${cell.day}`) % RIPPLES.length;
  return { ripples: RIPPLES[variant], depthId: motionId(`river-pool-${variant}`) };
}

export function renderRiverDepths(): string {
  const id = motionId('river-depth');
  return (
    `<defs><radialGradient id="${id}"><stop stop-color="#16495e" stop-opacity=".5"/><stop offset="1" stop-color="#16495e" stop-opacity="0"/></radialGradient>` +
    DEPTH.map(
      (path, variant) =>
        `<path id="${motionId(`river-pool-${variant}`)}" d="${path}" fill="url(#${id})"/>`,
    ).join('') +
    '</defs>'
  );
}

export function renderRiverBanks(
  cell: IsoCell,
  observed: ReadonlyMap<string, IsoCell>,
  biomes: ReadonlyMap<string, BiomeContext>,
): string {
  const identity = hash(cell.date ?? `${cell.week},${cell.day}`);
  return EDGES.flatMap(([week, day, ax, ay, bx, by], index) => {
    const key = `${cell.week + week},${cell.day + day}`;
    const neighbor = observed.get(key);
    const biome = biomes.get(key);
    if (
      !neighbor ||
      biome?.isRiver ||
      biome?.isPond ||
      (neighbor.level100 >= 9 && neighbor.level100 <= 22)
    )
      return [];
    const depth = 0.2 + ((identity >>> (index * 3)) % 5) * 0.035;
    const point = (t: number, inset = 0): string =>
      `${svgNumber((ax + (bx - ax) * t) * (1 - inset))},${svgNumber((ay + (by - ay) * t) * (1 - inset))}`;
    // Taper before the vertices so diagonal streams keep their shared contacts open.
    const edge = `M${point(0.1)}L${point(0.9)}`;
    const shore = `Q${point(0.77, depth * 0.5)} ${point(0.54, depth)}Q${point(0.28, depth * 1.35)} ${point(0.1)}Z`;
    return [`<path data-river-bank="${index}" d="${edge}${shore}" fill="${neighbor.colors.top}"/>`];
  }).join('');
}
