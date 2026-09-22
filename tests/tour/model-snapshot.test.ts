import { describe, expect, it } from 'vitest';
import { parseTourSnapshot } from '../../src/tour/model/snapshot.js';
import { datesFrom, sceneFor, snapshotFor } from './model/helpers.js';

describe('tour snapshot boundary', () => {
  it('prepares the original scene when a snapshot includes a partial rolling year and a literal title', () => {
    // Given: real Calendar records with a title that must remain inert data.
    const snapshot = snapshotFor(['2025-12-31', '2026-01-04'], {
      title: '<img src=x onerror=alert(1)>',
    });

    // When: the serialized snapshot enters the tour boundary.
    const model = parseTourSnapshot(JSON.stringify(snapshot));

    // Then: settings and canonical identities are retained without interpretation.
    expect(model.scene).toEqual(sceneFor(snapshot));
    expect(model.scene.settings.title).toBe('<img src=x onerror=alert(1)>');
  });

  it.each([
    ['empty records', []],
    ['801 observed dates', datesFrom('2025-01-01', 801)],
    ['a sparse span over 800 dates', ['0001-01-01', '9999-12-31']],
    ['801 days of span with two records', ['2025-01-01', '2027-03-12']],
  ])('rejects %s before generating dense biome geometry', (_label, dates) => {
    // Given: a well-formed snapshot exceeding the tour's scene capacity.
    const snapshot = snapshotFor(dates);

    // When / Then: capacity is rejected at the input boundary.
    expect(() => parseTourSnapshot(snapshot)).toThrow(/800|at least one/i);
  });

  it('allows a full span of exactly 800 dates while retaining only observed records', () => {
    // Given: two observed dates at the inclusive span limit.
    const dates = datesFrom('2025-01-01', 800);
    const final = dates.at(-1);
    if (!final) throw new RangeError('Expected fixture endpoint');
    const snapshot = snapshotFor(['2025-01-01', final]);

    // When: the tour parses this sparse history.
    const model = parseTourSnapshot(snapshot);

    // Then: missing days remain absent and capacity accepts the exact boundary.
    expect(model.cells).toHaveLength(2);
  });

  it.each(['{broken', null, { kind: 'maeul-world' }, ' '.repeat(2 * 1024 * 1024 + 1)])(
    'rejects malformed, incompatible or oversized input',
    (input) => {
      // Given / When / Then: invalid external JSON cannot become a tour.
      expect(() => parseTourSnapshot(input)).toThrow();
    },
  );
});
