import { describe, expect, it } from 'vitest';
import { formatNumber } from '../../src/core/svg.js';

describe('fractional contribution scale labels', () => {
  it.each([
    [0.0001, '0.0001'],
    [1234.5678, '1,234.5678'],
    [0.5, '0.5'],
    [1234567, '1,234,567'],
    [2.5e-7, '2.5e-7'],
    [1e21, '1e+21'],
  ])('formats %s without grouping fractional digits', (value, expected) => {
    expect(formatNumber(value)).toBe(expected);
  });
});
