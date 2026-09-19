import type { Vec3, WorldScene } from '../model/types.js';

export type AtmosphereZone = {
  readonly monthKey: string;
  readonly nature: boolean;
  readonly min: Vec3;
  readonly max: Vec3;
};

export function atmosphereZones(scene: WorldScene): readonly AtmosphereZone[] {
  const zones = scene.regions.flatMap((region) => {
    const tiles = scene.terrain.tiles.filter((tile) => tile.regionId === region.id);
    if (!tiles.length) return [];
    return [
      {
        monthKey: region.monthKey,
        nature: region.kind === 'nature',
        min: {
          x: Math.min(...tiles.map((tile) => tile.position.x - tile.size / 2)),
          y: Math.min(...tiles.map((tile) => tile.position.y)),
          z: Math.min(...tiles.map((tile) => tile.position.z - tile.size / 2)),
        },
        max: {
          x: Math.max(...tiles.map((tile) => tile.position.x + tile.size / 2)),
          y: Math.max(...tiles.map((tile) => tile.position.y + tile.activityHeight)),
          z: Math.max(...tiles.map((tile) => tile.position.z + tile.size / 2)),
        },
      },
    ];
  });
  return zones.length
    ? zones
    : [{ monthKey: scene.range.to.slice(0, 7), nature: true, ...scene.bounds }];
}

export function zonePoint(zone: AtmosphereZone, index: number): Vec3 {
  return {
    x: zone.min.x + ((index * 0.61803398875 + 0.31) % 1) * (zone.max.x - zone.min.x),
    y: zone.max.y,
    z: zone.min.z + ((index * 0.41421356237 + 0.43) % 1) * (zone.max.z - zone.min.z),
  };
}
