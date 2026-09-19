import type { WorldScene } from '../../model/types.js';
import { surfaceCoordinates } from './surface-coordinates.js';
import { terrainPatches } from './terrain-grid.js';
import type { WaterBuffer, WaterVertex } from './water-buffer.js';
import { addStream } from './water-shapes.js';

export function addBasins(water: WaterBuffer, foam: WaterBuffer, scene: WorldScene): void {
  const coordinates = surfaceCoordinates(scene);
  const tiles = new Map(
    scene.terrain.tiles.map((tile) => [
      `${tile.islandId}:${tile.position.x.toFixed(4)}:${tile.position.z.toFixed(4)}`,
      tile,
    ]),
  );
  for (const patch of terrainPatches(scene.terrain.tiles, scene.terrain.waterLevel)) {
    if (patch.tile.surface !== 'water') continue;
    const vertex = (point: typeof patch.center): WaterVertex => {
      const neighbors = [-0.5, 0.5].flatMap((dx) =>
        [-0.5, 0.5].map((dz) =>
          tiles.get(
            `${patch.tile.islandId}:${(point.x + dx * patch.tile.size).toFixed(4)}:${(point.z + dz * patch.tile.size).toFixed(4)}`,
          ),
        ),
      );
      const land = neighbors.filter((tile) => tile && tile.surface !== 'water').length;
      const [u, v] = coordinates(patch.tile, point, false);
      return {
        point: { ...point, y: scene.terrain.waterLevel + 0.018 },
        uv: [u / 1.7, v / 2.8],
        depth: land ? 0.18 : 0.82,
      };
    };
    const [a, b, c, d] = patch.corners;
    water.quad(vertex(a), vertex(b), vertex(c), vertex(d));
    for (const [from, to] of [
      [a, b],
      [b, c],
      [c, d],
      [d, a],
    ] as const) {
      const x = from.x + to.x - patch.center.x;
      const z = from.z + to.z - patch.center.z;
      const neighbor = tiles.get(`${patch.tile.islandId}:${x.toFixed(4)}:${z.toFixed(4)}`);
      if (neighbor && neighbor.surface !== 'water')
        addStream(
          foam,
          [from, to].map((point) => ({ ...point, y: scene.terrain.waterLevel })),
          0.055,
          0.043,
          0,
          [-0.5, 0.5],
        );
    }
  }
}
