import { describe, expect, it } from 'vitest';
import { compassBearing } from '../../src/tour/app/compass.js';

describe('north-up compass bearings', () => {
  it.each([
    [0, 'N · 0°'],
    [-Math.PI / 2, 'E · 90°'],
    [Math.PI, 'S · 180°'],
    [Math.PI / 2, 'W · 270°'],
    [-Math.PI / 4, 'NE · 45°'],
    [Math.PI / 4, 'NW · 315°'],
    [Math.PI * 2, 'N · 0°'],
    [-Math.PI * 4, 'N · 0°'],
  ])('shows the camera heading %s as %s', (heading, label) => {
    expect(compassBearing(heading).label).toBe(label);
  });

  it('wraps the north boundary without displaying 360 degrees', () => {
    expect(compassBearing(0.0001).label).toBe('N · 0°');
    expect(compassBearing(-0.0001).label).toBe('N · 0°');
  });
});
