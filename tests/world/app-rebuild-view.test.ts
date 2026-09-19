import { expect, test } from 'vitest';
import { rebuildView } from '../../src/world/app/rebuild-view.js';
import { buildWorld, defaultWorldView } from '../../src/world/model/index.js';
import { TINY_WORLD_INPUT } from '../../src/world/model/fixture.js';
import { parseWorldView } from '../../src/world/data/view.js';

const scene = buildWorld(TINY_WORLD_INPUT);
const actor = scene.actors[0];
const entity = scene.entities[0];
const region = scene.regions[0];
if (!actor || !entity || !region)
  throw new Error('Generated fixtures must contain selectable places');
const view = { ...defaultWorldView(scene), motion: 'off' as const, elapsedSeconds: 8 };

test.each(['2024-02-28', 'day:2024-02-28', actor.id, entity.id, region.id])(
  'keeps an existing selection %s when reframing a replacement scene',
  (selectedId) => {
    const next = rebuildView(scene, { ...view, selectedId });
    expect(next.selectedId).toBe(selectedId);
    expect(parseWorldView(next, scene)).toEqual(next);
  },
);

test('drops removed references while preserving the latest date, atmosphere and clock', () => {
  const next = rebuildView(scene, {
    ...view,
    selectedId: 'removed',
    focus: { kind: 'entity', entityId: 'removed' },
    followActorId: 'removed',
    lighting: 'night',
    weather: 'rain',
    cursorDate: '2024-02-28',
  });
  expect(next).toMatchObject({
    cursorDate: '2024-02-28',
    lighting: 'night',
    weather: 'rain',
    motion: 'off',
    elapsedSeconds: 8,
    focus: { kind: 'world' },
    camera: defaultWorldView(scene).camera,
  });
  expect(next.selectedId).toBeUndefined();
  expect(next.followActorId).toBeUndefined();
  expect(parseWorldView(next, scene)).toEqual(next);
});

test('reframes the final layout from the original view rather than an intermediate camera', () => {
  const finalScene = buildWorld({
    ...TINY_WORLD_INPUT,
    settings: { ...scene.settings, layout: 'seasonal' },
  });
  const next = rebuildView(finalScene, {
    ...view,
    focus: { kind: 'actor', actorId: actor.id },
    followActorId: actor.id,
  });
  expect(next.camera).toEqual(defaultWorldView(finalScene).camera);
  expect(next.camera.target).not.toEqual(view.camera.target);
  expect(next.focus).toEqual({ kind: 'world' });
  expect(next.followActorId).toBeUndefined();
});
