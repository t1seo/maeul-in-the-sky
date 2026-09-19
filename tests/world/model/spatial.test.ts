import { describe, expect, it } from 'vitest';
import {
  buildWorld,
  defaultWorldView,
  frameWorld,
  sampleActor,
} from '../../../src/world/model/index.js';
import { inputFor, sequence } from './helpers.js';

describe('world space and paths', () => {
  it.each(['archipelago', 'island'] as const)(
    'builds owned coherent nature-led terrain for %s',
    (layout) => {
      const input = inputFor(sequence('2024-01-01', 366, 100));
      const scene = buildWorld({ ...input, settings: { ...input.settings, layout } });
      const land = scene.terrain.tiles.filter((tile) => tile.surface !== 'water');
      const natureIds = new Set(
        scene.regions.filter((region) => region.kind === 'nature').map((region) => region.id),
      );
      expect(
        land.filter((tile) => natureIds.has(tile.regionId)).length / land.length,
      ).toBeGreaterThanOrEqual(0.74);
      expect(scene.islands).toHaveLength(layout === 'island' ? 1 : 12);
      expect(new Set(scene.regions.flatMap((region) => region.tileIds)).size).toBe(
        scene.terrain.tiles.length,
      );
      expect(scene.regions.flatMap((region) => region.tileIds)).toHaveLength(
        scene.terrain.tiles.length,
      );
      expect(new Set(scene.terrain.waterways.map((water) => water.kind))).toEqual(
        new Set(['river', 'pond', 'waterfall']),
      );
    },
  );

  it('keeps the same reserved dated identities between layouts', () => {
    const input = inputFor([['2024-03-01', 1]]);
    const scene = buildWorld({ ...input, settings: { ...input.settings, layout: 'island' } });
    expect(scene.days.map((day) => day.id)).toEqual(buildWorld(input).days.map((day) => day.id));
  });

  it('grounds rail, walk and water paths on connected nodes with real polyline lengths', () => {
    const scene = buildWorld(inputFor(sequence('2024-01-01', 31, 20)));
    for (const route of scene.routes) {
      const nodes = route.nodeIds.map((id) => scene.routeNodes.find((node) => node.id === id));
      expect(nodes.every(Boolean)).toBe(true);
      expect(route.points[0]).toEqual(nodes[0]?.position);
      expect(route.points.at(-1)).toEqual(nodes.at(-1)?.position);
      const length = route.points.slice(1).reduce((sum, point, index) => {
        const prior = route.points[index];
        return sum + Math.hypot(point.x - prior.x, point.y - prior.y, point.z - prior.z);
      }, 0);
      expect(route.length).toBeCloseTo(length, 8);
      expect(route.length).toBeGreaterThan(0);
      for (const point of route.points) {
        const tile = scene.terrain.tiles.find(
          (tile) =>
            Math.abs(tile.position.x - point.x) < 0.01 &&
            Math.abs(tile.position.z - point.z) < 0.01,
        );
        expect(tile).toBeDefined();
        if (route.kind === 'water') expect(tile?.surface).toBe('water');
        else expect(tile?.surface).toBe('path');
        expect(point.y).toBeCloseTo(tile?.position.y ?? -99, 5);
      }
    }
    expect(new Set(scene.routes.map((route) => route.kind))).toEqual(
      new Set(['walk', 'rail', 'water']),
    );
  });

  it('samples actors deterministically at every route segment and reflected endpoint', () => {
    const scene = buildWorld(inputFor(sequence('2024-01-01', 31, 20)));
    for (const actor of scene.actors) {
      const route = scene.routes.find((route) => route.id === actor.routeId);
      expect(route).toBeDefined();
      if (!route) continue;
      const start = sampleActor({ ...actor, phase: 0 }, route, 0);
      const end = sampleActor({ ...actor, phase: 0 }, route, route.length / actor.speed);
      expect(start.position).toEqual(route.points[0]);
      expect(end.position).toEqual(route.points.at(-1));
      for (let index = 0; index <= 100; index += 1) {
        const time = (index * route.length) / actor.speed / 50;
        const sample = sampleActor(actor, route, time);
        expect(sample).toEqual(sampleActor(actor, route, time));
        expect(Number.isFinite(sample.yaw)).toBe(true);
        expect(sample.position.y).toBeCloseTo(route.points[0].y, 5);
      }
    }
    expect(new Set(scene.actors.map((actor) => actor.kind))).toEqual(
      new Set(['train', 'ferry', 'wildlife', 'resident']),
    );
  });

  it('adds distinct frozen models and context-owned courtyards, piers and stairs', () => {
    const scene = buildWorld(inputFor(sequence('2024-01-01', 366, 50)));
    const kinds = new Set(scene.entities.map((entity) => entity.kind));
    expect(kinds).toEqual(expect.objectContaining(new Set(['courtyard', 'pier', 'stair'])));
    for (const kind of ['courtyard', 'pier', 'stair']) {
      const attachment = scene.entities.find((entity) => entity.kind === kind);
      expect(attachment?.parentId).toBeDefined();
      expect(scene.entities.some((entity) => entity.id === attachment?.parentId)).toBe(true);
    }
    expect(
      new Set(scene.entities.flatMap((entity) => (entity.catalogId ? [entity.catalogId] : [])))
        .size,
    ).toBeGreaterThan(12);
    expect(
      scene.modelRecipes.every((recipe) => recipe.version === 1 && recipe.parts.length > 0),
    ).toBe(true);
  });

  it.each(['subtle', 'off'] as const)(
    'preserves the paused actor position in %s without changing world geometry',
    (motion) => {
      const scene = buildWorld(inputFor(sequence('2024-01-01', 31, 20)));
      const view = { ...defaultWorldView(scene), motion, elapsedSeconds: 37 };
      expect(frameWorld(scene, { ...view, motion: 'full' }).actors).toEqual(
        frameWorld(scene, view).actors,
      );
      expect(frameWorld(scene, { ...view, lighting: 'night', weather: 'snow' }).terrain).toEqual(
        frameWorld(scene, view).terrain,
      );
    },
  );
});
