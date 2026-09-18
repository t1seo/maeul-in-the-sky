import { lerpColor } from '../../../../utils/color.js';
import type { AssetColors } from '../../palette.js';

export function group(x: number, y: number, ...parts: readonly string[]): string {
  return `<g transform="translate(${x},${y})">${parts.join('')}</g>`;
}

export function path(d: string, fill: string, attributes = ''): string {
  return `<path d="${d}" fill="${fill}"${attributes ? ` ${attributes}` : ''}/>`;
}

export function polygon(points: string, fill: string): string {
  return `<polygon points="${points}" fill="${fill}"/>`;
}

export function ellipse(x: number, y: number, rx: number, ry: number, fill: string): string {
  return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
}

export function stroke(d: string, color: string, width = 0.25): string {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function fullHex(color: string): string {
  return /^#[\da-f]{3}$/i.test(color)
    ? `#${Array.from(color.slice(1), (digit) => digit + digit).join('')}`
    : color;
}

export function material(color: string, c: AssetColors) {
  return {
    light: lerpColor(fullHex(color), fullHex(c.sail), 0.22),
    base: color,
    dark: lerpColor(fullHex(color), fullHex(c.shadow), 0.24),
  };
}

export function wheel(x: number, y: number, radius: number, c: AssetColors): string {
  return group(
    x,
    y,
    ellipse(0, 0, radius, radius * 0.9, c.trunk),
    ellipse(-0.08, -0.07, radius * 0.64, radius * 0.62, c.fence),
    stroke(
      `M${-radius * 0.5},0 H${radius * 0.5} M0,${-radius * 0.5} V${radius * 0.5}`,
      c.trunk,
      0.18,
    ),
    ellipse(0, 0, 0.17, 0.17, c.anvil),
  );
}
