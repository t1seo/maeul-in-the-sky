import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';
import { ellipse, group, material, path, polygon, stroke } from './buildings-art-shapes.js';
import { cottage, house, church } from './buildings-art-homes.js';

export function svgTent(x: number, y: number, c: AssetColors, _v: number): string {
  const cloth = material(c.tent, c);
  return group(
    x,
    y,
    polygon('-4,0 -1.3,-1.4 3.6,-0.6 1,0.7', c.tentStripe),
    polygon('-3.7,-0.1 -0.5,-6.6 1.1,-0.4', cloth.light),
    polygon('-0.5,-6.6 1.7,-5.5 3.6,-0.6 1.1,-0.4', cloth.dark),
    path('M-2.2,-0.1 L-0.5,-4.7 0.2,-0.2Z', c.shadow),
    polygon('-0.5,-4.7 -1,-0.4 0.2,-0.2', c.tentStripe),
    stroke('M-0.5,-7.2 V-6.6 M1.7,-5.5 L4.4,0 M-0.5,-6.6 L-4.5,0.3', c.fence, 0.18),
    stroke('M-4.5,-0.1 V0.5 M4.4,-0.3 V0.2', c.trunk, 0.3),
  );
}

export function svgHut(x: number, y: number, c: AssetColors, v: number): string {
  const thatch = material(c.roofB, c);
  const wall = material(c.hut, c);
  if (v === 1)
    return group(
      x,
      y,
      path('M-2.2,-2.8 Q0,-3.9 2.3,-2.8 V-0.4 Q0,1 -2.2,-0.4Z', wall.base),
      path('M0.7,-3.1 Q1.8,-3.2 2.3,-2.8 V-0.4 Q1.4,0.2 0.7,0.3Z', wall.dark),
      path('M-2.9,-2.7 Q-1.1,-4.7 -0.3,-6 Q0.9,-4.2 3,-2.7 Q0,-1.3 -2.9,-2.7Z', thatch.base),
      path('M-2.9,-2.7 Q-1.1,-4.7 -0.3,-6 L0.3,-2.1 Q-1.5,-2 -2.9,-2.7Z', thatch.light),
      path('M-0.9,0 V-1.4 Q-0.3,-2.6 0.4,-1.4 V0.1Z', c.trunk),
      stroke('M-1.2,-4.5 L-1.8,-2.6 M0.6,-4.1 L1.4,-2.4', thatch.dark, 0.2),
    );
  return group(
    x,
    y,
    polygon('-2.8,-3.1 0.3,-2.2 0.3,0.6 -2.8,-0.3', wall.light),
    polygon('0.3,-2.2 2.3,-3.2 2.3,-0.5 0.3,0.6', wall.dark),
    polygon('-3.4,-3 -1.1,-5.8 1.2,-4.8 0.5,-1.9', thatch.light),
    polygon('-1.1,-5.8 1.2,-4.8 2.9,-3.1 0.5,-1.9', thatch.base),
    stroke('M-3.4,-3 L0.5,-1.9 2.9,-3.1', thatch.dark, 0.35),
    polygon('-1.8,-2.5 -0.7,-2.2 -0.7,0.2 -1.8,-0.1', c.trunk),
    v === 2
      ? path(
          'M2,-1.9 L3.7,-2.6 5,-1.8 3.3,-1Z M3.3,-1 V0.3 H3 V-1 M4.8,-1.8 V-0.4 H4.5 V-1.8',
          thatch.base,
        )
      : '',
  );
}

export function svgHouse(
  x: number,
  y: number,
  c: AssetColors,
  v: number,
  roofColor?: string,
): string {
  return house(x, y, c, v, roofColor);
}

export function svgHouseB(x: number, y: number, c: AssetColors, v: number): string {
  return cottage(x, y, c, v);
}

export function svgChurch(x: number, y: number, c: AssetColors, v: number): string {
  return church(x, y, c, v);
}

export function svgWindmill(x: number, y: number, c: AssetColors, _v: number): string {
  const tower = material(c.windmill, c);
  return group(
    x,
    y,
    path('M-2.2,0 L-1.2,-7.6 0.4,-8.3 1.6,-7.3 2.2,0 Q0,1 -2.2,0Z', tower.base),
    path('M0.4,-8.3 L1.6,-7.3 2.2,0 Q1.3,0.5 0.6,0.5Z', tower.dark),
    polygon('-1.6,-7.4 -0.1,-9.4 1.8,-7.5 0.2,-6.8', c.roofA),
    path('M-0.9,0 V-1.6 Q-0.3,-2.6 0.3,-1.6 V0.3Z', c.trunk),
    `<g>${path('M-0.24,-7.2 V-10.9 H0.65 V-8.1 H0.24 V-7.2 H3.9 V-6.3 H1 V-6.8 H0.24 V-3.1 H-0.65 V-5.9 H-0.24 V-6.8 H-3.9 V-7.7 H-1 V-7.2Z', c.windBlade)}${stroke('M0,-10.9 V-3.1 M-3.9,-7 H3.9', c.fence, 0.18)}${motionMarkup('<animateTransform attributeName="transform" type="rotate" from="0 0 -7" to="360 0 -7" dur="8s" repeatCount="indefinite"/>')}</g>`,
    ellipse(0, -7, 0.48, 0.48, c.trunk),
  );
}

