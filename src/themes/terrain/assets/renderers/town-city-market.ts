import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';
import { ellipse, group, material, path, polygon, stroke, wheel } from './buildings-art-shapes.js';
import { castle, cathedral, gatehouse } from './buildings-art-civic.js';

export function svgMarket(x: number, y: number, c: AssetColors, v: number): string {
  const awning = material(c.marketAwning, c);
  const wood = material(c.market, c);
  return group(
    x,
    y,
    v === 2 ? '' : polygon('-3.4,-3.5 1,-2.5 3.7,-3.7 3.7,-0.5 1,0.8 -3.4,-0.3', wood.dark),
    stroke('M-3.4,-4.3 V-0.2 M3.7,-4.5 V-0.5 M1,-3.2 V0.7', c.trunk, 0.34),
    polygon('-3.8,-4.1 -1.3,-6.1 3.3,-5 4.2,-3.8 1,-2.4', awning.base),
    polygon('-3.8,-4.1 -1.3,-6.1 1,-2.4', awning.light),
    path('M-2.8,-4.4 L-2,-5.5 2.6,-4.4 1.5,-3.4Z M-0.1,-3.5 L0.8,-4.6 3.8,-3.9 2.6,-3.3Z', c.sail),
    path('M-3.8,-4.1 L1,-2.4 4.2,-3.8 V-3.2 L1,-1.8 -3.8,-3.5Z', awning.dark),
    polygon('-3.1,-1.5 -0.9,-2.5 3.2,-1.5 0.8,-0.5', c.fence),
    polygon('-3.1,-1.5 0.8,-0.5 0.8,0.7 -3.1,-0.3', wood.light),
    polygon('0.8,-0.5 3.2,-1.5 3.2,-0.3 0.8,0.7', wood.dark),
    path(
      'M-2.7,-1.5 Q-2.8,-2.5 -2.2,-2.2 Q-1.7,-2.8 -1.3,-2.1 Q-0.6,-2.3 -0.5,-1.1Z',
      c.orchardFruit,
    ),
    path('M0.5,-1.4 L0.8,-2.3 1.3,-2.1 1.5,-1.1Z M1.6,-1.7 L1.8,-2.4 2.3,-2.1 2.4,-1.7Z', c.wheat),
    v === 1
      ? group(
          5.1,
          -0.2,
          polygon('-1.1,-1.8 0,-2.3 2,-1.7 0.8,-1.1', c.fence),
          polygon('-1.1,-1.8 0.8,-1.1 2,-1.7 2,-0.7 0.8,0 -1.1,-0.7', c.cart),
          wheel(-0.5, 0.1, 0.55, c),
          wheel(1.5, 0, 0.5, c),
        )
      : '',
  );
}

export function svgInn(x: number, y: number, c: AssetColors, v: number): string {
  const plaster = material(c.inn, c);
  const roof = material(c.roofB, c);
  return group(
    x,
    y,
    polygon('-3.4,-3.6 -1.5,-5.7 0.8,-3.1 0.8,1.8 -3.4,0', plaster.light),
    polygon('0.8,-3.1 3.5,-4.3 3.5,0.5 0.8,1.8', plaster.dark),
    polygon('-4,-3.6 -1.5,-6.7 1.4,-3.1 0.8,-2.7', roof.light),
    polygon('-1.5,-6.7 1,-7.5 4,-4.3 1.4,-3.1', roof.base),
    stroke(
      'M-3.3,-1.9 L0.8,0 3.4,-1.2 M-1.5,-5.5 V-0.8 M0.7,-2.8 V1.7 M-3.1,-3 L0.5,-0.4',
      c.trunk,
      0.27,
    ),
    path(
      'M-2.7,-2.9 L-2,-2.6 V-1.7 L-2.7,-2Z M-0.7,-3.4 L0.1,-3.1 V-1.6 L-0.7,-1.9Z M1.6,-2.8 L2.7,-3.3 V-2.2 L1.6,-1.7Z',
      c.lanternGlow,
    ),
    path('M-1.9,0.6 V-0.9 Q-1.2,-2.1 -0.5,-0.3 V1.3Z', c.trunk),
    stroke('M3.2,-4.8 H5 V-4.2', c.trunk, 0.28),
    path('M4.1,-4.3 H5.8 V-2.8 H4.1Z', c.innSign),
    path('M4.4,-3.3 V-3.9 H4.6 V-3.6 H5.4 V-3.2 H5.2 V-3.4 H4.6 V-3.3Z', c.sail),
    v === 1
      ? group(
          1.2,
          -5.2,
          polygon('-0.7,0 -0.1,-1.1 0.8,-0.1 0.8,0.9 -0.7,1.2', c.wall),
          polygon('-1,0 -0.1,-1.4 1,-0.1 0.8,0.1', roof.dark),
          path('M-0.3,0 H0.3 V0.7 H-0.3Z', c.trunk),
        )
      : '',
    v === 2
      ? group(
          4.7,
          0.9,
          stroke('M-0.9,-0.8 V0.4 M1.1,-0.8 V0.4', c.trunk, 0.28),
          polygon('-1.6,-1.1 0.1,-1.8 1.8,-1.1 0.1,-0.3', c.parkBench),
          stroke('M-1.5,0 L-0.1,0.6 M0.9,0.3 L2,-0.2', c.fence, 0.35),
        )
      : '',
  );
}

