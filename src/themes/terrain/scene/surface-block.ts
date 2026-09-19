import { svgNumber } from '../../../core/svg.js';
import { hash } from '../../../utils/math.js';
import type { IsoCell } from './projection.js';
import { THH, THW } from './projection.js';

const TEXTURES = {
  soil: [
    'M-4 .2Q-3-.5-1.7 0M.1 1Q1 .4 2.4 .8M1.2-1.2L2-1.1',
    'M-3-.5Q-1.8-1.1-.8-.5M-1.3 1Q-.2 .5 .9 1M2.1-.1L3.3 .2',
    'M-4 .1Q-2.9 .6-1.8 .1M-.5-.9Q.7-1.4 1.7-.8M1.8 .9L2.8 .6',
  ],
  grass: [
    'M-3 .5Q-3.7 0-3.4-.7M-3 .5Q-2.7-.2-2-.4M1.5 .7Q.8-.2 1.3-.8M1.5 .7L2.2 .1',
    'M-2.4 .2Q-3-.4-2.6-1M-2.4 .2L-1.5-.5M.4 1Q.1 .3 .5-.3M.4 1Q1 .2 1.8 .3',
    'M-3.2 .6Q-3.4-.2-2.9-.6M-3.2 .6L-2.3 .1M1 .4Q.3-.3 .8-1M1 .4Q1.8-.6 2.6-.4',
  ],
  stone: [
    'M-4 .2L-3.4-.6-2-.5-1.7 .1-2.8 .6ZM.5 1L1.1 .2 2.6 .4 2.1 1.1ZM1.5-1.3L3-.9',
    'M-3.6 0L-2.8-.7-1.5-.2-2 .5ZM.3-.6L1.3-1.1 2.8-.5 1.8 .1ZM-.3 1.2L1 1.5',
    'M-3.8 .2L-2.4-.4-1 .1-2.1 .7ZM.6 .8L1.4 .1 3 .2 2.5 1ZM-.5-1.4L.7-1',
  ],
  ice: [
    'M-4 .1L-2.4-.6-.7-.3 1.2-1.1 3.6-.4M-.7-.3L.2 1.4M1.2-1.1L1.1-1.7',
    'M-3.7-.3L-2 .2-.2-.6 1.5 .3 3.7-.1M-2 .2L-1.3 1.2M1.5 .3L1.2 1.5',
    'M-4 .2L-2.4-.2-.7 .5 1-.3 3.3 .1M-.7 .5L-.4 1.7M1-.3L.6-1.5',
  ],
} as const;

function surfaceTexture(cell: IsoCell): string {
  const identity = hash(cell.date ?? `${cell.week},${cell.day}`);
  if (identity % 8 !== 0) return '';
  const material =
    cell.level100 < 9
      ? 'soil'
      : cell.level100 <= 22
        ? 'ice'
        : cell.level100 >= 80
          ? 'stone'
          : 'grass';
  const [first, second, third] = TEXTURES[material];
  const variant = (identity >>> 3) % 3;
  const texture = variant === 0 ? first : variant === 1 ? second : third;
  return (
    `<path data-surface="${material}" transform="translate(${svgNumber(cell.isoX)} ${svgNumber(cell.isoY)})"` +
    ` d="${texture}" fill="none" stroke="${material === 'ice' ? '#fff' : cell.colors.left}"` +
    ` stroke-width=".35" stroke-linecap="round" opacity=".35"/>`
  );
}

function sideStrata(cell: IsoCell): string {
  if (cell.height < 10) return '';
  const identity = hash(cell.date ?? `${cell.week},${cell.day}`);
  if (identity % 6 !== 0) return '';
  const depth = cell.height * (identity & 32 ? 0.55 : 0.4);
  const y = (offset: number): string => svgNumber(depth + offset);
  return (
    `<path data-strata="${cell.level100 >= 80 ? 'stone' : 'soil'}" transform="translate(${svgNumber(cell.isoX)} ${svgNumber(cell.isoY)})"` +
    ` d="M-6.4 ${y(0)}L-4.2 ${y(0.7)}-3 ${y(0.6)}-1.4 ${y(1.8)}M1.4 ${y(2.1)}L3.3 ${y(1.1)} 4.6 ${y(1.3)} 6.4 ${y(0.4)}"` +
    ` fill="none" stroke="${cell.colors.top}" stroke-width=".4" stroke-linejoin="round" opacity=".34"/>`
  );
}

export function renderSurfaceBlock(cell: IsoCell, water: boolean): string {
  const { isoX: x, isoY: y, height, colors } = cell;
  const point = (dx: number, dy: number): string => `${svgNumber(x + dx)},${svgNumber(y + dy)}`;
  const top = [point(0, -THH), point(THW, 0), point(0, THH), point(-THW, 0)].join(' ');
  const sides = height
    ? `<polygon points="${[point(-THW, 0), point(0, THH), point(0, THH + height), point(-THW, height)].join(' ')}" fill="${colors.left}"/>` +
      `<polygon points="${[point(THW, 0), point(0, THH), point(0, THH + height), point(THW, height)].join(' ')}" fill="${colors.right}"/>`
    : '';
  const detail = water
    ? `<path transform="translate(${svgNumber(x)} ${svgNumber(y)})" d="M-6,0Q-3,-2 0,-2.7L5,-.2Q1,-1.1 -2,-.5Z" fill="#d2e9dc" opacity="${cell.level100 <= 14 ? '.14' : '.08'}"/>`
    : surfaceTexture(cell);
  return (
    sides +
    (water ? '' : sideStrata(cell)) +
    `<polygon points="${top}" fill="${colors.top}" stroke="${colors.top}" stroke-width="0.3"/>` +
    detail
  );
}
