import type { AssetColors } from '../../palette.js';
import { at, ellipse, material, path, stroke } from './korean-rural-shapes.js';

function guardian(c: AssetColors, height: number, hat: boolean): string {
  const wood = material(c.trunk, c);
  return (
    path(
      `M-1.4,0 Q-1.9,${-height * 0.5} -1.3,${-height} L1.2,${-height - 0.3} L1.7,0Z`,
      wood.base,
    ) +
    path(`M0.8,${-height - 0.2} L1.2,${-height - 0.3} L1.7,0 H0.6Z`, wood.dark) +
    path(
      `M-0.8,${-height + 2.4} l0.7,-0.3 l-0.1,0.7 h-0.6Z M0.3,${-height + 2.3} l0.7,-0.2 v0.6 h-0.6Z M-0.1,${-height + 2.6} l0.7,1.5 l-0.9,0.1Z`,
      c.sail,
    ) +
    path(
      `M-0.9,${-height + 4.7} Q0.2,${-height + 5.7} 1,${-height + 4.6} L0.9,${-height + 3.9} Q-0.1,${-height + 4.6} -0.9,${-height + 4.1}Z`,
      wood.dark,
    ) +
    stroke(
      `M-0.4,${-height + 4.5} v0.6 M0.2,${-height + 4.6} v0.6 M-0.9,${-height + 1.6} l0.8,-0.2 M0.3,${-height + 1.5} l0.8,0.1 M-0.7,-2.8 v1.5`,
      wood.light,
      0.3,
    ) +
    (hat
      ? path(
          `M-2.1,${-height + 0.6} L-2.1,${-height - 0.3} L-0.8,${-height - 0.8} L-0.8,${-height - 1.7} L0.7,${-height - 1.5} L0.7,${-height - 0.5} L2,${-height - 0.3} V${-height + 0.5}Z`,
          c.anvil,
        )
      : ellipse(0, -height, 1.3, 0.45, wood.light))
  );
}

export function svgJangseung(x: number, y: number, c: AssetColors, v: number): string {
  const variant = v % 3;
  return at(
    x,
    y,
    path('M-5.8,0 L-0.2,2.2 L5.3,-0.4 L0.2,-2.4Z', c.path) +
      at(-2.8, 0.2, guardian(c, [10.5, 12, 9.7][variant], variant !== 2)) +
      at([2.8, 2.1, 3.4][variant], -0.4, guardian(c, [8.8, 9.5, 11][variant], variant === 2)) +
      path('M-5,0.2 L-3.5,-0.5 L-2.5,0.2 L-3.7,0.9Z M1,-0.4 L2.2,-1 L4.3,-0.1 L3.1,0.6Z', c.rock),
    'carved-village-guardians',
  );
}

function birdPost(c: AssetColors, height: number, facing: number): string {
  const timber = material(c.trunk, c);
  return (
    path(`M-0.55,0 L-0.35,${-height} L0.55,${-height} L0.7,0Z`, timber.base) +
    stroke(`M-0.25,-0.3 L-0.1,${-height + 0.3}`, timber.light, 0.22) +
    `<g transform="translate(0,${-height}) scale(${facing},1)">` +
    path(
      'M-2.6,-1 L-1.1,-0.7 Q0.7,-2.4 1.7,-1.2 L1.9,-3 Q2.5,-4 3,-3 L3,-2.6 L4,-2.1 L2.9,-1.9 Q2.3,0.4 0.1,0.1 L-1.6,-0.1Z',
      c.fence,
    ) +
    path('M-1.4,-0.5 Q0.2,-1.7 1.2,-0.8 L0.2,-0.2Z', timber.dark) +
    ellipse(2.5, -2.8, 0.16, 0.16, c.shadow) +
    '</g>'
  );
}

export function svgSotdae(x: number, y: number, c: AssetColors, v: number): string {
  const variant = v % 3;
  return at(
    x,
    y,
    ellipse(0.3, 0.8, 3.7, 1.2, c.path) +
      (variant === 1 ? at(-2.4, -0.4, birdPost(c, 8.6, -1)) : '') +
      at(variant === 1 ? 1.6 : 0, 0, birdPost(c, [11, 10.3, 12][variant], variant === 2 ? -1 : 1)) +
      path('M-1.8,0 L-0.3,-0.8 L1.5,-0.1 L1,0.8 L-0.8,1Z', c.rock),
    'duck-topped-sotdae',
  );
}

export function svgStoneBridge(x: number, y: number, c: AssetColors, v: number): string {
  const variant = v % 3;
  const stone = material(c.rock, c);
  const width = [8.7, 9.5, 8.1][variant];
  const crown = [-5.3, -4.5, -6.2][variant];
  return at(
    x,
    y,
    path(
      `M${-width},0 Q-0.6,${crown - 3} ${width},-1.8 V3 L${width - 1.9},3.4 V2.6 Q0,${crown - 0.5} ${-width + 2.1},4.5 H${-width}Z`,
      stone.dark,
    ) +
      path(
        `M${-width},0 Q-0.6,${crown - 3} ${width},-1.8 L${width - 1.6},-3 Q-0.7,${crown - 4.1} ${-width - 1.2},-1.1Z`,
        stone.light,
      ) +
      stroke(
        `M${-width + 0.2},-0.2 Q0,${crown - 2.7} ${width - 0.1},-2 M-5.1,-2.6 l-0.1,1.7 M-2.6,${crown + 1.2} v1.8 M0.1,${crown + 0.5} v1.8 M3,${crown + 0.9} v1.8 M5.9,-4 l-0.1,1.8`,
        stone.base,
        0.35,
      ) +
      (variant === 2 ? path('M-0.2,-2.8 L1.3,-3.4 L1.3,1.6 L-0.2,2.2Z', stone.base) : ''),
    'stone-arch-bridge',
  );
}
