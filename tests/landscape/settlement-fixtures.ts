import type { ScenePlacement, TerrainScene } from '../../src/core/scene-types.js';
import { prepareTerrainScene } from '../../src/themes/terrain/scene/prepare.js';
import type {
  LandscapeModel,
  LandscapeSite,
  LandscapeTriangle,
} from '../../src/themes/terrain/landscape/types.js';
import { calendarFixture } from '../themes/terrain/scene/fixtures.js';

export function site(x: number, z: number, component = 0): LandscapeSite {
  return { x, z, elevation: 2, biome: 'meadow', moisture: 0.5, slope: 0, component };
}

export function flatModel(scene: TerrainScene): LandscapeModel {
  const triangles: LandscapeTriangle[] = [];
  const sites: LandscapeSite[] = [];
  for (let x = -18; x <= 18; x += 1) {
    for (let z = -16; z <= 16; z += 1) {
      sites.push(site(x, z));
      if (x === 18 || z === 16) continue;
      triangles.push(
        {
          points: [site(x, z), site(x + 1, z), site(x, z + 1)],
          biome: 'meadow',
          moisture: 0.5,
          component: 0,
        },
        {
          points: [site(x + 1, z), site(x + 1, z + 1), site(x, z + 1)],
          biome: 'meadow',
          moisture: 0.5,
          component: 0,
        },
      );
    }
  }
  return {
    options: { layout: 'island', seed: 42, relief: 1, roughness: 0.5 },
    triangles,
    sites,
    coast: [],
    rivers: [{ points: [site(0, -16), site(0, 16)], width: 0.6 }],
    plots: scene.cells.map((cell, index) => ({
      date: cell.date,
      count: cell.count,
      position: site(-12 + (index % 24), -10 + (Math.floor(index / 24) % 20)),
    })),
    settlements: [site(-7, -2), site(7, 2)],
    peaks: [],
  };
}

export function populatedScene(density = 1): TerrainScene {
  const scene = prepareTerrainScene(calendarFixture('2025-01-01', 80, 8), { density });
  const assets: ScenePlacement[] = scene.cells.slice(0, 30).map((cell, index) => ({
    id: `fixture:${cell.date}`,
    catalogId: index < 16 ? (index % 2 ? 'house' : 'houseB') : index < 20 ? 'market' : 'pine',
    anchorDate: cell.date,
    week: cell.week,
    day: cell.day,
    cx: 0,
    cy: 0,
    footprint: { x: 0, y: 0, width: 10, height: 11 },
    drawOrder: index,
    variant: index % 3,
    animated: false,
    primary: true,
  }));
  return { ...scene, placements: assets };
}
