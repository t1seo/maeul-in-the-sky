import type { AssetColors } from '../../palette.js';
import { farmMaterial } from './farm-art-material.js';

export function svgWheat(x: number, y: number, c: AssetColors, v: number): string {
  const straw = farmMaterial(c.wheat, c);
  const soil = `<path d="M-3,.05 0,-1 3,.05 .4,.7Z" fill="${c.gardenSoil}" opacity=".28"/>`;
  if (v === 2) {
    return (
      `<g transform="translate(${x},${y})">${soil}` +
      `<path d="M-2.6,.15v-1.45h.35v1.4M-1.3,-.2v-1.45h.36v1.4M.1,.25v-1.5h.38v1.4M1.4,-.25v-1.4h.36v1.3M2.4,.1v-1.1h.35V.05" fill="${straw.shade}"/>` +
      `<path d="M-2.6,-1.3h.4v.35h-.4ZM-1.3,-1.65h.4v.35h-.4ZM.1,-1.25h.4v.35H.1ZM1.4,-1.65h.4v.35h-.4ZM2.4,-1h.4v.35h-.4Z" fill="${straw.light}"/></g>`
    );
  }
  const ripe = v === 1;
  const heads = ripe
    ? [
        [-2, -4.05],
        [-0.95, -4.7],
        [0.2, -4.1],
        [1.1, -4.6],
        [2.1, -3.8],
      ]
    : [
        [-1.8, -4.2],
        [-0.2, -4.9],
        [1.5, -4.1],
      ];
  const stems = heads
    .map(
      ([px, py]) =>
        `M${px - 0.15},.05Q${px - 0.2},${py + 1.2} ${px},${py}h.22Q${px + 0.1},-1 ${px + 0.2},.05Z`,
    )
    .join('');
  const grains = heads
    .map(
      ([px, py]) =>
        `<path d="M0,-1.1 .4,-.65 .25,-.48 .5,-.2 .28,.05 .4,.35 0,.9 -.4,.35 -.28,.05 -.5,-.2 -.25,-.48 -.4,-.65Z" transform="translate(${px},${py}) rotate(${ripe ? 19 : -8})" fill="${straw.base}"/>`,
    )
    .join('');
  return (
    `<g transform="translate(${x},${y})">${soil}` +
    `<path d="${stems}M-1.8,-1.2Q-3,-2.2 -2.9,-2.9 -1.6,-2.5 -1.8,-1.2M.1,-1.6Q1,-2.7 1.3,-2.5 .9,-1.4 .1,-1.3" fill="${straw.shade}"/>${grains}` +
    `<path d="${heads.map(([px, py]) => `M${px - 0.2},${py - 0.6}l.2,-.3 .08,.95 -.2,.35Z`).join('')}" fill="${straw.light}"/></g>`
  );
}

function fencePost(x: number, y: number, c: AssetColors): string {
  const wood = farmMaterial(c.fence, c);
  return (
    `<path d="M${x - 0.35},${y}v-3.25l.33,-.5 .37,.5V${y}Z" fill="${wood.base}"/>` +
    `<path d="M${x - 0.35},${y - 3.25}l.33,-.5 .37,.5 -.37,.18Z" fill="${wood.light}"/>` +
    `<path d="M${x - 0.02},${y - 3.07}l.37,-.18V${y}l-.37,.12Z" fill="${wood.shade}"/>`
  );
}

