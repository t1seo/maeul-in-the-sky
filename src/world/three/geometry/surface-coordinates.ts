import type { Vec3, WorldScene, WorldTile } from '../../model/types.js';

export function surfaceCoordinates(scene: WorldScene) {
  const rivers = scene.terrain.waterways.filter(
    (water) => water.kind === 'river' && water.points.length > 1,
  );
  const axes = new Map<string, { readonly x: number; readonly z: number; readonly origin: Vec3 }>();
  for (const region of scene.regions) {
    const tiles = scene.terrain.tiles.filter((tile) => tile.regionId === region.id);
    const center = tiles.reduce(
      (sum, tile) => ({
        x: sum.x + tile.position.x / tiles.length,
        z: sum.z + tile.position.z / tiles.length,
      }),
      { x: 0, z: 0 },
    );
    const river = rivers
      .filter((item) => item.islandId === region.islandId)
      .sort((a, b) => {
        const distance = (points: readonly Vec3[]) =>
          Math.min(...points.map((p) => Math.hypot(p.x - center.x, p.z - center.z)));
        return distance(a.points) - distance(b.points);
      })[0];
    const first = river?.points[0];
    const last = river?.points.at(-1);
    const dx = first && last ? last.x - first.x : 0;
    const dz = first && last ? last.z - first.z : 1;
    axes.set(region.id, {
      x: Math.abs(dx) > Math.abs(dz) ? Math.sign(dx) : 0,
      z: Math.abs(dx) > Math.abs(dz) ? 0 : Math.sign(dz),
      origin: first ?? { x: 0, y: 0, z: 0 },
    });
  }
  return (tile: WorldTile, point: Vec3, relative = true): readonly [number, number] => {
    const axis = axes.get(tile.regionId) ?? { x: 0, z: 1, origin: { x: 0, y: 0, z: 0 } };
    const origin = relative ? tile.position : axis.origin;
    const dx = point.x - origin.x;
    const dz = point.z - origin.z;
    return [dx * axis.z - dz * axis.x, dx * axis.x + dz * axis.z];
  };
}
