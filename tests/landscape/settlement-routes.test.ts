import { describe, expect, it } from 'vitest';
import { createLandscapeRouter } from '../../src/themes/terrain/landscape/road-graph.js';
import { planLandscapeRoads } from '../../src/themes/terrain/landscape/roads.js';
import { sampleLandscape } from '../../src/themes/terrain/landscape/sampling.js';
import type {
  LandscapeModel,
  LandscapePoint,
  LandscapeTown,
} from '../../src/themes/terrain/landscape/types.js';
import { flatModel, populatedScene, site } from './settlement-fixtures.js';

function supported(model: LandscapeModel, points: readonly LandscapePoint[]): boolean {
  return points.every((point, index) => {
    const previous = points[Math.max(0, index - 1)];
    return Array.from({ length: 11 }, (_, step) =>
      sampleLandscape(
        model,
        previous.x + ((point.x - previous.x) * step) / 10,
        previous.z + ((point.z - previous.z) * step) / 10,
      ),
    ).every((value) => value && value.elevation > 0);
  });
}

describe('landscape road routing', () => {
  it('walks around a bay instead of crossing the missing land on a direct line', () => {
    const flat = flatModel(populatedScene());
    const model = {
      ...flat,
      triangles: flat.triangles.filter((triangle) => {
        const centerX = triangle.points.reduce((sum, point) => sum + point.x, 0) / 3;
        const centerZ = triangle.points.reduce((sum, point) => sum + point.z, 0) / 3;
        return Math.abs(centerX) >= 2 || centerZ >= 5;
      }),
    };
    const route = createLandscapeRouter(model)(site(-8, -6), site(8, -6));
    expect(route.length).toBeGreaterThan(4);
    expect(route.some((point) => point.z >= 5)).toBe(true);
    expect(supported(model, route)).toBe(true);
  });

  it('never joins towns that belong to disconnected land components', () => {
    const model = flatModel(populatedScene());
    const towns: readonly LandscapeTown[] = [
      { id: 'west', center: site(-7, -2, 0), plaza: [] },
      { id: 'east', center: site(7, 2, 1), plaza: [] },
    ];
    const roads = planLandscapeRoads(model, towns);
    expect(roads.some((road) => road.id.startsWith('road:'))).toBe(false);
    expect(createLandscapeRouter(model)(towns[0].center, towns[1].center)).toEqual([]);
    expect(roads.every((road) => supported(model, road.points))).toBe(true);
  });

  it('returns no route when the endpoints have no surface triangle', () => {
    const model = flatModel(populatedScene());
    expect(createLandscapeRouter(model)(site(50, 50), site(55, 50))).toEqual([]);
  });
});
