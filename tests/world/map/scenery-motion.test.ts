import { expect, it } from 'vitest';
import { SaxesParser } from 'saxes';
import { renderMapFrame } from '../../../src/world/map/render.js';
import { mapFrame, mapScene, mapView } from './fixtures.js';

function elements(svg: string): readonly Record<string, string>[] {
  const result: Record<string, string>[] = [];
  const parser = new SaxesParser();
  parser.on('opentag', (tag) => result.push({ ...tag.attributes, name: tag.name }));
  parser.write(svg).close();
  return result;
}

it.each([
  ['spring', ['petal', 'butterfly', 'flower']],
  ['summer', ['butterfly', 'flower']],
  ['autumn', ['leaf']],
] as const)(
  'places %s life around its own terrain with a bounded particle budget',
  (season, kinds) => {
    const view = { ...mapView, seasonOverride: season, weather: 'clear' as const };
    const particles = elements(renderMapFrame(mapScene, mapFrame, view)).filter(
      (element) => element['data-scenery-motion'],
    );
    expect(new Set(particles.map((particle) => particle['data-scenery-motion']))).toEqual(
      new Set(kinds),
    );
    expect(particles.length).toBeLessThanOrEqual(24);
    expect(
      particles.every((particle) => particle['data-region-id'] === mapScene.regions[0].id),
    ).toBe(true);
  },
);

it.each(['rain', 'snow'] as const)(
  'captures a deterministic still of moving %s without animation scripts',
  (weather) => {
    const view = { ...mapView, weather, elapsedSeconds: 4 };
    const svg = renderMapFrame(mapScene, mapFrame, view, { namespace: 'motion-postcard' });
    const first = elements(svg).find((element) => element['data-scenery-motion'] === weather);
    const next = elements(renderMapFrame(mapScene, mapFrame, { ...view, elapsedSeconds: 8 })).find(
      (element) => element['data-scenery-motion'] === weather,
    );
    expect(first).toBeDefined();
    expect(first?.transform).not.toBe(next?.transform);
    expect(renderMapFrame(mapScene, mapFrame, view, { namespace: 'motion-postcard' })).toBe(svg);
    expect(svg).not.toMatch(/<animate|<script|<foreignObject|@keyframes/);
  },
);

it('reduces decorative work on the low quality setting', () => {
  const view = { ...mapView, seasonOverride: 'spring' as const, weather: 'rain' as const };
  const count = (quality: 'low' | 'high'): number =>
    elements(renderMapFrame(mapScene, mapFrame, { ...view, quality })).filter(
      (element) => element['data-scenery-motion'],
    ).length;
  expect(count('low')).toBeLessThan(count('high'));
});

it.each(['north', 'south'] as const)(
  'localizes seasonal weather to each month in the %s hemisphere',
  (hemisphere) => {
    const months = ['2024-02', '2024-04', '2024-07', '2024-10'];
    const regions = months.map((monthKey) => ({
      ...mapScene.regions[0],
      id: `nature:${monthKey}`,
      monthKey,
    }));
    const tiles = regions.map((region, index) => ({
      ...mapFrame.terrain.tiles[0],
      id: `tile:${region.monthKey}`,
      regionId: region.id,
      position: { x: index * 3, y: 0.5, z: 0 },
    }));
    const scene = { ...mapScene, regions, settings: { ...mapScene.settings, hemisphere } };
    const frame = { ...mapFrame, terrain: { ...mapFrame.terrain, tiles } };
    const tags = elements(renderMapFrame(scene, frame, { ...mapView, weather: 'seasonal' }));
    const kinds = (month: string): Set<string> =>
      new Set(
        tags
          .filter((tag) => tag['data-region-id'] === `nature:${month}`)
          .map((tag) => tag['data-scenery-motion']),
      );
    expect(kinds('2024-02').has(hemisphere === 'north' ? 'snow' : 'rain')).toBe(true);
    expect(kinds('2024-07').has(hemisphere === 'north' ? 'rain' : 'snow')).toBe(true);
    expect(kinds('2024-04').has(hemisphere === 'north' ? 'petal' : 'leaf')).toBe(true);
    expect(kinds('2024-10').has(hemisphere === 'north' ? 'leaf' : 'petal')).toBe(true);
  },
);

it('renders organic ground textures and flowing river bands without flashing opacity', () => {
  const surfaces = ['grass', 'field', 'sand', 'rock', 'path', 'water'] as const;
  const tiles = surfaces.map((surface, index) => ({
    ...mapFrame.terrain.tiles[0],
    id: `texture:${surface}`,
    surface,
    position: { x: index, y: 0.4, z: 0 },
  }));
  const waterways = [
    {
      id: 'stream',
      islandId: mapScene.islands[0].id,
      kind: 'river' as const,
      width: 0.2,
      points: [
        { x: 0, y: 0.5, z: 0 },
        { x: 1, y: 0.5, z: 0.3 },
        { x: 2, y: 0.5, z: 0 },
      ],
    },
  ];
  const frame = { ...mapFrame, terrain: { ...mapFrame.terrain, tiles, waterways } };
  const svg = renderMapFrame(mapScene, frame, mapView, { namespace: 'textured-world' });
  const tags = elements(svg);
  expect(new Set(tags.map((tag) => tag['data-ground-texture']).filter(Boolean))).toEqual(
    new Set(surfaces),
  );
  const currents = tags.filter((tag) => tag['data-water-current']);
  expect(currents.length).toBeGreaterThan(0);
  expect(currents.every((tag) => tag.d.includes('Q'))).toBe(true);
  const later = elements(renderMapFrame(mapScene, frame, { ...mapView, elapsedSeconds: 6 })).filter(
    (tag) => tag['data-water-current'],
  );
  expect(later[0]['stroke-dashoffset']).not.toBe(currents[0]['stroke-dashoffset']);
  expect(later[0].opacity).toBe(currents[0].opacity);
});

it('fills a pond basin with water and separates its open currents from the shoreline', () => {
  const pond = {
    id: 'pond',
    islandId: mapScene.islands[0].id,
    kind: 'pond' as const,
    width: 0.8,
    points: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: -1 },
      { x: 2, y: 0, z: 0 },
      { x: 1, y: 0, z: 1 },
      { x: 0, y: 0, z: 0 },
    ],
  };
  const frame = { ...mapFrame, terrain: { ...mapFrame.terrain, waterways: [pond] } };
  const tags = elements(renderMapFrame(mapScene, frame, mapView));
  const basin = tags.find((tag) => tag['data-water-surface'] === 'pond');
  expect(basin?.fill).toMatch(/^url\(#/);
  const currents = tags.filter((tag) => tag['data-water-current']);
  expect(currents.length).toBeGreaterThan(0);
  expect(currents.every((tag) => tag.d !== basin?.d && !tag.d.endsWith('Z'))).toBe(true);
});
