import { Color, Float32BufferAttribute, Vector3 } from 'three';
import type { BufferGeometry } from 'three';
import type { WorldScene, WorldView } from '../../model/types.js';
import { groundColor, regionSeasons, regionWeather } from './palette.js';
import { surfaceCoordinates } from './surface-coordinates.js';
import { atlasUV, surfaceCells } from './surface-textures.js';
import type { TerrainPatch } from './terrain-grid.js';

export function smoothTerrainNormals(geometry: BufferGeometry): void {
  geometry.computeVertexNormals();
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  const sums = new Map<string, Vector3>();
  const keys: string[] = [];
  for (let index = 0; index < positions.count; index += 1) {
    const key = [positions.getX(index), positions.getY(index), positions.getZ(index)]
      .map((v) => v.toFixed(5))
      .join(':');
    keys.push(key);
    const sum = sums.get(key) ?? new Vector3();
    sum.add(new Vector3().fromBufferAttribute(normals, index));
    sums.set(key, sum);
  }
  for (const sum of sums.values()) sum.normalize();
  for (const [index, key] of keys.entries()) {
    const sum = sums.get(key);
    if (sum) normals.setXYZ(index, sum.x, sum.y, sum.z);
  }
  normals.needsUpdate = true;
}

export function createTerrainShading(scene: WorldScene, geometry: BufferGeometry) {
  const seasonFor = regionSeasons(scene);
  const weatherFor = regionWeather(scene);
  const coordinates = surfaceCoordinates(scene);
  const count = geometry.getAttribute('position').count;
  const colors = new Float32BufferAttribute(new Float32Array(count * 3), 3);
  const uv = new Float32BufferAttribute(new Float32Array(count * 2), 2);
  geometry.setAttribute('color', colors);
  geometry.setAttribute('uv', uv);
  return (patches: readonly TerrainPatch[], view: WorldView): void => {
    const bases = patches.map(({ tile }) =>
      groundColor(tile, seasonFor(tile.regionId, view), weatherFor(tile.regionId, view)),
    );
    const shared = new Map<string, { readonly color: Color; count: number }>();
    const cornerKey = (patch: TerrainPatch, point: TerrainPatch['center']) =>
      `${patch.tile.islandId}:${point.x.toFixed(5)}:${point.z.toFixed(5)}`;
    for (const [index, patch] of patches.entries()) {
      const color = bases[index];
      if (!color) continue;
      for (const point of patch.corners) {
        const key = cornerKey(patch, point);
        const sum = shared.get(key) ?? { color: new Color(0, 0, 0), count: 0 };
        sum.color.add(color);
        sum.count += 1;
        shared.set(key, sum);
      }
    }
    for (const sum of shared.values()) sum.color.multiplyScalar(1 / sum.count);
    for (const [index, patch] of patches.entries()) {
      const base = bases[index];
      if (!base) continue;
      const season = seasonFor(patch.tile.regionId, view);
      const cell =
        patch.tile.surface !== 'water' &&
        (season === 'winter' || weatherFor(patch.tile.regionId, view) === 'snow')
          ? surfaceCells.snow
          : surfaceCells[patch.tile.surface];
      const [a, b, c, d] = patch.corners;
      for (const [vertex, point] of [
        patch.center,
        a,
        b,
        patch.center,
        b,
        c,
        patch.center,
        c,
        d,
        patch.center,
        d,
        a,
      ].entries()) {
        const color =
          vertex % 3 === 0 ? base : (shared.get(cornerKey(patch, point))?.color ?? base);
        colors.setXYZ(index * 12 + vertex, color.r, color.g, color.b);
        const [u, v] = coordinates(patch.tile, point);
        const [s, t] = atlasUV(cell, u / patch.tile.size + 0.5, v / patch.tile.size + 0.5);
        uv.setXY(index * 12 + vertex, s, t);
      }
    }
    colors.needsUpdate = true;
    uv.needsUpdate = true;
  };
}
