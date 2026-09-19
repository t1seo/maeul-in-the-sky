import { describe, expect, it } from 'vitest';
import { matchesGeneratedGeometry } from '../../scripts/profile/geometry-match.js';

describe('cross-runtime generated geometry agreement', () => {
  it('accepts only absolute non-integer machine roundoff', () => {
    expect(matchesGeneratedGeometry({ z: 0.05594157123356096 }, { z: 0.055941571233560965 })).toBe(
      true,
    );
    expect(matchesGeneratedGeometry({ z: 0.4 + 5e-13 }, { z: 0.4 })).toBe(true);
    expect(matchesGeneratedGeometry({ z: 0.4 + 2e-12 }, { z: 0.4 })).toBe(false);
    expect(matchesGeneratedGeometry({ z: 1000000.4 + 1e-7 }, { z: 1000000.4 })).toBe(false);
    expect(matchesGeneratedGeometry({ z: NaN }, { z: 0.4 })).toBe(false);
    expect(matchesGeneratedGeometry({ z: NaN }, { z: NaN })).toBe(false);
    expect(matchesGeneratedGeometry({ z: Infinity }, { z: Infinity })).toBe(false);
  });

  it('requires exact integer evidence, keys, array order and identities', () => {
    const source = { count: 0, id: 'day:2025-01-01', points: [0.4, 0.6] };
    for (const changed of [
      { ...source, count: 1e-14 },
      { ...source, id: 'day:2025-01-02' },
      { ...source, points: [0.6, 0.4] },
      { ...source, points: [0.4, 0.6, 0.7] },
      { ...source, extra: undefined },
      { id: source.id, points: source.points },
      { ...source, count: '0' },
    ])
      expect(matchesGeneratedGeometry(changed, source)).toBe(false);
  });
});
