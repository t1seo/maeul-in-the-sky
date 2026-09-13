import { describe, expect, it } from 'vitest';
import {
  parseGenerationSettings,
  parseGenerationYear,
  parseGenerationYears,
  parseOutputOptions,
} from '../../src/generate/options.js';

describe('adapter option boundaries', () => {
  it.each(['no', '0', '10000', '2024.5'])('rejects invalid year %s', (year) => {
    expect(() => parseGenerationYear(year)).toThrow('year');
  });
  it('leaves unspecified settings available for config precedence', () => {
    expect(parseGenerationSettings({})).not.toHaveProperty('preset', 'balanced');
    expect(parseOutputOptions({})).toEqual({ format: 'svg', scale: 2 });
  });
  it.each([
    { normalization: 'shared' },
    { normalization: 'fixed' },
    { maxCount: 10 },
    { normalization: 'fixed', maxCount: -1 },
    { style: 'modern' },
    { motion: 'sometimes' },
    { layout: 'wide' },
    { density: 11 },
    { preset: 'village' },
  ])('C13-invalid rejects explicit options %j', (request) => {
    expect(() => parseGenerationSettings(request)).toThrow();
  });
  it('accepts fixed normalization and the style alias', () => {
    expect(
      parseGenerationSettings({ normalization: 'fixed', maxCount: '12', villageStyle: 'korean' }),
    ).toMatchObject({ normalization: { kind: 'fixed', maxCount: 12 }, style: 'korean' });
  });
  it('requires 2–5 unique archive years', () => {
    expect(parseGenerationYears('2025,2024')).toEqual([2024, 2025]);
    for (const years of ['2024', '2024,2024', '2020,2021,2022,2023,2024,2025', '2024,no']) {
      expect(() => parseGenerationYears(years)).toThrow('years');
    }
  });
});
