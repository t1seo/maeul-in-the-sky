import { expect, test } from 'vitest';
import { buildWorld, defaultWorldView, frameWorld } from '../../../src/world/model/index.js';
import { focusView } from '../../../src/world/map/projection.js';
import { inputFor } from '../model/helpers.js';

test('focuses dated circle plots without including decorative seasonal filler', () => {
  const source = inputFor([['2024-02-28', 3]], 2024, { from: '2024-02-28', to: '2024-02-29' });
  const scene = buildWorld({
    ...source,
    settings: { ...source.settings, layout: 'seasonal-circle' },
  });
  const view = defaultWorldView(scene);
  const frame = frameWorld(scene, view);

  const focused = focusView(scene, frame, view, { kind: 'month', monthKey: '2024-02' });

  const positions = frame.terrain.tiles
    .filter((tile) => tile.date?.startsWith('2024-02-'))
    .map((tile) => tile.position);
  expect(focused.camera.target.x).toBe(
    (Math.min(...positions.map((point) => point.x)) +
      Math.max(...positions.map((point) => point.x))) /
      2,
  );
  expect(focused.camera.target.z).toBe(
    (Math.min(...positions.map((point) => point.z)) +
      Math.max(...positions.map((point) => point.z))) /
      2,
  );
  expect(focused.camera.zoom).toBeGreaterThan(view.camera.zoom);
});
