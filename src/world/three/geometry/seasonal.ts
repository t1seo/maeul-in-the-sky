import { ConeGeometry, OctahedronGeometry, SphereGeometry } from 'three';
import type { BufferGeometry } from 'three';
import type { ModelPart, WorldSeason, WorldView } from '../../model/types.js';
import { SurfaceBuffer } from './buffer.js';
import { createRoof, roofProfile } from './roof.js';

export type SeasonalDetail = 'snow' | 'flowers';

export function showDetail(
  detail: SeasonalDetail | undefined,
  season: WorldSeason,
  weather: WorldView['weather'],
): boolean {
  switch (detail) {
    case undefined:
      return true;
    case 'snow':
      return season === 'winter' || weather === 'snow';
    case 'flowers':
      return season === 'spring' && weather !== 'snow';
    default: {
      const exhaustive: never = detail;
      return exhaustive;
    }
  }
}

function floweringCrown(overview: boolean): BufferGeometry {
  const buffer = new SurfaceBuffer();
  const count = overview ? 3 : 5;
  for (let index = 0; index < count; index += 1) {
    const angle = (index * Math.PI * 2) / count;
    const flower = (
      overview ? new OctahedronGeometry(0.09) : new SphereGeometry(0.09, 5, 3)
    ).translate(Math.cos(angle) * 0.37, 0.29, Math.sin(angle) * 0.37);
    const positions = flower.getAttribute('position');
    const indices = flower.getIndex();
    const point = (index: number) => ({
      x: positions.getX(index),
      y: positions.getY(index),
      z: positions.getZ(index),
    });
    for (let offset = 0; offset < (indices?.count ?? positions.count); offset += 3)
      buffer.triangle(
        point(indices?.getX(offset) ?? offset),
        point(indices?.getX(offset + 1) ?? offset + 1),
        point(indices?.getX(offset + 2) ?? offset + 2),
      );
    flower.dispose();
  }
  return buffer.build();
}

export function seasonalGeometry(
  detail: SeasonalDetail,
  part: ModelPart,
  key: string,
  overview: boolean,
): BufferGeometry {
  if (detail === 'flowers') return floweringCrown(overview);
  switch (part.primitive) {
    case 'roof':
      return createRoof(roofProfile(key)).translate(0, 0.022, 0);
    case 'cone':
      return new ConeGeometry(0.324, 0.65, overview ? 4 : 8).translate(0, 0.198, 0);
    case 'sphere':
      return new SphereGeometry(
        0.509,
        overview ? 4 : 8,
        overview ? 2 : 3,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2,
      ).translate(0, 0.012, 0);
    case 'box':
      return new SphereGeometry(0.5, 8, 3);
    case 'cylinder':
      return new SphereGeometry(0.5, 8, 3);
    default: {
      const exhaustive: never = part.primitive;
      return exhaustive;
    }
  }
}
