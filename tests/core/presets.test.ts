import { describe, expect, it } from 'vitest';

import {
  DEFAULT_VILLAGE_PRESET,
  isVillagePreset,
  VILLAGE_PRESETS,
} from '../../src/core/presets.js';

describe('village presets', () => {
  it('keeps balanced as the density 5 default', () => {
    expect(DEFAULT_VILLAGE_PRESET).toBe('balanced');
    expect(VILLAGE_PRESETS.balanced.density).toBe(5);
  });

  it('orders the presets from nature to civilization', () => {
    expect(VILLAGE_PRESETS.nature.density).toBeLessThan(VILLAGE_PRESETS.balanced.density);
    expect(VILLAGE_PRESETS.balanced.density).toBeLessThan(VILLAGE_PRESETS.civilization.density);
  });

  it('recognizes only published preset names', () => {
    expect(isVillagePreset('nature')).toBe(true);
    expect(isVillagePreset('balanced')).toBe(true);
    expect(isVillagePreset('civilization')).toBe(true);
    expect(isVillagePreset('city')).toBe(false);
  });
});
