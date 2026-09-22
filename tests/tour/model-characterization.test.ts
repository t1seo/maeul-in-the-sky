import { describe, expect, it } from 'vitest';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { renderTerrainScene } from '../../src/themes/terrain/scene/render.js';
import { sceneFor, snapshotFor } from './model/helpers.js';

describe('canonical Calendar scene before the tour adapter', () => {
  it('preserves sparse dated cells and Sunday positions across a year boundary', () => {
    // Given: a partial first week, a missing date, and a following Sunday.
    const snapshot = snapshotFor(['2025-12-31', '2026-01-02', '2026-01-04']);

    // When: the existing released scene generator prepares the Calendar.
    const scene = sceneFor(snapshot);

    // Then: no missing day is invented and the first Sunday remains the origin.
    expect(scene.layoutVersion).toBe(3);
    expect(
      scene.cells.map(({ date, week, day, isoX, isoY }) => ({ date, week, day, isoX, isoY })),
    ).toEqual(
      expect.arrayContaining([
        { date: '2025-12-31', week: 0, day: 3, isoX: -24, isoY: 10.5 },
        { date: '2026-01-02', week: 0, day: 5, isoX: -40, isoY: 17.5 },
        { date: '2026-01-04', week: 1, day: 0, isoX: 8, isoY: 3.5 },
      ]),
    );
    expect(scene.cells).toHaveLength(3);
    expect(scene.cells.find((cell) => cell.date === '2025-12-31')?.count).toBe(0);
  });

  it('keeps layout identities when the same source is displayed in Day or Night', () => {
    // Given: the existing deterministic sample and its canonical placements.
    const snapshot = sampleSnapshot();
    const scene = sceneFor(snapshot);
    const identity = JSON.stringify(scene);

    // When: both existing SVG appearances are rendered.
    const light = renderTerrainScene(scene, 'light', { motion: 'off' });
    const dark = renderTerrainScene(scene, 'dark', { motion: 'off' });

    // Then: lighting changes presentation only, with the original calendar shape.
    expect(JSON.stringify(scene)).toBe(identity);
    expect(light).toContain('viewBox="0 0 840 240"');
    expect(dark).toContain('viewBox="0 0 840 240"');
    expect(scene.cells).toHaveLength(364);
    expect(scene.placements.length).toBeGreaterThan(100);
  });
});