export function svgBlacksmith(x: number, y: number, c: AssetColors, _v: number): string {
  const stone = material(c.blacksmith, c);
  return group(
    x,
    y,
    polygon('-3,-3.3 0.5,-2.5 0.5,0.6 -3,-0.3', stone.light),
    polygon('0.5,-2.5 3,-3.7 3,-0.5 0.5,0.6', stone.dark),
    polygon('-3.5,-3.4 -1.4,-5.3 1.8,-4.5 3.5,-3.5 0.5,-2.1', c.roofA),
    polygon('1.3,-6.8 2.3,-7.2 2.8,-6.8 2.8,-3.7 1.3,-3.4', c.chimney),
    path('M1.7,-6.8 H2.5 V-6.4 H1.7Z', c.shadow),
    path('M-2.5,-0.5 V-1.9 Q-1.5,-3.8 -0.5,-1.4 V0.1Z', c.shadow),
    path('M-2.2,-0.7 Q-2.4,-1.2 -1.8,-2 L-1.5,-1.5 -1.1,-2.3 -0.8,-0.7Z', c.torchFlame),
    path('M-0.5,-1.2 H1.6 L0.8,-0.6 H0.3 L0.6,0.2 H-0.7 L-0.4,-0.6 -1.1,-0.8Z', c.anvil),
    stroke('M-0.8,-1.15 H1.4', material(c.anvil, c).light, 0.22),
    path('M1.9,-7.3 Q1,-7.6 1.7,-7.9 Q2.5,-7.6 2.9,-7.8 L3.1,-7.3Z', c.smoke),
  );
}

export function svgCastle(x: number, y: number, c: AssetColors, _v: number): string {
  return castle(x, y, c);
}

export function svgTower(x: number, y: number, c: AssetColors, _v: number): string {
  const stone = material(c.tower, c);
  const roof = material(c.castleRoof, c);
  return group(
    x,
    y,
    polygon('-1.9,-8 0.4,-7.3 0.4,0.5 -1.9,-0.3', stone.light),
    polygon('0.4,-7.3 1.9,-8 1.9,-0.2 0.4,0.5', stone.dark),
    polygon('-2.5,-8.1 -0.3,-11.4 0.5,-7.4', roof.light),
    polygon('-0.3,-11.4 2.5,-8.3 0.5,-7.4', roof.dark),
    stroke('M-2.2,-7.7 L0.4,-6.9 2.1,-7.7 M-1.9,-2.3 L0.4,-1.5 1.9,-2.2', stone.base, 0.3),
    path(
      'M-1.3,-4.6 V-5.9 Q-0.8,-7 -0.3,-5.6 V-4.2Z M-0.9,-0.1 V-1.7 Q-0.5,-2.5 -0.1,-1.4 V0.2Z',
      c.shadow,
    ),
    polygon('1,-4.1 1.4,-4.3 1.4,-3.1 1,-2.9', c.shadow),
  );
}

