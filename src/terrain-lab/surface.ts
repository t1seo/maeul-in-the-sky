import type { Biome, TerrainModel, TerrainTriangle } from './types.js';
import {
  depth,
  number,
  pointsAttribute,
  segmentPath,
  shade,
  type DrawItem,
  type Lighting,
  type Projection,
} from './projection.js';

const COLORS: Readonly<Record<Biome, string>> = {
  sand: '#d8c596',
  meadow: '#a4b978',
  forest: '#799657',
  rock: '#999d84',
  snow: '#e0e8d8',
};

function faceColor(face: TerrainTriangle, lighting: Lighting): string {
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
  const light = ((normal.y * 0.86 - normal.x * 0.35 - normal.z * 0.23) * orientation) / length;
  return shade(
    COLORS[face.biome],
    Math.max(0.72, 0.78 + light * 0.25) * (lighting === 'night' ? 0.64 : 1),
  );
}

export function surfaceItems(
  model: TerrainModel,
  projection: Projection,
  lighting: Lighting,
): readonly DrawItem[] {
  const faces: DrawItem[] = model.triangles.map((face) => {
    const fill = faceColor(face, lighting);
    return {
      depth: face.points.reduce((total, point) => total + depth(point), 0) / 3,
      layer: 0,
      markup: `<polygon points="${pointsAttribute(face.points, projection)}" fill="${fill}" stroke="${fill}" stroke-width=".45" stroke-linejoin="round"/>`,
    };
  });
  for (const edge of model.coast) {
    const baseA = { ...edge.a, elevation: -4.8 },
      baseB = { ...edge.b, elevation: -4.8 };
    const midA = { ...edge.a, elevation: -1.65 },
      midB = { ...edge.b, elevation: -1.65 };
    const variation = 0.86 + Math.sin(edge.a.x * 2 + edge.a.z) * 0.06;
    const rock = shade(lighting === 'day' ? '#92816a' : '#46514c', variation);
    const soil = shade(lighting === 'day' ? '#b5a184' : '#627061', variation);
    faces.push({
      depth: (depth(edge.a) + depth(edge.b)) / 2,
      layer: -1,
      markup: `<g class="coast-cliff"><polygon points="${pointsAttribute([edge.a, edge.b, baseB, baseA], projection)}" fill="${rock}" stroke="${rock}" stroke-width=".6"/><polygon points="${pointsAttribute([edge.a, edge.b, midB, midA], projection)}" fill="${soil}" stroke="${soil}" stroke-width=".6"/></g>`,
    });
  }
  for (const river of model.rivers) {
    for (let index = 1; index < river.points.length; index++) {
      const a = river.points[index - 1],
        b = river.points[index];
      const path = segmentPath([a, b], projection);
      const width = (2.4 + river.width * 1.35) * projection.scale;
      faces.push({
        depth: (depth(a) + depth(b)) / 2 + 0.04,
        layer: 1,
        markup: `<g class="river-segment" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${path}" stroke="${lighting === 'day' ? '#9bc2ab' : '#436f69'}" stroke-width="${number(width + 3)}"/><path d="${path}" stroke="${lighting === 'day' ? '#66aeb7' : '#418993'}" stroke-width="${number(width)}"/><path d="${path}" stroke="#d1eee0" stroke-opacity=".6" stroke-width=".65"/></g>`,
      });
    }
    const outlet = river.points.at(-1);
    if (outlet && outlet.x + outlet.z > -4) {
      const a = projection.point(outlet),
        b = projection.point({ ...outlet, elevation: -8.2 });
      const width = (2.2 + river.width) * projection.scale;
      faces.push({
        depth: depth(outlet) + 0.2,
        layer: 2,
        markup: `<g class="waterfall"><path d="M${number(a.x)},${number(a.y)}Q${number(a.x + 4)},${number((a.y + b.y) / 2)} ${number(b.x + 1)},${number(b.y)}" stroke="url(#fall-water)" stroke-width="${number(width)}" fill="none"/><path d="M${number(a.x - 1)},${number(a.y)}L${number(b.x - 1)},${number(b.y - 9)}" stroke="#ddf8ef" stroke-width=".8" opacity=".8"/><ellipse cx="${number(b.x)}" cy="${number(b.y)}" rx="8" ry="2" fill="#b0d5d1" opacity=".25"/></g>`,
      });
    }
  }
  return faces;
}

export function coastline(model: TerrainModel, projection: Projection, lighting: Lighting): string {
  const paths = model.coast
    .map((edge) =>
      segmentPath(
        [
          { ...edge.a, elevation: -4.9 },
          { ...edge.b, elevation: -4.9 },
        ],
        projection,
      ),
    )
    .join('');
  return `<g fill="none" stroke-linecap="round"><path d="${paths}" stroke="${lighting === 'day' ? '#96c7bd' : '#305452'}" stroke-width="18" opacity=".22"/><path d="${paths}" stroke="${lighting === 'day' ? '#bcd6c9' : '#52817a'}" stroke-width="5" opacity=".45"/></g>`;
}
