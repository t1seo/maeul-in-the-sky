import { expect, it } from 'vitest';
import { parseWorldView } from '../../../src/world/data/view.js';
import { worldDocumentFixture } from './world-fixture.js';

it.each(['seasonal', 'clear', 'rain', 'snow'] as const)('restores saved %s weather', (weather) => {
  const { scene, view } = worldDocumentFixture();
  expect(parseWorldView({ ...view, weather }, scene).weather).toBe(weather);
});

it('rejects unknown saved weather without weakening the view boundary', () => {
  const { scene, view } = worldDocumentFixture();
  expect(() => parseWorldView({ ...view, weather: 'hail' }, scene)).toThrow(
    expect.objectContaining({ code: 'invalid_input' }),
  );
});

it('restores a selected moving actor and its follow camera', () => {
  const { scene, view } = worldDocumentFixture();
  const actor = {
    id: 'train',
    kind: 'train' as const,
    modelKey: 'train',
    routeId: 'rail',
    speed: 1,
    phase: 0,
    visibleFrom: scene.range.from,
  };
  expect(
    parseWorldView(
      {
        ...view,
        focus: { kind: 'actor', actorId: actor.id },
        selectedId: actor.id,
        followActorId: actor.id,
      },
      { ...scene, actors: [actor] },
    ).followActorId,
  ).toBe('train');
});

it('restores real month, day and entity focus with a selected source date', () => {
  const { view, scene } = worldDocumentFixture();
  for (const focus of [
    { kind: 'world' },
    { kind: 'month', monthKey: '2024-02' },
    { kind: 'day', date: '2024-02-29' },
    { kind: 'entity', entityId: scene.entities[0].id },
  ])
    expect(parseWorldView({ ...view, focus, selectedId: '2024-02-29' }, scene).focus).toEqual(
      focus,
    );
});

it.each([
  { cursorDate: '2024-03-01' },
  { cursorDate: '2024-02-30' },
  { selectedId: 'absent' },
  { followActorId: 'absent' },
  { focus: { kind: 'month', monthKey: '2024-03' } },
  { focus: { kind: 'day', date: '2024-03-01' } },
  { focus: { kind: 'entity', entityId: 'absent' } },
  { focus: { kind: 'actor', actorId: 'absent' } },
  { elapsedSeconds: -1 },
])('rejects a saved view outside the frozen scene: %j', (changes) => {
  const { view, scene } = worldDocumentFixture();
  expect(() => parseWorldView({ ...view, ...changes }, scene)).toThrow(
    expect.objectContaining({ code: 'invalid_input' }),
  );
});
