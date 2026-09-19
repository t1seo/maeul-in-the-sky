import { expect, test } from 'vitest';
import { rebuildView } from '../../src/world/app/rebuild-view.js';
import { buildWorld, defaultWorldView } from '../../src/world/model/index.js';
import { TINY_WORLD_INPUT } from '../../src/world/model/fixture.js';
import type { WorldFocus } from '../../src/world/model/types.js';
import { parseWorldView } from '../../src/world/data/view.js';

const scene = buildWorld(TINY_WORLD_INPUT);
const actor = scene.actors[0];
const entity = scene.entities[0];
if (!actor || !entity) throw new Error('Generated fixtures must contain actors and entities');
const view = { ...defaultWorldView(scene), motion: 'off' as const, elapsedSeconds: 8 };
const valid: readonly WorldFocus[] = [
  { kind: 'world' },
  { kind: 'month', monthKey: '2024-02' },
  { kind: 'day', date: '2024-02-28' },
  { kind: 'entity', entityId: entity.id },
  { kind: 'actor', actorId: actor.id },
];
test.each(valid)('keeps a valid explicit $kind focus across a rebuild', (focus) => {
  const next = rebuildView(scene, { ...view, focus, followActorId: actor.id }, false);
  expect(next.focus).toEqual(focus);
  expect(next.followActorId).toBe(actor.id);
  expect(parseWorldView(next, scene)).toEqual(next);
});
const removed: readonly WorldFocus[] = [
  { kind: 'month', monthKey: '2030-01' },
  { kind: 'day', date: '2030-01-01' },
  { kind: 'entity', entityId: 'removed' },
  { kind: 'actor', actorId: 'removed' },
];
test.each(removed)('reframes removed $kind targets and keeps the world saveable', (focus) => {
  const next = rebuildView(
    scene,
    { ...view, focus, selectedId: 'removed', followActorId: 'removed' },
    false,
  );
  expect(next).toMatchObject({ focus: { kind: 'world' }, motion: 'off', elapsedSeconds: 8 });
  expect(next.selectedId).toBeUndefined();
  expect(next.followActorId).toBeUndefined();
  expect(parseWorldView(next, scene)).toEqual(next);
});
test('clears missing follow targets without discarding valid manual camera navigation', () => {
  const camera = { ...view.camera, zoom: 3 };
  const next = rebuildView(scene, { ...view, camera, followActorId: 'removed' }, false);
  expect(next.camera).toEqual(camera);
  expect(next.followActorId).toBeUndefined();
});
test('an untouched navigation resets to the complete new world even with a valid follow target', () => {
  const next = rebuildView(
    scene,
    { ...view, focus: valid[4] ?? { kind: 'world' }, followActorId: actor.id },
    true,
  );
  expect(next.focus).toEqual({ kind: 'world' });
  expect(next.followActorId).toBeUndefined();
  expect(next.camera).toEqual(defaultWorldView(scene).camera);
});
