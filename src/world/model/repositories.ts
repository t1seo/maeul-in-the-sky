import { entityOnTile } from './assets.js';
import { hashKey } from './math.js';
import { reservedPlotKeys } from './scenery.js';
import type { PreparedWorldInput } from './input.js';
import type { MonthTerrain } from './terrain.js';
import type { WorldEntity, WorldEvent, WorldTile } from './types.js';
import { WorldModelError } from './errors.js';

export function repositoryEntities(
  input: PreparedWorldInput,
  months: readonly MonthTerrain[],
  seed: string,
  occupied: readonly WorldEntity[],
  projectTiles?: readonly WorldTile[],
): {
  readonly entities: readonly WorldEntity[];
  readonly events: readonly WorldEvent[];
} {
  const entities: WorldEntity[] = [];
  const events: WorldEvent[] = [];
  const occupiedPositions = new Set([
    ...occupied
      .filter((entity) => entity.visibleFrom === '0001-01-01')
      .map((entity) => `${entity.position.x}:${entity.position.z}`),
    ...months.flatMap(reservedPlotKeys),
  ]);
  const candidates = (projectTiles ?? months.flatMap((month) => month.tiles)).filter(
    (tile) =>
      tile.source === 'scenery' &&
      tile.surface !== 'water' &&
      tile.surface !== 'path' &&
      !occupiedPositions.has(`${tile.position.x}:${tile.position.z}`),
  );
  const used = new Set<string>();
  for (const repo of input.repositories) {
    const ranked = candidates
      .filter((tile) => !used.has(tile.id))
      .sort((a, b) => {
        const priority =
          Number(a.regionId.endsWith(':nature')) - Number(b.regionId.endsWith(':nature'));
        return (
          priority ||
          hashKey(`${repo.id}:${a.id}`) - hashKey(`${repo.id}:${b.id}`) ||
          a.id.localeCompare(b.id)
        );
      });
    const anchor = ranked[0];
    if (!anchor)
      throw new WorldModelError('INVALID_INPUT', 'No reserved project plot is available');
    used.add(anchor.id);
    const created = new Date(repo.createdAt).toISOString().slice(0, 10);
    const entity = entityOnTile(`repo:${repo.id}`, 'repository', anchor, 'library', created, seed, {
      repoId: repo.id,
      label: repo.fullName,
    });
    entities.push(entity);
    for (const [index, release] of repo.releases.entries()) {
      const date = new Date(release.publishedAt).toISOString().slice(0, 10);
      const memorial = entityOnTile(
        `release:${repo.id}:${release.id}`,
        'release',
        {
          ...anchor,
          position: {
            x: anchor.position.x - 0.35 + (index % 5) * 0.17,
            y: anchor.position.y + 0.08 * Math.floor(index / 20),
            z: anchor.position.z - 0.35 + (Math.floor(index / 5) % 4) * 0.2,
          },
        },
        'monument',
        date,
        seed,
        { repoId: repo.id, releaseId: release.id, parentId: entity.id, label: release.tag },
      );
      entities.push({ ...memorial, scale: { x: 0.12, y: 0.18, z: 0.12 } });
      events.push({
        id: `event:${memorial.id}`,
        kind: 'release',
        anchorId: memorial.id,
        startsOn: date,
        evidence: { kind: 'release', repoId: repo.id, releaseId: release.id },
      });
    }
  }
  return { entities, events };
}
