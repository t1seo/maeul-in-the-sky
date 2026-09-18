import { describe, expect, it } from 'vitest';
import { prepareTerrainScene, renderTerrainScene } from '../../../../src/themes/terrain/index.js';
import { calendarFixture, sceneOptions } from './fixtures.js';

function placementIds(svg: string): string[] {
  return [...svg.matchAll(/data-placement-id="([^"]+)"/g)].map((match) => match[1]);
}

describe('art style at the prepared scene boundary', () => {
  it('changes the artwork without recomputing or mutating the prepared village', () => {
    const scene = prepareTerrainScene(calendarFixture('2025-04-01', 14, 25), sceneOptions);
    const saved = JSON.stringify(scene);
    const miniature = renderTerrainScene(scene, 'light', { artStyle: 'miniature' });
    const pixel = renderTerrainScene(scene, 'light', { artStyle: 'pixel' });
    expect(pixel).toContain('data-art-style="pixel"');
    expect(pixel).toContain('data-pixel-grid="0.5"');
    expect(miniature).not.toContain('data-pixel-grid');
    expect(placementIds(pixel)).toEqual(placementIds(miniature));
    expect(JSON.stringify(scene)).toBe(saved);
  });

  it('uses the requested presentation when changing a pixel scene back to miniature', () => {
    const scene = prepareTerrainScene(calendarFixture('2025-10-01', 7, 50), {
      ...sceneOptions,
      artStyle: 'pixel',
      style: 'korean',
    });
    const svg = renderTerrainScene(scene, 'dark', { artStyle: 'miniature' });
    expect(svg).toContain('data-art-style="miniature"');
    expect(svg).not.toContain('data-pixel-grid');
    expect(svg).toContain('data-reward-tier="5"');
    expect(svg).not.toContain('class="daily-rewards" shape-rendering="crispEdges"');
  });
});
