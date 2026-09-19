import { Raycaster, Vector3 } from 'three';
import { expect, it } from 'vitest';
import { buildWorld, defaultWorldView, frameWorld } from '../../../../src/world/model/index.js';
import { createWorldGeometry } from '../../../../src/world/three/geometry/index.js';
import { visibleGeometryBounds } from '../../../../src/world/three/camera-fit.js';
import { inputFor, sequence } from '../../model/helpers.js';
import { waterfallMesh } from './waterfall-fixtures.js';

it('keeps all circular sky waterfall ends visible beyond the opaque island underside', () => {
  // Given
  const input = inputFor(sequence('2024-01-01', 366, 25));
  const scene = buildWorld({
    ...input,
    settings: { ...input.settings, layout: 'seasonal-circle' },
  });
  const world = createWorldGeometry(scene);
  const view = { ...defaultWorldView(scene), elapsedSeconds: 3 };
  world.update(frameWorld(scene, view), view);
  const water = waterfallMesh(world.content, 'waterways');
  const cliffs = waterfallMesh(world.content, 'terrain:cliffs');
  const bounds = visibleGeometryBounds(world.content);
  const falls = scene.terrain.waterways.filter((waterway) => waterway.kind === 'waterfall');
  // When
  const samples = falls.flatMap((fall) => {
    const mouth = fall.points[0];
    const end = fall.points.at(-1);
    const river = scene.terrain.waterways.find(
      (waterway) =>
        waterway.kind === 'river' &&
        waterway.points.at(-1)?.x === mouth?.x &&
        waterway.points.at(-1)?.z === mouth?.z,
    );
    const previous = river?.points.at(-2);
    if (!mouth || !end || !previous) throw new TypeError('Missing circular waterfall mouth');
    const outward = new Vector3(mouth.x - previous.x, 0, mouth.z - previous.z).normalize();
    return [0.5, 0.95].map((progress) => {
      const target = new Vector3(
        mouth.x + (end.x - mouth.x) * progress,
        mouth.y + (end.y - mouth.y) * progress,
        mouth.z + (end.z - mouth.z) * progress,
      );
      const origin = target.clone().addScaledVector(outward, 2);
      const hits = new Raycaster(origin, outward.clone().negate()).intersectObjects([
        cliffs,
        water,
      ]);
      return { visible: hits[0]?.object === water, end: new Vector3(end.x, end.y - 0.6, end.z) };
    });
  });
  // Then
  expect(falls).toHaveLength(4);
  expect(samples.every((sample) => sample.visible)).toBe(true);
  expect(samples.every((sample) => bounds.containsPoint(sample.end))).toBe(true);
  world.dispose();
});
