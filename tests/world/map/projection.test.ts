import { expect, it } from 'vitest';
import {
  boundsCenter,
  focusView,
  mapTransform,
  moveCamera,
  project,
  unprojectDelta,
} from '../../../src/world/map/projection.js';
import { mapFrame, mapScene, mapView } from './fixtures.js';

it('roundtrips ground-plane camera movement without changing height', () => {
  const movement = { x: 3.5, y: 0, z: -2.5 };
  const projected = project(movement);
  expect(unprojectDelta(projected.x, projected.y)).toEqual(movement);
});

it('fits a month and returns to the full-scene bounds on reset', () => {
  const focused = focusView(mapScene, mapFrame, mapView, { kind: 'month', monthKey: '2024-02' });
  expect(focused.focus.kind).toBe('month');
  expect(focused.camera.target).toEqual(boundsCenter(mapScene.bounds));
  const reset = focusView(mapScene, mapFrame, focused, { kind: 'world' });
  expect(reset.camera.zoom).toBe(1);
});

it('focuses actual visible entity and actor positions', () => {
  const entity = mapFrame.entities[0];
  expect(
    focusView(mapScene, mapFrame, mapView, { kind: 'entity', entityId: entity.id }).camera.target,
  ).toEqual(entity.position);
  const actor = {
    id: 'wildlife',
    kind: 'wildlife' as const,
    modelKey: 'deer',
    routeId: 'walk',
    speed: 1,
    phase: 0,
    visibleFrom: '2024-02-28',
    actorId: 'wildlife',
    position: { x: 1, y: 2, z: 3 },
    yaw: 0,
  };
  expect(
    focusView(mapScene, { ...mapFrame, actors: [actor] }, mapView, {
      kind: 'actor',
      actorId: actor.id,
    }).camera.target,
  ).toEqual(actor.position);
});

it('ignores stale focus identities instead of moving the camera to a fabricated position', () => {
  expect(focusView(mapScene, mapFrame, mapView, { kind: 'month', monthKey: '2024-03' })).toBe(
    mapView,
  );
  expect(focusView(mapScene, mapFrame, mapView, { kind: 'day', date: '2024-03-01' })).toBe(mapView);
  expect(focusView(mapScene, mapFrame, mapView, { kind: 'actor', actorId: 'gone' })).toBe(mapView);
});

it('bounds zoom while preserving camera translation and a finite projection', () => {
  const zoomed = moveCamera(mapView, { x: 5, y: 0, z: 2 }, 500);
  expect(zoomed.camera.zoom).toBe(12);
  expect(zoomed.camera.target.x).toBe(mapView.camera.target.x + 5);
  expect(mapTransform(mapScene, zoomed).scale).toBeGreaterThan(0);
});

it('leaves actor-follow mode when resetting to the whole world', () => {
  const following = { ...mapView, followActorId: 'actor:resident' };
  expect(focusView(mapScene, mapFrame, following, { kind: 'world' }).followActorId).toBeUndefined();
});
