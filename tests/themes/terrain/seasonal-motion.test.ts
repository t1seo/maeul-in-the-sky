import { describe, expect, it } from 'vitest';
import { prepareTerrainScene, renderTerrainScene } from '../../../src/themes/terrain/index.js';
import { calendarFixture, sceneOptions } from './scene/fixtures.js';

const seasons = [
  { start: '2025-01-12', north: ['snow'], south: ['rain'] },
  { start: '2025-04-13', north: ['petals', 'butterflies'], south: ['leaves'] },
  { start: '2025-07-13', north: ['rain'], south: ['snow'] },
  { start: '2025-10-12', north: ['leaves'], south: ['petals', 'butterflies'] },
] as const;

describe('miniature calendar-season weather', () => {
  it.each(seasons)('uses dated seasons for a partial calendar starting $start', (season) => {
    // Given: a partial calendar whose week zero does not mean northern winter.
    for (const hemisphere of ['north', 'south'] as const) {
      const scene = prepareTerrainScene(calendarFixture(season.start, 14, 5), {
        ...sceneOptions,
        hemisphere,
        motion: 'full',
      });
      // When: the same prepared geometry is shaded.
      const svg = renderTerrainScene(scene, 'dark');
      // Then: weather belongs only to the actual hemisphere-adjusted season.
      const kinds = [...new Set([...svg.matchAll(/data-seasonal="([^"]+)"/g)].map((m) => m[1]))];
      expect(kinds.sort()).toEqual([...season[hemisphere]].sort());
    }
  });

  it('provides weather movement only in full mode without mutating the calendar', () => {
    // Given: a full dated year, one immutable placement/data input.
    const scene = prepareTerrainScene(calendarFixture('2025-01-01', 365, 5), sceneOptions);
    const before = JSON.stringify(scene);
    // When: the scene is presented in all supported motion modes.
    const outputs = ['full', 'subtle', 'off'].map((motion) =>
      renderTerrainScene(scene, 'light', {
        motion: motion === 'full' ? 'full' : motion === 'subtle' ? 'subtle' : 'off',
      }),
    );
    // Then: all weather retains its static pose; only full supplies its animation rules.
    expect(outputs[0]).toMatch(/@keyframes [\w-]*seasonal-/);
    expect(outputs[1]).not.toMatch(/@keyframes [\w-]*seasonal-/);
    expect(outputs[2]).not.toMatch(/@keyframes|animation\s*:|<animate/);
    for (const svg of outputs) expect(svg).toContain('data-seasonal="butterflies"');
    expect(JSON.stringify(scene)).toBe(before);
  });

  it('keeps new miniature effects out of the original pixel presentation', () => {
    // Given: the style override uses the same scene and contribution data.
    const scene = prepareTerrainScene(calendarFixture('2025-04-01', 31, 5), sceneOptions);
    // When: original pixel artwork is requested.
    const svg = renderTerrainScene(scene, 'dark', { artStyle: 'pixel', motion: 'full' });
    // Then: miniature-only textures and weather paths are absent.
    expect(svg).not.toMatch(/data-seasonal=|data-surface=|data-water-current=/);
  });
});
