import { describe, expect, it } from 'vitest';
import {
  buildWorld,
  defaultWorldView,
  frameWorld,
  parseWorldScene,
  sampleActor,
} from '../../../src/world/model/index.js';
import { inputFor, sequence } from './helpers.js';

describe('generated frozen scenes', () => {
  it.each(['archipelago', 'island'] as const)(
    'roundtrips real %s terrain, frozen recipes and replay frames',
    (layout) => {
      const input = inputFor(sequence('2024-01-01', 366, 50));
      const original = buildWorld({ ...input, settings: { ...input.settings, layout } });
      const saved: unknown = JSON.parse(JSON.stringify(original));
      const restored = parseWorldScene(saved);
      expect(restored).toEqual(original);
      const view = {
        ...defaultWorldView(original),
        cursorDate: '2024-05-12',
        elapsedSeconds: 31.75,
      };
      expect(frameWorld(restored, view)).toEqual(frameWorld(original, view));
    },
  );

  it('rejects invalid route graph, length, endpoints and model references', () => {
    const scene = buildWorld(inputFor(sequence('2024-01-01', 31, 3)));
    const route = scene.routes[0];
    expect(() =>
      parseWorldScene({
        ...scene,
        routes: [{ ...route, length: route.length + 1 }, ...scene.routes.slice(1)],
      }),
    ).toThrow();
    expect(() =>
      parseWorldScene({
        ...scene,
        routes: [
          { ...route, nodeIds: ['node:absent', ...route.nodeIds.slice(1)] },
          ...scene.routes.slice(1),
        ],
      }),
    ).toThrow();
    expect(() =>
      parseWorldScene({ ...scene, routes: [{ ...route, loop: true }, ...scene.routes.slice(1)] }),
    ).toThrow();
    const actor = scene.actors[0];
    expect(() =>
      parseWorldScene({
        ...scene,
        actors: [{ ...actor, routeId: 'route:absent' }, ...scene.actors.slice(1)],
      }),
    ).toThrow();
    expect(() =>
      parseWorldScene({
        ...scene,
        actors: [{ ...actor, modelKey: 'model:absent' }, ...scene.actors.slice(1)],
      }),
    ).toThrow();
  });

  it('samples a closed loop continuously and rejects wrong routes and invalid time', () => {
    const scene = buildWorld(inputFor(sequence('2024-01-01', 31, 3)));
    const route = scene.routes[0];
    const actor = scene.actors.find((actor) => actor.routeId === route.id);
    expect(actor).toBeDefined();
    if (!actor) return;
    const loop = {
      ...route,
      points: [...route.points, ...route.points.slice(0, -1).reverse()],
      length: route.length * 2,
      loop: true,
    };
    const start = sampleActor({ ...actor, phase: 0 }, loop, 0);
    expect(sampleActor({ ...actor, phase: 0 }, loop, loop.length / actor.speed).position).toEqual(
      start.position,
    );
    expect(sampleActor({ ...actor, phase: 0 }, loop, -1).position).toEqual(start.position);
    expect(() => sampleActor(actor, { ...route, id: 'route:wrong' }, 1)).toThrow();
    expect(() => sampleActor(actor, { ...route, length: 0 }, 1)).toThrow();
    expect(() => sampleActor(actor, route, NaN)).toThrow();
    expect(() =>
      sampleActor(actor, { ...route, points: [route.points[0], route.points[0]] }, 0),
    ).toThrow();
  });
});