export function svgFence(x: number, y: number, c: AssetColors, v: number): string {
  const wood = farmMaterial(c.fence, c);
  const corner = v === 1;
  const gate = v === 2;
  const leftY = corner ? -0.8 : 0;
  const middleY = corner ? 0.45 : -0.35;
  const rightY = -0.75;
  const points = gate
    ? [
        [-3.6, 0],
        [-0.9, -0.25],
        [1.1, -0.5],
        [3.6, -0.75],
      ]
    : [
        [-3.6, leftY],
        [0, middleY],
        [3.6, rightY],
      ];
  const rail = (height: number) =>
    corner
      ? `M-3.6,${leftY - height} 0,${middleY - height} 3.6,${rightY - height}v.45L0,${middleY - height + 0.45} -3.6,${leftY - height + 0.45}Z`
      : gate
        ? `M-3.6,${-height}-.9,${-height - 0.25}v.45l-2.7,.25ZM1.1,${-height - 0.5}l2.5,-.25v.45l-2.5,.25Z`
        : `M-3.6,${-height}l7.2,-.75v.5l-7.2,.75Z`;
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="${rail(2.75)}${rail(1.3)}" fill="${wood.base}"/>` +
    `<path d="${rail(2.75)}" fill="${wood.light}"/>` +
    (gate
      ? `<path d="M1.1,-2.95 2.8,-3.8v1.6l-1.7,.8Z" fill="${wood.shade}"/><path d="M1.1,-2.85 2.8,-2.3M1.15,-1.6 2.8,-3.6" stroke="${wood.light}" stroke-width=".25"/>`
      : `<path d="M-3.4,${leftY - 1}-.2,${middleY - 2.45}" stroke="${wood.shade}" stroke-width=".28"/>`) +
    points.map(([px, py]) => fencePost(px, py, c)).join('') +
    `</g>`
  );
}

export function svgScarecrow(x: number, y: number, c: AssetColors, v: number): string {
  const cloth = farmMaterial(c.scarecrow, c);
  const straw = farmMaterial(c.scarecrowHat, c);
  const ragged = v === 2;
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx=".5" cy=".2" rx="1.25" ry=".3" fill="${c.shadow}" opacity=".14"/>` +
    `<path d="M-.2,.2 .02,-6.2 .45,-6.2 .22,.2Z" fill="${c.trunk}"/>` +
    `<g transform="rotate(${ragged ? -9 : 0} 0 -4)">` +
    `<path d="M-3.1,-4.8 3.1,-4.8v.3h-6.2Z" fill="${c.fence}"/>` +
    `<path d="M-1,-5.8 -.3,-6 .5,-5.85 1.4,-5.4 2.8,-4.9 2.55,-4.15 1.05,-4.55 1.1,-2.55 .45,-2.85 0,-2.5 -.6,-2.8 -1.05,-2.55 -.9,-4.5 -2.6,-4.15 -2.9,-4.9Z" fill="${cloth.base}"/>` +
    `<path d="M-1,-5.8 -.3,-6 .1,-5.3 -.35,-4.4 -2.6,-4.15 -2.9,-4.9Z" fill="${cloth.light}"/>` +
    `<path d="M.1,-5.3 .5,-5.85 1.4,-5.4 2.8,-4.9 2.55,-4.15 1.05,-4.55 1.1,-2.55 .45,-2.85Z" fill="${cloth.shade}"/>` +
    `<path d="M-3.25,-4.9l.6,.2-.55,.25 .5,.1-.45,.3 .7,-.1M2.8,-4.9l.65,.2-.55,.2 .65,.2-.75,.1M-.75,-2.85l.15,.65 .2,-.6M.3,-2.8l.05,.65 .25,-.65" stroke="${c.wheat}" stroke-width=".23" fill="none"/>` +
    `<path d="M-1,-6.95Q-1.05,-5.8 0,-5.65 1.05,-5.8 .85,-7Z" fill="${straw.light}"/>` +
    `<path d="M-1.7,-7.15 -.8,-7.5 -.6,-8.55 .6,-8.7 .95,-7.6 1.6,-7.3 .1,-6.9Z" fill="${straw.base}"/>` +
    `<path d="M-.8,-7.5 .95,-7.6 1.6,-7.3 .1,-6.9 -1.7,-7.15Z" fill="${straw.shade}"/>` +
    `<path d="M-.5,-6.45h.2M.35,-6.45h.2M-.3,-6.05Q0,-5.85 .35,-6.05" stroke="${c.trunk}" stroke-width=".15" fill="none"/>` +
    `<path d="M-.35,-5.65 .2,-5.75 .7,-5.25 1.5,-5.55 1.2,-4.95 .55,-4.95Z" fill="${c.flag}"/>` +
    (ragged ? `<path d="M-.85,-3.65h.55v.6h-.55Z" fill="${c.wall}"/>` : '') +
    (v === 1
      ? `<path d="M2.1,-5.05Q1.7,-5.6 2.1,-5.9 2.4,-6.05 2.6,-5.7L3.2,-5.5 2.7,-5.3 3.4,-4.95 2.65,-5.05 2.4,-4.85Z" fill="${c.bird}"/>`
      : '') +
    `</g></g>`
  );
}

