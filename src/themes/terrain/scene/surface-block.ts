import { svgNumber } from '../../../core/svg.js';
import { hash } from '../../../utils/math.js';
import type { IsoCell } from './projection.js';
import { THH, THW } from './projection.js';

const TEXTURES = {
  soil: 'M-3,-.4l.8,.2m2.4,-1.1l.7,.1m-.9,2l1,.1',
  grass: 'M-3,.1l-.5,-.7m.5,.7l.3,-.8m3.4,1l-.2,-.7m.2,.7l.5,-.5',
  stone: 'M-3,-.2l.8,-.4 .9,.2 -.7,.5zm3.5,.5l.7,-.3 .9,.2 -.8,.4z',
  ice: 'M-4,0l2,-.6 1,.5 2,-.9m-2,.9l1,1',
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
  return (
    `<path data-surface="${material}" transform="translate(${svgNumber(cell.isoX)} ${svgNumber(cell.isoY)})"` +
    ` d="${TEXTURES[material]}" fill="none" stroke="${material === 'ice' ? '#fff' : cell.colors.left}"` +
    ` stroke-width=".35" stroke-linecap="round" opacity=".35"/>`
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
    `<polygon points="${top}" fill="${colors.top}" stroke="${colors.top}" stroke-width="0.3"/>` +
    detail
  );
}
