import { describe, expect, it } from 'vitest';
import { computeP90Max, normalizeCount100 } from '../../../src/core/settings/normalization.js';

describe('shared normalization math', () => {
  it.each([
    [[], 1],
    [[0, 0], 1],
    [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10],
    [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 999], 10],
  ])('uses the existing positive P90 index for %j', (counts, expected) => {
    // Given
    const values: readonly number[] = counts;
    // When
    const result = computeP90Max(values);
    // Then
    expect(result).toBe(expected);
  });

  it.each([
    [0, 100, 0],
    [25, 100, 50],
    [100, 100, 99],
    [200, 100, 99],
  ])('maps count %i under maximum %i to %i', (count, max, expected) => {
    // Given
    const maxCount = max;
    // When
    const result = normalizeCount100(count, maxCount);
    // Then
    expect(result).toBe(expected);
  });
});