export function svgBarn(x: number, y: number, c: AssetColors, v: number): string {
  const red = farmMaterial(c.roofA, c);
  const roof = farmMaterial(v === 2 ? c.roofB : c.trunk, c);
  const large = v === 1;
  const small = v === 2;
  const left = small ? -2.5 : large ? -4.1 : -3.3;
  const right = small ? 2.6 : large ? 4.5 : 3.6;
  const eave = small ? -2.7 : large ? -4.4 : -3.5;
  const ridge = small ? -4.5 : large ? -8 : -6.6;
  const front = small ? -0.15 : -0.25;
  const depth = small ? 1.15 : large ? 1.8 : 1.5;
  const doorHeight = small ? 1.8 : 2.4;
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M${left},.15 0,${depth + 0.6} ${right + 0.45},.25 .2,-1.2Z" fill="${c.shadow}" opacity=".14"/>` +
    `<path d="M${left},0 0,${depth} 0,${eave + depth} ${left},${eave}Z" fill="${small ? c.wall : red.base}"/>` +
    `<path d="M0,${depth} ${right},0 ${right},${eave} 0,${eave + depth}Z" fill="${small ? c.wallShade : red.shade}"/>` +
    `<path d="M${left},${eave} ${left / 2},${ridge + 0.8} 0,${eave + depth}Z" fill="${small ? c.wall : red.light}"/>` +
    `<path d="M${left - 0.4},${eave - 0.1} ${left / 2},${ridge + 0.45} ${right / 2},${ridge - 0.1} .3,${eave + depth - 0.1} 0,${eave + depth + 0.2}Z" fill="${roof.light}"/>` +
    `<path d="M${left / 2},${ridge + 0.45} ${right / 2},${ridge - 0.1} ${right + 0.4},${eave - 0.1} .3,${eave + depth - 0.1}Z" fill="${roof.base}"/>` +
    `<path d="M.3,${eave + depth - 0.1} ${right + 0.4},${eave - 0.1}v.35L.3,${eave + depth + 0.25}Z" fill="${roof.shade}"/>` +
    `<path d="M${left + 0.65},.15v${small ? -1.8 : -2.4}l${-left - 1.1},${depth - 0.65}v${small ? 1.8 : 2.4}Z" fill="${c.trunk}"/>` +
    `<path d="M${left + 0.65},.15l${-left - 1.1},${depth - 0.65 - doorHeight}M${left + 0.65},${0.15 - doorHeight}l${-left - 1.1},${depth - 0.65 + doorHeight}" stroke="${c.fence}" stroke-width=".22"/>` +
    `<path d="M${left},${eave}V0L0,${depth} ${right},0M${front},${eave + depth}V${depth}" stroke="${c.fence}" stroke-width=".25" fill="none"/>` +
    `<path d="M${right * 0.45},${eave + 1.2}l${right * 0.3},${-depth * 0.3}v.85l${-right * 0.3},${depth * 0.3}Z" fill="${c.trunk}"/>` +
    (large
      ? `<path d="M1,-6.95v-1.15l.7,-.3 .65,.35v.75Z" fill="${c.wall}"/><path d="M.75,-8.1 1.7,-8.7 2.6,-8.25 1.7,-7.95Z" fill="${roof.shade}"/>`
      : '') +
    `</g>`
  );
}
