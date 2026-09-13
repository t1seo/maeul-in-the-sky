import { expect, it } from 'vitest';
import { toIsoCells } from '../../../../src/themes/terrain/blocks.js';
import { getTerrainPalette100 } from '../../../../src/themes/terrain/palette.js';

it('rejects duplicate source dates when legacy callers request isometric cells directly', () => {
  const cell = { date: '2025-01-01', count: 4, level: 2 as const, level100: 40, x: 0, y: 0 };
  expect(() => toIsoCells([cell, cell], getTerrainPalette100('light'), 0, 0)).toThrow(/duplicate/i);
});
