import { describe, expect, it } from 'vitest';
import { Resvg } from '@resvg/resvg-js';
import type { ScenePlacement, SceneWonderPlacement } from '../../../../src/core/scene-types.js';
import { prepareTerrainScene } from '../../../../src/themes/terrain/index.js';
import { sceneDrawList, renderDepthLayer } from '../../../../src/themes/terrain/scene/depth.js';
import { neighborhoodPaths } from '../../../../src/themes/terrain/scene/neighborhood.js';
import { getTerrainPalette100 } from '../../../../src/themes/terrain/palette.js';
import { withMotionContext } from '../../../../src/core/animation.js';
import { calendarFixture, sceneOptions } from './fixtures.js';

function house(date: string, week: number, day: number): ScenePlacement {
  return {
    id: `house-${date}`,
    catalogId: 'house',
    anchorDate: date,
    week,
    day,
    cx: (week - day) * 8,
    cy: (week + day) * 3.5,
    drawOrder: week + day,
    footprint: { x: -8, y: -20, width: 16, height: 24 },
    variant: 0,
    animated: false,
  };
}

const base = prepareTerrainScene(calendarFixture('2025-01-05', 21, 4), sceneOptions);
const foreground: ScenePlacement = { ...house('2025-01-13', 1, 1), catalogId: 'hanok' };
const wonder: SceneWonderPlacement = {
  ...house('2025-01-05', 0, 0),
  id: 'wonder-behind',
  catalogId: 'giantSequoia',
  tier: 'rare',
  thresholds: [],
  explanation: 'Controlled depth fixture',
};
const palette = getTerrainPalette100('light');
const palettes = [palette, palette, palette];
const isoCells = base.cells.map((cell) => ({
  ...cell,
  colors: palette.getElevation(cell.level100),
}));

function pixels(placements: ScenePlacement[], wonders: SceneWonderPlacement[]) {
  const layer = withMotionContext({ mode: 'off', namespace: 'depth' }, () =>
    renderDepthLayer({ ...base, placements, wonders, neighborhoodPaths: [] }, isoCells, palettes),
  );
  return new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="180" viewBox="-40 -60 80 90">${layer}</svg>`,
    { font: { loadSystemFonts: false } },
  ).render().pixels;
}

describe('Given a tall Wonder behind a foreground house', () => {
  it('orders every drawable by ground depth when preparing the render list', () => {
    const list = sceneDrawList({
      placements: [foreground],
      wonders: [wonder],
      neighborhoodPaths: [],
    });
    expect(list.map((item) => item.value.id)).toEqual(['wonder-behind', foreground.id]);
  });

  it('shows foreground house pixels over actual overlapping Wonder pixels', () => {
    const combined = pixels([foreground], [wonder]);
    const houseOnly = pixels([foreground], []);
    const wonderOnly = pixels([], [wonder]);
    let correctlyOccluded = 0;
    for (let i = 0; i < combined.length; i += 4) {
      if (houseOnly[i + 3] < 250 || wonderOnly[i + 3] < 250) continue;
      const roof = houseOnly.subarray(i, i + 4);
      const tree = wonderOnly.subarray(i, i + 4);
      if (!roof.equals(tree) && combined.subarray(i, i + 4).equals(roof)) correctlyOccluded++;
    }
    expect(correctlyOccluded).toBeGreaterThan(10);
  });
});

describe('Given neighboring actual residences', () => {
  const dry = new Map(
    base.cells.map((cell) => [
      `${cell.week},${cell.day}`,
      { isRiver: false, isPond: false, nearWater: false, forestDensity: 0 },
    ]),
  );
  const homes = [house('2025-01-05', 0, 0), house('2025-01-06', 0, 1), house('2025-01-07', 0, 2)];

  it('connects three homes with short paths when valid dry cells join them', () => {
    const paths = neighborhoodPaths(base.cells, homes, dry);
    expect(paths.filter((path) => path.catalogId === 'neighborhood:path')).toHaveLength(2);
    expect(paths.every((path) => path.points.length <= 4)).toBe(true);
  });

  it('never bridges a missing contribution date as if it were a supplied terrain cell', () => {
    const paths = neighborhoodPaths(
      base.cells.filter((cell) => cell.date !== '2025-01-06'),
      homes,
      dry,
    );
    expect(paths).toHaveLength(0);
  });

  it('places a waterside deck only beside a known water cell at compatible elevation', () => {
    const water = new Map(dry);
    water.set('0,0', { isRiver: false, isPond: false, nearWater: true, forestDensity: 0 });
    water.set('0,1', { isRiver: true, isPond: false, nearWater: false, forestDensity: 0 });
    const paths = neighborhoodPaths(base.cells, homes.slice(0, 1), water);
    expect(paths).toHaveLength(1);
    expect(paths[0].catalogId).toBe('neighborhood:deck');
  });
});
