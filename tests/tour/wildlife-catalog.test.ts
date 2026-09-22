import { expect, it } from 'vitest';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { parseTourSnapshot } from '../../src/tour/model/snapshot.js';
import { wildlifeSpecies } from '../../src/tour/wildlife/catalog.js';
import { requestedWildlife } from '../../src/tour/wildlife/library.js';

const REMAINING = [
  ['rabbit', 'rabbit'],
  ['goat', 'goat'],
  ['bird', 'bird'],
  ['chicken', 'chicken'],
  ['owl', 'owl'],
  ['seagull', 'seagull'],
  ['winterBird', 'bird'],
  ['heron', 'heron'],
  ['whale', 'whale'],
  ['frog', 'frog'],
  ['shellfish', 'shellfish'],
  ['fish', 'fish'],
  ['fishSchool', 'fish'],
  ['turtle', 'turtle'],
  ['crab', 'crab'],
  ['jellyfish', 'jellyfish'],
  ['butterfly', 'butterfly'],
  ['butterflyGarden', 'butterfly'],
  ['spider', 'spider'],
] as const;

it.each(REMAINING)(
  'loads authored %s as %s without changing the source catalog identity',
  (id, species) => {
    // Given a dated placement whose catalog ID may be a grouped or seasonal alias.
    // When the authored wildlife source is resolved.
    const selected = wildlifeSpecies(id);
    // Then every remaining animal has the correct reusable species model.
    expect(selected).toBe(species);
  },
);

it('requests only distinct species present in grouped and seasonal placements', () => {
  // Given several source placements sharing the same authored models.
  const model = parseTourSnapshot(sampleSnapshot());
  const anchor = model.placements[0];
  if (!anchor) throw new Error('Expected a sample placement');
  const placements = ['fish', 'fishSchool', 'bird', 'winterBird', 'barrel'].map((catalogId) => ({
    ...anchor,
    source: { ...anchor.source, catalogId },
  }));
  // When the model's download inventory is prepared.
  const requested = requestedWildlife({ ...model, placements });
  // Then groups do not download duplicate files and unrelated props request nothing.
  expect(requested.sort()).toEqual(['bird', 'fish']);
});
