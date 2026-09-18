import { lerpColor } from '../../../../utils/color.js';
import type { AssetColors } from '../../palette.js';

export function path(d: string, fill: string, attributes = ''): string {
  return `<path d="${d}" fill="${fill}"${attributes ? ` ${attributes}` : ''}/>`;
}

export function stroke(d: string, color: string, width = 0.28): string {
  return path(
    d,
    'none',
    `stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`,
  );
}

export function ellipse(x: number, y: number, rx: number, ry: number, fill: string): string {
  return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
}

export function at(x: number, y: number, art: string, part = ''): string {
  return `<g transform="translate(${x},${y})" data-style="korean"${part ? ` data-part="${part}"` : ''}>${art}</g>`;
}

function fullHex(color: string): string {
  return /^#[\da-f]{3}$/i.test(color)
    ? `#${Array.from(color.slice(1), (digit) => digit + digit).join('')}`
    : color;
}

export function material(base: string, c: AssetColors) {
  return {
    base,
    light: lerpColor(fullHex(base), fullHex(c.sail), 0.27),
    dark: lerpColor(fullHex(base), fullHex(c.shadow), 0.3),
  };
}

export function giwaRoof(c: AssetColors, width: number, rise: number, depth = 2.5): string {
  const roof = material(c.giwa, c);
  const left = Number((-width * 0.27).toFixed(2));
  const right = Number((width * 0.3).toFixed(2));
  const crest = rise + 0.8;
  return (
    `<g data-part="giwa-roof">` +
    path(
      `M${-width},0 Q${-width * 0.6},${depth * 0.5} 0,${depth} Q${width * 0.7},1 ${width},0 L${width},0.65 L0,${depth + 0.7} L${-width},0.65Z`,
      roof.dark,
    ) +
    path(
      `M${-width},0 Q${left - 2},-0.6 ${left},${-rise} L${right},${-crest} Q${right + 1.8},-0.8 ${width},0 Q${width * 0.6},0.1 0,${depth} Q${-width * 0.65},0.4 ${-width},0Z`,
      roof.light,
    ) +
    path(
      `M${right},${-crest} Q${right + 1.8},-0.8 ${width},0 L0,${depth} Q${right - 1.3},-1.1 ${right},${-crest}Z`,
      roof.base,
    ) +
    stroke(`M${left - 0.5},${-rise - 0.2} L${right + 0.5},${-crest - 0.2}`, c.rock, 0.6) +
    stroke(
      `M${left - 0.4},${-rise + 0.8} Q-3,-1.8 ${-width + 2},0.2 M${left + 1.2},${-rise + 0.45} Q-1.3,-0.8 -2,1.3 M${left + 2.8},${-rise + 0.1} Q0.2,-1 0,${depth - 0.3}`,
      roof.dark,
      0.24,
    ) +
    stroke(
      `M${-width},-0.2 Q${-width * 0.6},${depth * 0.5} 0,${depth} L${width},-0.2`,
      c.rock,
      0.38,
    ) +
    '</g>'
  );
}

export function thatchRoof(c: AssetColors, width: number, rise: number): string {
  const straw = material(c.thatch, c);
  return (
    `<g data-part="thatched-roof">` +
    path(
      `M${-width},0 Q${-width + 1},${-rise + 0.8} -1,${-rise} Q4,${-rise - 1.2} ${width},-0.5 L0,3.1 Q-4,2 ${-width},0Z`,
      straw.dark,
    ) +
    path(
      `M${-width},-0.6 Q${-width + 1.8},${-rise - 0.3} -1.2,${-rise - 0.5} Q3.5,${-rise - 1.1} ${width},-1.1 L0,2.4 Q-4,1.6 ${-width},-0.6Z`,
      straw.base,
    ) +
    path(
      `M${-width + 0.4},-1 Q-5,${-rise + 0.2} -1.2,${-rise - 0.5} L2,${-rise - 0.2} Q0,-1.1 0,2.1Z`,
      straw.light,
    ) +
    stroke(
      `M-4,${-rise + 0.5} L-6.1,0.1 M-1,${-rise + 0.2} L-2,1.5 M2,${-rise + 0.3} L2.7,1.1 M-6.8,-1 Q-1,0.8 5.8,-1.2`,
      straw.dark,
      0.3,
    ) +
    '</g>'
  );
}

export function jar(x: number, y: number, radius: number, height: number, c: AssetColors): string {
  const clay = material(lerpColor(fullHex(c.barrel), fullHex(c.trunk), 0.62), c);
  const neck = radius * 0.74;
  return at(
    x,
    y,
    path(
      `M${-neck},${-height} Q${-radius * 1.3},${-height * 0.55} ${-radius * 0.82},-0.35 Q0,0.6 ${radius * 0.82},-0.35 Q${radius * 1.25},${-height * 0.6} ${neck},${-height}Z`,
      clay.base,
    ) +
      path(
        `M0,${-height + 0.4} Q${radius},${-height * 0.5} ${radius * 0.55},0 L${radius * 0.85},-0.25 Q${radius * 1.25},${-height * 0.6} ${neck},${-height}Z`,
        clay.dark,
      ) +
      ellipse(0, -height, neck + 0.15, 0.43, clay.dark) +
      ellipse(-0.1, -height - 0.17, neck, 0.32, clay.light) +
      stroke(
        `M${-radius * 0.55},${-height * 0.7} Q${-radius * 0.85},${-height * 0.4} ${-radius * 0.55},-0.8`,
        clay.light,
        0.45,
      ),
  );
}
