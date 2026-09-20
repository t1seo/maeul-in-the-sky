import type { LandscapeModel, LandscapePoint, LandscapeTriangle } from './types.js';
import {
  depth,
  pointsAttribute,
  segmentPath,
  number,
  type DrawItem,
  type Projection,
} from './projection.js';
import { shade, type LandscapePalette } from './palette.js';

function faceColor(face: LandscapeTriangle, palette: LandscapePalette): string {
  const [a, b, c] = face.points;
  const ux = b.x - a.x,
    uz = b.z - a.z,
    uy = b.elevation - a.elevation;
  const vx = c.x - a.x,
    vz = c.z - a.z,
    vy = c.elevation - a.elevation;
  const normal = { x: uz * vy - uy * vz, y: ux * vz - uz * vx, z: uy * vx - ux * vy };
  const orientation = normal.y < 0 ? -1 : 1;
  const length = Math.hypot(normal.x, normal.y, normal.z) || 1;
  const light = ((normal.y * 0.88 - normal.x * 0.37 - normal.z * 0.29) * orientation) / length;
  const alpine = face.biome === 'rock' || face.biome === 'snow';
  const tone = alpine ? 0.77 + light * 0.31 : 0.94 + light * 0.07;
  const broadVariation = Math.sin((a.x + b.x + c.x) * 0.07 + (a.z + b.z + c.z) * 0.05) * 0.014;
  return shade(palette.biomes[face.biome], Math.max(0.66, tone + broadVariation));
}

function cliffBottom(point: LandscapePoint): LandscapePoint {
  const thickness =
    1.55 +
    Math.sin(point.x * 0.28 + point.z * 0.37) * 0.55 +
    Math.cos(point.x * 0.51 - point.z * 0.19) * 0.25;
  return { x: point.x * 0.991, z: point.z * 0.991, elevation: -thickness };
}

export function surfaceItems(
  model: LandscapeModel,
  projection: Projection,
  palette: LandscapePalette,
): readonly DrawItem[] {
  const items: DrawItem[] = model.triangles.map((face) => {
    const fill = faceColor(face, palette);
    return {
      depth: face.points.reduce((sum, point) => sum + depth(point), 0) / 3,
      layer: 0,
      markup: `<polygon data-biome="${face.biome}" points="${pointsAttribute(face.points, projection)}" fill="${fill}" stroke="${fill}" stroke-width="1.05" stroke-linejoin="round"/>`,
    };
  });
  for (const edge of model.coast) {
    const bottomA = cliffBottom(edge.a),
      bottomB = cliffBottom(edge.b);
    const midA = { ...edge.a, elevation: -0.48 },
      midB = { ...edge.b, elevation: -0.48 };
    const variation = 0.91 + Math.sin(edge.a.x * 0.55 - edge.a.z * 0.43) * 0.08;
    const rock = shade(palette.cliff, variation),
      soil = shade(palette.soil, variation);
    const strata = [
      { ...bottomA, elevation: bottomA.elevation * 0.65 },
      { ...bottomB, elevation: bottomB.elevation * 0.65 },
    ];
    items.push({
      depth: (depth(edge.a) + depth(edge.b)) / 2 + 0.04,
      layer: -1,
      markup: `<g class="coast-cliff"><polygon points="${pointsAttribute([edge.a, edge.b, bottomB, bottomA], projection)}" fill="${rock}" stroke="${rock}" stroke-width=".5"/><polygon points="${pointsAttribute([edge.a, edge.b, midB, midA], projection)}" fill="${soil}" stroke="${soil}" stroke-width=".45"/><path d="${segmentPath(strata, projection)}" fill="none" stroke="${soil}" stroke-width=".7" opacity=".35"/></g>`,
    });
  }
  return items;
}

export function coastalWater(
  model: LandscapeModel,
  projection: Projection,
  palette: LandscapePalette,
): string {
  const paths = model.coast
    .map((edge) => segmentPath([cliffBottom(edge.a), cliffBottom(edge.b)], projection))
    .join('');
  return `<g class="coastal-water" fill="none" stroke-linecap="round"><path d="${paths}" stroke="${palette.ocean}" stroke-width="${number(19 * projection.scale)}" opacity=".2"/><path d="${paths}" stroke="${palette.foam}" stroke-width="${number(3.5 * projection.scale)}" opacity=".42"/></g>`;
}
