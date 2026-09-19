import type { WorldTile } from '../../../src/world/model/types.js';

export function connectedComponents(
  tiles: readonly WorldTile[],
): readonly (readonly WorldTile[])[] {
  const positions = new Map(tiles.map((tile) => [`${tile.position.x},${tile.position.z}`, tile]));
  const remaining = new Set(positions.keys());
  const components: WorldTile[][] = [];
  for (const tile of tiles) {
    if (!remaining.delete(`${tile.position.x},${tile.position.z}`)) continue;
    const component = [tile];
    for (let index = 0; index < component.length; index += 1) {
      const current = component[index];
      if (!current) continue;
      for (const [dx, dz] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const) {
        const key = `${current.position.x + dx},${current.position.z + dz}`;
        const neighbor = positions.get(key);
        if (neighbor && remaining.delete(key)) component.push(neighbor);
      }
    }
    components.push(component);
  }
  return components;
}
