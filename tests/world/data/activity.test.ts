import { expect, it } from 'vitest';
import { parseSnapshot } from '../../../src/core/settings/parse.js';
import { TINY_WORLD_INPUT } from '../../../src/world/model/fixture.js';
import { importWorldData } from '../../../src/world/data/imports.js';
import { parseWorldDocument, serializeWorldDocument } from '../../../src/world/data/document.js';

it('preserves monthly evidence in portable worlds without changing their landscape or identity', () => {
  const original = TINY_WORLD_INPUT.snapshot;
  const from = '2024-02-28T00:00:00.000Z';
  const to = '2024-02-29T23:59:59.999Z';
  const activity = {
    source: 'github-contributions',
    from,
    to,
    months: [
      {
        month: '2024-02',
        from,
        to,
        commits: 3,
        pullRequests: 1,
        issues: 0,
        reviews: 1,
        repositories: 0,
        restricted: 0,
      },
    ],
  };
  const enriched = parseSnapshot({ ...original, activity });
  const [oldWorld] = importWorldData(original).documents;
  const [newWorld] = importWorldData(enriched).documents;
  expect(newWorld).toBeDefined();
  if (!newWorld) throw new Error('Expected one imported world');
  expect(newWorld.scene).toEqual(oldWorld?.scene);
  const restored = parseWorldDocument(serializeWorldDocument(newWorld));
  expect(restored.sourceSnapshot.activity).toEqual(activity);
  expect(restored.sourceSnapshot.weeks).toEqual(original.weeks);
});
