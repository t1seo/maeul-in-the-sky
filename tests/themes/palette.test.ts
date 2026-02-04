import { describe, it, expect } from 'vitest';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';

describe('TerrainPalette100', () => {
  const dark = getTerrainPalette100('dark');
  const light = getTerrainPalette100('light');

  it('returns flat height for ocean levels', () => {
    expect(dark.getHeight(0)).toBe(0);
    expect(dark.getHeight(5)).toBe(0);
  });

  it('returns increasing heights for land levels', () => {
    const h20 = dark.getHeight(20);
    const h50 = dark.getHeight(50);
    const h90 = dark.getHeight(90);
    expect(h20).toBeGreaterThan(0);
    expect(h50).toBeGreaterThan(h20);
    expect(h90).toBeGreaterThan(h50);
  });

  it('interpolates colors smoothly', () => {
    const e0 = dark.getElevation(0);
    const e50 = dark.getElevation(50);
    const e99 = dark.getElevation(99);
    expect(e0.top).not.toBe(e50.top);
    expect(e50.top).not.toBe(e99.top);
  });

  it('cloud has fill and stroke for visibility', () => {
    expect(dark.cloud.fill).toBeTruthy();
    expect(dark.cloud.stroke).toBeTruthy();
    expect(light.cloud.fill).toBeTruthy();
    expect(light.cloud.opacity).toBeGreaterThan(0.3);
  });

  it('has expanded asset colors', () => {
    expect(dark.assets.deer).toBeTruthy();
    expect(dark.assets.castle).toBeTruthy();
    expect(dark.assets.flower).toBeTruthy();
    expect(dark.assets.seagull).toBeTruthy();
  });
});
