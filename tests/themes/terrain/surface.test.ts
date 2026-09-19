import { describe, expect, it } from 'vitest';
import { prepareTerrainScene, renderTerrainScene } from '../../../src/themes/terrain/index.js';
import { calendarFixture, sceneOptions } from './scene/fixtures.js';

describe('miniature terrain surface rendering', () => {
  it('adds sparse soil detail without introducing per-cell filters or changing counts', () => {
    // Given: an empty contribution year with exposed ground.
    const scene = prepareTerrainScene(calendarFixture('2025-01-01', 365, 0), sceneOptions);
    const before = JSON.stringify(scene.cells);
    // When: the original banner is rendered with motion off.
    const svg = renderTerrainScene(scene, 'light');
    // Then: top faces have subtle material detail without animation or cell filters.
    expect(svg).toContain('data-surface="soil"');
    expect(svg.match(/data-surface=/g)?.length).toBeLessThanOrEqual(60);
    expect(svg).not.toContain('filter:brightness');
    expect(JSON.stringify(scene.cells)).toBe(before);
  });

  it.each(['full', 'subtle', 'off'] as const)(
    'moves only bounded current lines with %s motion',
    (motion) => {
      // Given: actual generated waterways with stable calendar/data geometry.
      const scene = prepareTerrainScene(calendarFixture('2025-07-01', 120, 5), sceneOptions);
      // When: the same original SVG is rendered for each motion policy.
      const svg = renderTerrainScene(scene, 'dark', { motion });
      // Then: current paths retain fixed geometry; no entire river polygon flashes.
      expect(svg).toContain('data-water-current="true"');
      expect(svg).not.toMatch(/<polygon[^>]*class="[^"]*(?:river-shimmer|water-\d)/);
      expect(svg).not.toContain('water-shimmer');
      if (motion === 'off') expect(svg).not.toMatch(/@keyframes|animation\s*:|<animate/);
      else expect(svg).toContain('stroke-dashoffset');
    },
  );
});
