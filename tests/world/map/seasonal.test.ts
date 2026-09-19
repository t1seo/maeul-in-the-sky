import { expect, it } from 'vitest';
import { SaxesParser } from 'saxes';
import { renderMapFrame } from '../../../src/world/map/render.js';
import { mapFrame, mapScene, mapView } from './fixtures.js';

function tileFills(svg: string): readonly string[] {
  const fills: string[] = [];
  const parser = new SaxesParser();
  parser.on('opentag', (tag) => {
    if (tag.attributes['data-tile-id']) fills.push(tag.attributes.fill);
  });
  parser.write(svg).close();
  return fills;
}

const february = mapScene.regions[0];
const summerRegion = { ...february, id: 'region:summer', monthKey: '2024-07' };
const scene = { ...mapScene, regions: [february, summerRegion] };
const winterTile = mapFrame.terrain.tiles[0];
const summerTile = {
  ...winterTile,
  id: 'tile:2024-07-01',
  date: '2024-07-01',
  regionId: summerRegion.id,
  position: { x: 2, y: 0.4, z: 0 },
};
const frame = { ...mapFrame, terrain: { ...mapFrame.terrain, tiles: [winterTile, summerTile] } };

it('presents distinct monthly seasons in the annual view without moving terrain', () => {
  const fills = tileFills(renderMapFrame(scene, frame, mapView));
  expect(fills[0]).not.toBe(fills[1]);
});

it('applies an explicit seasonal preview consistently across the world', () => {
  const fills = tileFills(renderMapFrame(scene, frame, { ...mapView, seasonOverride: 'autumn' }));
  expect(fills[0]).toBe(fills[1]);
});

it('retains real public project labels while escaping their XML characters', () => {
  const entity = {
    ...mapScene.entities[0],
    kind: 'repository' as const,
    label: 'owner/project <공개> & "release"',
    repoId: '123',
  };
  const svg = renderMapFrame(
    { ...mapScene, entities: [entity] },
    { ...mapFrame, entities: [entity] },
    mapView,
  );
  expect(svg).toContain('owner/project &lt;공개&gt; &amp; &quot;release&quot;');
  expect(svg).toContain('data-project-label="123"');
});
