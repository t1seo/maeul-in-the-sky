import { describe, expect, it } from 'vitest';
import {
  buildWorld,
  defaultWorldView,
  frameWorld,
  weatherForMonth,
} from '../../../src/world/model/index.js';
import { inputFor } from './helpers.js';

describe('seasonal world weather', () => {
  it('defaults to seasonal weather without changing scene generation', () => {
    const scene = buildWorld(inputFor([['2024-07-01', 1]]));
    const view = defaultWorldView(scene);
    expect(view.weather).toBe('seasonal');
    expect(frameWorld(scene, { ...view, weather: 'clear' })).toEqual(frameWorld(scene, view));
  });

  it.each([
    ['north', ['snow', 'clear', 'rain', 'clear']],
    ['south', ['rain', 'clear', 'snow', 'clear']],
  ] as const)('derives calendar weather for the %s hemisphere', (hemisphere, expected) => {
    const input = inputFor([]);
    const scene = buildWorld({ ...input, settings: { ...input.settings, hemisphere } });
    const view = { ...defaultWorldView(scene), weather: 'seasonal' as const };
    expect(
      ['2024-01', '2024-04', '2024-07', '2024-10'].map((month) =>
        weatherForMonth(scene, view, month),
      ),
    ).toEqual(expected);
  });

  it.each([
    ['spring', 'clear'],
    ['summer', 'rain'],
    ['autumn', 'clear'],
    ['winter', 'snow'],
  ] as const)('honors the %s presentation override', (seasonOverride, expected) => {
    const scene = buildWorld(inputFor([]));
    const view = { ...defaultWorldView(scene), weather: 'seasonal' as const, seasonOverride };
    expect(weatherForMonth(scene, view, '2024-05')).toBe(expected);
  });

  it.each(['clear', 'rain', 'snow'] as const)(
    'retains explicit %s weather in any season',
    (weather) => {
      const scene = buildWorld(inputFor([]));
      const view = { ...defaultWorldView(scene), weather, seasonOverride: 'winter' as const };
      expect(weatherForMonth(scene, view, '2024-05')).toBe(weather);
    },
  );
});
