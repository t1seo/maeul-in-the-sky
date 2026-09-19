import { expect, it } from 'vitest';
import { SaxesParser } from 'saxes';
import { renderMapFrame } from '../../../src/world/map/render.js';
import { focusView, mapTransform, project } from '../../../src/world/map/projection.js';
import { sampleSnapshot } from '../../../src/demo/sample.js';
import {
  buildWorld,
  defaultWorldSettings,
  defaultWorldView,
  frameWorld,
} from '../../../src/world/model/index.js';
import { mapFrame, mapScene, mapView } from './fixtures.js';

it('fills a portrait interactive viewport without postcard bands or letterboxing', () => {
  const viewport = { width: 390, height: 520 };
  const svg = renderMapFrame(mapScene, mapFrame, mapView, { viewport, caption: false });
  const tags: Record<string, string>[] = [];
  const parser = new SaxesParser();
  parser.on('opentag', (tag) => tags.push({ ...tag.attributes, name: tag.name }));
  parser.write(svg).close();
  expect(tags[0].viewBox).toBe('0 0 390 520');
  expect(tags.find((tag) => tag.name === 'rect')).toMatchObject({ width: '390', height: '520' });
  expect(tags.some((tag) => tag.class === 'map-viewport-frame')).toBe(false);
});

it.each([
  { width: 390, height: 520 },
  { width: 920, height: 420 },
])('centers the real camera target within a $width by $height host', (viewport) => {
  const transform = mapTransform(mapScene, mapView, viewport);
  const target = project(mapView.camera.target);
  expect(target.x * transform.scale + transform.x).toBeCloseTo(viewport.width / 2);
  expect(target.y * transform.scale + transform.y).toBeCloseTo(viewport.height * 0.55);
});

it('frames the selected month across most of the available portrait width', () => {
  const snapshot = sampleSnapshot();
  const scene = buildWorld({
    snapshot,
    settings: defaultWorldSettings(snapshot),
    repositories: [],
  });
  const view = defaultWorldView(scene);
  const viewport = { width: 366, height: 420 };
  const focused = focusView(
    scene,
    frameWorld(scene, view),
    view,
    { kind: 'month', monthKey: '2025-03' },
    viewport,
  );
  const scale = mapTransform(scene, focused, viewport).scale;
  const tiles = scene.terrain.tiles.filter((tile) => tile.regionId.includes('2025-03'));
  const edges = tiles.flatMap((tile) => [
    project({
      ...tile.position,
      x: tile.position.x - tile.size / 2,
      z: tile.position.z + tile.size / 2,
    }).x,
    project({
      ...tile.position,
      x: tile.position.x + tile.size / 2,
      z: tile.position.z - tile.size / 2,
    }).x,
  ]);
  const fraction = ((Math.max(...edges) - Math.min(...edges)) * scale) / viewport.width;
  expect(fraction).toBeGreaterThan(0.7);
  expect(fraction).toBeLessThanOrEqual(0.85);
});

it('adapts a new day focus to the host aspect instead of using a fixed magnification', () => {
  const focus = { kind: 'day' as const, date: '2024-02-29' };
  const portrait = focusView(mapScene, mapFrame, mapView, focus, { width: 390, height: 520 });
  const landscape = focusView(mapScene, mapFrame, mapView, focus, { width: 920, height: 420 });
  expect(portrait.camera.target).toEqual(landscape.camera.target);
  expect(portrait.camera.zoom).not.toBe(landscape.camera.zoom);
  expect(portrait.camera.zoom).toBeLessThanOrEqual(12);
  expect(landscape.camera.zoom).toBeGreaterThanOrEqual(0.45);
});
