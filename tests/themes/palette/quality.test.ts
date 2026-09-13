import { describe, expect, it } from 'vitest';
import {
  getSeasonalPalette100,
  getTerrainPalette100,
} from '../../../src/themes/terrain/palette.js';
import { auditPaletteColors } from './quality.js';
import { modes } from './snapshot.js';

describe('palette authoring quality', () => {
  it.each(modes)('keeps every %s seasonal color finite and inside sRGB', (mode) => {
    // Given: all discrete seasonal weeks, including the repeated edge week.
    const palettes = Array.from({ length: 53 }, (_, week) => getSeasonalPalette100(mode, week));
    // When: Culori parses every asset, face, text, background, and cloud color.
    const audits = palettes.map(auditPaletteColors);
    // Then: the authored and interpolated values remain displayable CSS colors.
    expect(audits.every((audit) => audit.checkedColors > 500)).toBe(true);
    expect(audits.flatMap((audit) => audit.invalidColors)).toEqual([]);
  });

  it.each(modes)('maintains readable %s text against the subtle background', (mode) => {
    // Given: text colors are unaffected by seasons.
    const palette = getTerrainPalette100(mode);
    // When: contrast is measured against the authored subtle background.
    const { textContrast } = auditPaletteColors(palette);
    // Then: each text role satisfies the 4.5:1 minimum used by this authoring check.
    for (const contrast of Object.values(textContrast)) {
      expect(Number.isFinite(contrast)).toBe(true);
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(['rgb(NaN,0,0)', 'color(srgb 1.2 0 0)', '#xyz'])(
    'rejects an invalid authored color %s',
    (color) => {
      // Given: an author accidentally enters a malformed or out-of-gamut asset color.
      const palette = getTerrainPalette100('dark');
      palette.assets.pine = color;
      // When: the quality utility checks this candidate palette.
      const audit = auditPaletteColors(palette);
      // Then: it identifies the field without silently clamping the source value.
      expect(audit.invalidColors).toEqual(['assets.pine']);
    },
  );
});