export function svgWell(x: number, y: number, c: AssetColors, _v: number): string {
  const stone = material(c.well, c);
  return group(
    x,
    y,
    path('M-2.4,-1.1 Q0,-2.4 2.4,-1.1 V0.1 Q0,1.8 -2.4,0.1Z', stone.dark),
    ellipse(0, -1.1, 2.4, 1.1, stone.light),
    ellipse(0, -1.2, 1.6, 0.65, c.shadow),
    stroke('M-1.4,-0.1 V0.7 M0.1,0 V1 M1.5,-0.1 V0.7', c.rock, 0.22),
    path('M-1.9,-4.4 H-1.5 V-0.9 H-1.9Z M1.5,-4.4 H1.9 V-0.8 H1.5Z', c.trunk),
    polygon('-3,-4.2 -0.7,-6.2 2.8,-4.9 0.5,-3.3', c.roofB),
    polygon('-0.7,-6.2 1.4,-5.5 2.8,-4.9 0.5,-3.3', material(c.roofB, c).dark),
    stroke('M-3,-4.2 L0.5,-3.3 2.8,-4.9 M-1.6,-3.5 H1.6', c.trunk, 0.32),
    stroke('M0.1,-3.5 V-1.6', c.fence, 0.2),
    path('M-0.5,-1.7 L-0.4,-0.8 Q0.1,-0.4 0.6,-0.8 L0.7,-1.7Z', c.barrel),
    ellipse(0.1, -1.7, 0.6, 0.22, c.cart),
  );
}

export function svgTavern(x: number, y: number, c: AssetColors, _v: number): string {
  const wall = material(c.tavern, c);
  return group(
    x,
    y,
    polygon('-3,0 -3,-3.7 -0.2,-5.2 1,-3.2 1,1.2', wall.light),
    polygon('1,-3.2 3.3,-4.2 3.3,0.1 1,1.2', wall.dark),
    polygon('-3.5,-3.8 -0.4,-6.2 1.5,-3.3 1.1,-2.8', c.roofB),
    polygon('-0.4,-6.2 2,-5.4 3.8,-4.2 1.1,-2.8', material(c.roofB, c).dark),
    stroke('M-2.8,-2.8 L0.8,-1.7 M-2.7,-3.8 V-0.1 M0.6,-2.9 V0.9', c.trunk, 0.3),
    path('M-1.5,0.4 V-1.3 Q-0.9,-2.2 -0.2,-1.1 V0.9Z', c.trunk),
    polygon('-2.5,-2.3 -1.7,-2 -1.7,-1.2 -2.5,-1.5', c.lanternGlow),
    stroke('M3,-4.7 H4.7 V-4.2', c.trunk, 0.25),
    path('M3.8,-4.3 H5.1 V-2.9 H3.8Z', c.tavernSign),
    path('M4,-4 H4.6 V-3.3 H4Z M4.6,-3.9 H4.9 V-3.5 H4.6', c.wheat),
  );
}

export function svgBakery(x: number, y: number, c: AssetColors, _v: number): string {
  const wall = material(c.bakery, c);
  return group(
    x,
    y,
    polygon('-2.9,-3.6 0.7,-2.5 0.7,0.6 -2.9,-0.5', wall.light),
    polygon('0.7,-2.5 2.8,-3.5 2.8,-0.4 0.7,0.6', wall.dark),
    polygon('-3.5,-3.5 -1,-5.8 1.8,-5 3.4,-3.5 0.6,-2.2', c.roofA),
    polygon('-1,-5.8 1.8,-5 3.4,-3.5 0.6,-2.2', material(c.roofA, c).dark),
    path('M1.1,-6.9 H2.1 V-4.8 H1.1Z', c.chimney),
    path('M-2.1,-0.2 V-1.5 Q-0.9,-3.7 0,-1 V0.4Z', c.trunk),
    path('M-1.7,-0.5 Q-1.6,-1.4 -1.1,-1.2 Q-0.6,-1.9 -0.2,-0.4Z', c.wheat),
    polygon('1.2,-2 2.3,-2.5 2.3,-1.4 1.2,-0.9', c.lanternGlow),
    `<circle cx="1.7" cy="-7.6" r="0.55" fill="${c.smoke}" opacity="0.4">${motionMarkup('<animate attributeName="cy" values="-7.6;-9.3;-7.6" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite"/>')}</circle>`,
  );
}

