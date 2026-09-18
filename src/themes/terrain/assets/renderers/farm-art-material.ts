import { lerpColor } from '../../../../utils/color.js';
import type { AssetColors } from '../../palette.js';

export function farmMaterial(color: string, c: AssetColors) {
  return {
    base: color,
    light: lerpColor(color, c.snowCap, 0.3),
    shade: lerpColor(color, c.shadow, 0.22),
  } as const;
}

type Crown = {
  readonly silhouette: string;
  readonly light: string;
  readonly shade: string;
  readonly leaf: string;
  readonly fruit: string;
  readonly fruitPath: string;
  readonly branch?: string;
};

export function farmFruitTree(x: number, y: number, c: AssetColors, crown: Crown): string {
  const leaf = farmMaterial(crown.leaf, c);
  const wood = farmMaterial(c.trunk, c);
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cx=".45" cy=".3" rx="2.3" ry=".55" fill="${c.shadow}" opacity=".13"/>` +
    `<path d="${crown.branch ?? 'M-.65,.25 -.4,-2.1 -1.5,-3.6 -1.05,-3.8 .05,-2.65 .8,-4 1.3,-3.7 .4,-1.8 .55,.2Z'}" fill="${wood.base}"/>` +
    `<path d="M-.65,.25 -.4,-2.1 .05,-2.65 -.06,-.05Z" fill="${wood.light}"/>` +
    `<path d="${crown.silhouette}" fill="${leaf.base}"/>` +
    `<path d="${crown.shade}" fill="${leaf.shade}"/>` +
    `<path d="${crown.light}" fill="${leaf.light}"/>` +
    `<path d="${crown.fruitPath}" fill="${crown.fruit}"/>` +
    `</g>`
  );
}

export function farmRoundFruit(x: number, y: number, radius: number): string {
  return `M${x - radius},${y}a${radius},${radius} 0 1 0 ${radius * 2},0a${radius},${radius} 0 1 0 ${-radius * 2},0Z`;
}
