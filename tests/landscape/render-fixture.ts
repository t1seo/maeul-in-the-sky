import { sampleSnapshot } from '../../src/demo/sample.js';
import { snapshotToContributionData } from '../../src/core/settings/parse.js';
import { prepareTerrainScene } from '../../src/themes/terrain/scene/prepare.js';
import type {
  LandscapeGeography,
  LandscapeSite,
} from '../../src/themes/terrain/landscape/types.js';

const site = (x: number, z: number, elevation: number): LandscapeSite => ({
  x,
  z,
  elevation,
  moisture: 0.5,
  slope: 0.1,
  biome: 'meadow',
  component: 0,
});
const a = site(-12, -12, 0),
  b = site(12, -12, 0),
  c = site(12, 12, 0),
  d = site(-12, 12, 0);
const top = site(-2, -4, 7);
const center = site(2, 3, 1);
const geography: LandscapeGeography = {
  version: 1,
  model: {
    options: { layout: 'island', seed: 41, relief: 1, roughness: 0.65 },
    triangles: [
      { points: [a, b, top], biome: 'rock', moisture: 0.4, component: 0 },
      { points: [b, c, top], biome: 'meadow', moisture: 0.6, component: 0 },
      { points: [c, d, top], biome: 'meadow', moisture: 0.7, component: 0 },
      { points: [d, a, top], biome: 'forest', moisture: 0.6, component: 0 },
    ],
    coast: [
      { a, b },
      { a: b, b: c },
      { a: c, b: d },
      { a: d, b: a },
    ],
    rivers: [{ points: [top, center, c], width: 0.6 }],
    plots: [{ date: '2025-01-05', count: 0, position: center }],
    sites: [a, b, c, d, top, center],
    settlements: [center],
    peaks: [top],
  },
  settlement: {
    towns: [
      { id: 'town-0', center, plaza: [site(1, 2, 1), site(4, 2, 1), site(4, 4, 1), site(1, 4, 1)] },
    ],
    roads: [
      {
        id: 'road-0',
        points: [center, site(5, 7, 1)],
        width: 0.5,
        bridges: [[site(3, 4, 1), site(4, 6, 1)]],
      },
    ],
    fields: [
      {
        id: 'field-0',
        points: [site(6, 4, 1), site(8, 4, 1), site(8, 8, 1), site(6, 8, 1)],
        crop: 'wheat',
        rows: [[site(6, 5, 1), site(8, 5, 1)]],
      },
    ],
    sprites: [
      {
        id: 'house-0',
        catalogId: 'house',
        kind: 'asset',
        anchorDate: '2025-01-05',
        position: center,
        scale: 2,
        variant: 0,
      },
      {
        id: 'wonder-0',
        catalogId: 'colosseum',
        kind: 'wonder',
        anchorDate: '2025-01-05',
        position: site(7, 3, 1),
        scale: 3,
        variant: 0,
      },
      {
        id: 'mill-0',
        catalogId: 'windmill',
        kind: 'asset',
        anchorDate: '2025-01-05',
        position: site(-5, 5, 1),
        scale: 2,
        variant: 0,
      },
    ],
  },
};

export function renderFixture() {
  return {
    ...prepareTerrainScene(snapshotToContributionData(sampleSnapshot()), { motion: 'off' }),
    geography,
  };
}