export function svgStable(x: number, y: number, c: AssetColors, _v: number): string {
  const wood = material(c.stable, c);
  return group(
    x,
    y,
    polygon('-3.7,-3.1 1.6,-1.9 1.6,0.6 -3.7,-0.6', wood.base),
    polygon('1.6,-1.9 3.6,-2.9 3.6,-0.4 1.6,0.6', wood.dark),
    polygon('-4.4,-3.3 -2.1,-5.4 3.4,-4.1 4.3,-2.7 1.7,-1.5', c.roofB),
    polygon('-2.1,-5.4 3.4,-4.1 4.3,-2.7 1.7,-1.5', material(c.roofB, c).dark),
    path('M-3.1,-2.7 L-1.4,-2.3 V-0.1 L-3.1,-0.5Z M-0.8,-2.2 L0.9,-1.8 V0.4 L-0.8,0Z', c.shadow),
    path('M-3.1,-1.1 L-1.4,-0.7 V-0.1 L-3.1,-0.5Z M-0.8,-0.6 L0.9,-0.2 V0.4 L-0.8,0Z', wood.light),
    stroke('M-3.1,-2.7 V-0.5 M-1.4,-2.3 V-0.1 M-0.8,-2.2 V0 M0.9,-1.8 V0.4', c.fence, 0.25),
    path('M2,-0.9 L2.4,-1.8 3.2,-1.5 3.4,-0.5 2.7,-0.2Z', c.haybale),
  );
}

export function svgGarden(x: number, y: number, c: AssetColors, _v: number): string {
  return group(
    x,
    y,
    polygon('-4.2,-0.4 -0.9,-2.1 4.1,-0.5 0.6,0.8', c.gardenSoil),
    stroke('M-2.8,-0.7 L0.5,0.1 M-1.6,-1.3 L1.8,-0.4', c.leaf, 0.6),
    path(
      'M-2.8,-1.8 L-2.1,-2.3 -1.7,-1.7 -2.3,-1.4Z M-0.7,-1 L0,-1.8 0.6,-1.2 0,-0.7Z M1.6,-0.8 L2.3,-1.5 2.9,-0.9 2.2,-0.4Z',
      c.flower,
    ),
    stroke(
      'M-4.2,-0.4 V-1.7 M-2.6,0.1 V-1 M-1,0.4 V-0.7 M0.6,0.8 V-0.4 M-4.2,-1 L0.6,0.2',
      c.gardenFence,
      0.3,
    ),
  );
}

export function svgLaundry(x: number, y: number, c: AssetColors, _v: number): string {
  return group(
    x,
    y,
    stroke('M-3.8,0 V-4.3 M3.7,0 V-4.3', c.trunk, 0.38),
    stroke('M-3.8,-3.9 Q0,-3 3.7,-3.9', c.fence, 0.2),
    `<g ${motionMarkup('class="sway-slow"')}>${path('M-2.8,-3.6 L-2,-3.45 -1.8,-2.9 -2.2,-2.6 -2.2,-1.4 -3.1,-1.6 -3,-2.7 -3.4,-2.9Z', c.laundry)}${path('M-0.9,-3.4 L0.8,-3.4 1,-1.2 Q0,-0.9 -1,-1.3Z', c.sail)}${path('M1.7,-3.55 L2.7,-3.7 2.9,-1.8 2.5,-1.7 2.1,-2.6 2.1,-1.6 1.6,-1.5Z', c.laundry)}${stroke('M-0.5,-3.3 L-0.5,-1.5 M0.4,-3.3 L0.5,-1.4', c.wallShade, 0.14)}</g>`,
  );
}

export function svgDoghouse(x: number, y: number, c: AssetColors, _v: number): string {
  const wood = material(c.doghouse, c);
  return group(
    x,
    y,
    polygon('-2.3,-2.2 -0.9,-3.6 0.7,-1.8 0.7,0.6 -2.3,-0.3', wood.light),
    polygon('0.7,-1.8 2,-2.5 2,-0.2 0.7,0.6', wood.dark),
    polygon('-2.8,-2.3 -1,-4.1 0.4,-3.6 2.4,-2.5 0.6,-1.5', c.roofA),
    polygon('-1,-4.1 0.4,-3.6 2.4,-2.5 0.6,-1.5', material(c.roofA, c).dark),
    path('M-1.6,-0.1 V-1.2 Q-0.9,-2.5 -0.2,-0.9 V0.3Z', c.trunk),
    path('M2.4,0 Q2,-0.9 3,-1 Q3.6,-1.1 3.9,-0.6 L4.4,-0.8 4.2,-0.1 Q3.6,0.6 2.4,0Z', c.deer),
    ellipse(3.8, -0.5, 0.19, 0.27, c.trunk),
  );
}