export function svgBridge(x: number, y: number, c: AssetColors, _v: number): string {
  const wood = material(c.bridge, c);
  return group(
    x,
    y,
    path('M-5,0 Q-0.7,-4.1 4,-0.4 L5.2,0.7 Q0.5,-2.2 -3.9,1Z', wood.light),
    path('M-3.9,1 Q0.5,-2.2 5.2,0.7 V1.2 Q0.5,-1.4 -3.9,1.5Z', wood.dark),
    stroke(
      'M-4.8,0 V-2 M-2.7,-1.4 V-3 M0,-2 V-3.5 M2.7,-1.3 V-2.8 M-4.8,-2 Q-0.8,-4.5 2.7,-2.8',
      c.trunk,
      0.25,
    ),
    stroke(
      'M-3.7,0.8 V-1.3 M-1.2,-0.4 V-2.3 M1.5,-0.4 V-2.4 M4.7,0.6 V-1.1 M-3.7,-1.3 Q0.5,-3.7 4.7,-1.1',
      c.fence,
      0.27,
    ),
    stroke(
      'M-3,-1.4 L-1.9,-0.4 M-1.5,-2 L-0.3,-0.8 M0,-2.1 L1.2,-0.9 M1.5,-1.7 L2.7,-0.5',
      wood.dark,
      0.16,
    ),
  );
}

export function svgCathedral(x: number, y: number, c: AssetColors, _v: number): string {
  return cathedral(x, y, c);
}

export function svgLibrary(x: number, y: number, c: AssetColors, _v: number): string {
  const wall = material(c.library, c);
  return group(
    x,
    y,
    polygon('-3,-4 0.8,-2.8 0.8,0.7 -3,-0.4', wall.light),
    polygon('0.8,-2.8 3,-3.9 3,-0.4 0.8,0.7', wall.dark),
    polygon('-3.5,-4.1 -1.4,-6.3 2,-5.4 3.5,-3.9 0.8,-2.5', c.roofB),
    polygon('-1.4,-6.3 2,-5.4 3.5,-3.9 0.8,-2.5', material(c.roofB, c).dark),
    path(
      'M-2.5,-1.6 V-3.1 Q-2,-4 -1.5,-2.8 V-1.3Z M-0.9,-1.1 V-2.6 Q-0.4,-3.5 0.1,-2.3 V-0.8Z',
      c.trunk,
    ),
    stroke('M-2.2,-2.6 V-1.6 M-1.8,-2.7 V-1.5 M-0.6,-2.1 V-1.1 M-0.2,-2.2 V-1', c.wheat, 0.2),
    polygon('1.3,0.4 1.3,-2 2.3,-2.5 2.3,-0.1', c.trunk),
    polygon('-3.3,-0.4 0.8,0.9 3.2,-0.3 3.2,0.1 0.8,1 -3.3,0', c.chimney),
    path('M-1.1,-4.3 L-0.5,-4.4 0,-3.9 0.5,-4 0.6,-3.3 0,-3.2 -1.1,-3.7Z', c.sail),
  );
}

export function svgClocktower(x: number, y: number, c: AssetColors, _v: number): string {
  const stone = material(c.clocktower, c);
  return group(
    x,
    y,
    polygon('-1.8,-10.1 0.6,-9.4 0.6,0.4 -1.8,-0.3', stone.light),
    polygon('0.6,-9.4 2,-10.1 2,-0.3 0.6,0.4', stone.dark),
    polygon('-2.5,-10.2 -0.6,-13 0.7,-9.6', c.castleRoof),
    polygon('-0.6,-13 2.6,-10.2 0.7,-9.6', material(c.castleRoof, c).dark),
    stroke('M-2,-6.4 L0.6,-5.7 2.1,-6.4 M-1.9,-1.3 L0.6,-0.6 2,-1.3', stone.base, 0.35),
    ellipse(-0.55, -8, 1.02, 1.22, c.trunk),
    ellipse(-0.6, -8.1, 0.84, 1.02, c.clockFace),
    `<g>${stroke('M-0.6,-8.1 V-8.85', c.bird, 0.2)}${motionMarkup('<animateTransform attributeName="transform" type="rotate" values="-15 -0.6 -8.1;15 -0.6 -8.1;-15 -0.6 -8.1" dur="4s" repeatCount="indefinite"/>')}</g>`,
    stroke('M-0.6,-8.1 L-0.1,-7.8', c.bird, 0.2),
    path('M-1,-2.5 V-4.4 Q-0.5,-5.4 0,-4.1 V-2.2Z', c.shadow),
    stroke('M-0.55,-4.5 V-2.5', c.fence, 0.2),
  );
}

