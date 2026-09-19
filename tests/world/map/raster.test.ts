import { spawnSync } from 'node:child_process';
import { expect, it } from 'vitest';
import { sampleSnapshot } from '../../../src/demo/sample.js';
import {
  buildWorld,
  defaultWorldSettings,
  defaultWorldView,
  frameWorld,
} from '../../../src/world/model/index.js';
import { renderMapSvg } from '../../../src/world/map/render.js';
import { focusView } from '../../../src/world/map/projection.js';

it('rasterizes a zoomed annual postcard with offscreen islands in an independent process', () => {
  const base = sampleSnapshot();
  const snapshot = {
    ...base,
    weeks: base.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => ({ ...day, count: 75 })),
    })),
  };
  const scene = buildWorld({
    snapshot,
    settings: defaultWorldSettings(snapshot),
    repositories: [],
  });
  const view = {
    ...defaultWorldView(scene),
    motion: 'off' as const,
    seasonOverride: 'spring' as const,
  };
  const focused = focusView(scene, frameWorld(scene, view), view, {
    kind: 'month',
    monthKey: '2025-04',
  });
  const svg = renderMapSvg(scene, focused, { width: 1600, height: 1040 });
  const raster = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    import { readFileSync } from 'node:fs';
    import { Resvg } from '@resvg/resvg-js';
    const image = new Resvg(readFileSync(0)).render();
    process.stdout.write(JSON.stringify({ width: image.width, height: image.height, painted: new Set(image.pixels).size > 100 }));
  `,
    ],
    { input: svg, encoding: 'utf8', timeout: 5000 },
  );
  expect(raster.status, raster.stderr).toBe(0);
  expect(JSON.parse(raster.stdout)).toEqual({ width: 1600, height: 1040, painted: true });
});
