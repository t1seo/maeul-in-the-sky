import { describe, expect, it } from 'vitest';
import { LineSegments, Points } from 'three';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { defaultWorldView } from '../../../src/world/model/index.js';
import { createWeather } from '../../../src/world/three/weather.js';
import { disposeObjectTree } from '../../../src/world/three/resources.js';

describe('regional 3D weather', () => {
  it('keeps July drizzle and February snow over their own month regions', () => {
    const scene = {
      ...TINY_WORLD_SCENE,
      regions: [
        ...TINY_WORLD_SCENE.regions,
        {
          id: 'summer',
          islandId: 'summer-island',
          monthKey: '2024-07',
          kind: 'nature',
          boundary: [],
          tileIds: ['summer-tile'],
        },
      ],
      terrain: {
        ...TINY_WORLD_SCENE.terrain,
        tiles: [
          ...TINY_WORLD_SCENE.terrain.tiles,
          {
            id: 'summer-tile',
            islandId: 'summer-island',
            regionId: 'summer',
            position: { x: 20, y: 1, z: 0 },
            size: 2,
            surface: 'grass',
            source: 'scenery',
            activityHeight: 0,
          },
        ],
      },
    } as const;
    const weather = createWeather(scene);
    weather.update(
      { ...defaultWorldView(scene), weather: 'seasonal', seasonOverride: 'calendar' },
      0,
    );
    const rain = weather.group.getObjectByName('rain');
    const snow = weather.group.getObjectByName('snow');
    if (!(rain instanceof LineSegments) || !(snow instanceof Points))
      throw new TypeError('Expected regional weather');
    expect(rain.visible && snow.visible).toBe(true);
    expect(rain.geometry.getAttribute('position').getX(0)).toBeGreaterThan(18);
    expect(snow.geometry.getAttribute('position').getX(0)).toBeLessThan(3);
    disposeObjectTree(weather.group);
  });
  it('resolves seasonal summer rain and winter snow from the shared calendar contract', () => {
    const weather = createWeather(TINY_WORLD_SCENE);
    const view = { ...defaultWorldView(TINY_WORLD_SCENE), weather: 'seasonal' } as const;
    weather.update({ ...view, seasonOverride: 'summer' }, 5);
    expect(weather.group.getObjectByName('rain')?.visible).toBe(true);
    expect(weather.group.getObjectByName('snow')?.visible).toBe(false);
    weather.update({ ...view, seasonOverride: 'winter' }, 5);
    expect(weather.group.getObjectByName('snow')?.visible).toBe(true);
    weather.update({ ...view, weather: 'clear' }, 5);
    expect(weather.group.children.every((item) => !item.visible)).toBe(true);
    disposeObjectTree(weather.group);
  });

  it('uses bounded local particle counts and freezes exact coordinates at unchanged elapsed time', () => {
    const weather = createWeather(TINY_WORLD_SCENE);
    const view = {
      ...defaultWorldView(TINY_WORLD_SCENE),
      weather: 'snow',
      quality: 'high',
    } as const;
    weather.update(view, 3);
    const snow = weather.group.getObjectByName('snow');
    const rain = weather.group.getObjectByName('rain');
    if (!(snow instanceof Points) || !(rain instanceof LineSegments))
      throw new TypeError('Expected precipitation meshes');
    const positions = snow.geometry.getAttribute('position');
    const frozen = positions.array.slice();
    expect(snow.geometry.drawRange.count).toBeLessThanOrEqual(180);
    for (let index = 0; index < snow.geometry.drawRange.count; index++)
      expect(Math.abs(positions.getX(index))).toBeLessThan(3);
    weather.update(view, 3);
    expect(positions.array).toEqual(frozen);
    weather.update(view, 3.5);
    expect(positions.array).not.toEqual(frozen);
    weather.update({ ...view, quality: 'low', weather: 'rain' }, 4);
    expect(rain.geometry.drawRange.count).toBeLessThanOrEqual(192);
    disposeObjectTree(weather.group);
  });
});
