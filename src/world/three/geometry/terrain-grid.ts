import type { Vec3, WorldTile } from '../../model/types.js';

export type TerrainPatch = {
  readonly tile: WorldTile;
  readonly center: Vec3;
  readonly corners: readonly [Vec3, Vec3, Vec3, Vec3];
};

export function terrainPatches(
  tiles: readonly WorldTile[],
  waterLevel: number,
): readonly TerrainPatch[] {
  const heights = new Map<string, { total: number; count: number }>();
  const key = (tile: WorldTile, point: Vec3): string =>
    `${tile.islandId}:${point.x.toFixed(6)}:${point.z.toFixed(6)}`;
  const corners = (tile: WorldTile): readonly [Vec3, Vec3, Vec3, Vec3] => {
    const { x, z } = tile.position;
    const y = tile.position.y + tile.activityHeight;
    const h = tile.size / 2;
    return [
      { x: x - h, y, z: z - h },
      { x: x - h, y, z: z + h },
      { x: x + h, y, z: z + h },
      { x: x + h, y, z: z - h },
    ];
  };
  for (const tile of tiles) {
    for (const corner of corners(tile)) {
      const id = key(tile, corner);
      const sample = heights.get(id) ?? { total: 0, count: 0 };
      sample.total += tile.surface === 'water' ? waterLevel - 0.12 : corner.y;
      sample.count += 1;
      heights.set(id, sample);
    }
  }
  const elevate = (tile: WorldTile, corner: Vec3): Vec3 => {
    const sample = heights.get(key(tile, corner));
    return { ...corner, y: sample ? sample.total / sample.count : corner.y };
  };
  return tiles.map((tile) => {
    const [a, b, c, d] = corners(tile);
    return {
      tile,
      center: {
        ...tile.position,
        y: tile.surface === 'water' ? waterLevel - 0.12 : tile.position.y + tile.activityHeight,
      },
      corners: [elevate(tile, a), elevate(tile, b), elevate(tile, c), elevate(tile, d)],
    };
  });
}