export function svgStatue(x: number, y: number, c: AssetColors, _v: number): string {
  const stone = material(c.statue, c);
  return group(
    x,
    y,
    polygon('-1.6,-0.7 -0.2,-1.3 1.6,-0.6 0.2,0.2', c.rock),
    polygon('-1.6,-0.7 0.2,0.2 1.6,-0.6 1.6,0.1 0.2,0.8 -1.6,0', c.boulder),
    path(
      'M-0.8,-1 L-0.6,-2.6 -1.2,-3.8 -0.5,-4.4 0.4,-4.2 0.9,-3.5 0.5,-2.5 1.1,-1.1Z',
      stone.base,
    ),
    path('M-0.5,-4.4 L-0.3,-2.9 -0.8,-1 0,-1 0.2,-4.3Z', stone.light),
    ellipse(-0.1, -5, 0.53, 0.67, stone.light),
    path(
      'M0.2,-5.6 Q0.8,-5.1 0.2,-4.4 L0,-5.4Z M0.4,-4.1 L1.1,-4.7 1.4,-4.3 0.9,-3.4Z',
      stone.dark,
    ),
    stroke('M1.3,-4.5 V-1.4', c.boulder, 0.23),
  );
}

export function svgPark(x: number, y: number, c: AssetColors, _v: number): string {
  const crown = material(c.gardenTree, c);
  return group(
    x,
    y,
    stroke('M2.1,0 V-4.1 M2.1,-2.8 L1.2,-3.8', c.trunk, 0.45),
    path(
      'M0.1,-3.4 Q-0.8,-4.9 0.5,-5.5 Q0.5,-7.2 2.1,-6.7 Q3.6,-7.1 3.8,-5.5 Q4.9,-4.8 3.9,-3.6 Q2.5,-2.4 0.1,-3.4Z',
      crown.base,
    ),
    path(
      'M0.1,-3.4 Q-0.8,-4.9 0.5,-5.5 Q0.5,-7.2 2.1,-6.7 Q2.9,-5.5 1.8,-4.9 Q0.6,-4.9 0.1,-3.4Z',
      crown.light,
    ),
    path('M2.1,-3 Q4.3,-3.3 4.1,-4.8 Q3.1,-5 2.8,-4Z', crown.dark),
    polygon('-3.8,-1.3 -2.2,-2 0.4,-1.2 -1.1,-0.5', c.parkBench),
    stroke('M-3.5,-1.2 V0 M-1,-0.6 V0.6 M-3.6,-1.5 V-2.8 M-0.9,-0.7 V-2', c.trunk, 0.28),
    polygon('-3.7,-2.8 -0.7,-1.9 -0.7,-1.2 -3.7,-2.1', c.parkBench),
  );
}

export function svgWarehouse(x: number, y: number, c: AssetColors, _v: number): string {
  const stone = material(c.warehouse, c);
  return group(
    x,
    y,
    polygon('-4,-3.8 1.6,-2.5 1.6,0.6 -4,-0.7', stone.light),
    polygon('1.6,-2.5 3.9,-3.6 3.9,-0.5 1.6,0.6', stone.dark),
    polygon('-4.6,-3.9 -2.2,-5.9 3.2,-4.7 4.5,-3.5 1.6,-2', c.roofA),
    polygon('-2.2,-5.9 3.2,-4.7 4.5,-3.5 1.6,-2', material(c.roofA, c).dark),
    polygon('-2.8,-2.7 -0.3,-2.1 -0.3,0.1 -2.8,-0.5', c.trunk),
    stroke('M-1.6,-2.3 V-0.3 M-2.6,-2.4 L-0.5,-0.2 M-0.5,-2 L-2.6,-0.6', c.fence, 0.22),
    polygon('2.2,-2.3 3.3,-2.8 3.3,-1.8 2.2,-1.3', c.shadow),
    path('M-4.3,-0.6 V-1.7 L-3.4,-1.5 V-0.4Z M0.1,0.2 V-0.9 L1,-0.7 V0.4Z', c.cart),
  );
}

export function svgGatehouse(x: number, y: number, c: AssetColors, _v: number): string {
  return gatehouse(x, y, c);
}
