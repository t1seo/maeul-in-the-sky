import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../../src/core/animation.js';
import {
  ASSET_CATALOG,
  renderCatalogAsset,
  renderAssetCSS,
} from '../../../src/themes/terrain/assets.js';
import { EPIC_CATALOG, EPIC_RENDERERS, renderEpicCSS } from '../../../src/themes/terrain/epics.js';
import { getTerrainPalette100 } from '../../../src/themes/terrain/palette.js';

const motionPattern = /<animate(?:Motion|Transform)?\b|@keyframes|animation(?:-[a-z]+)?\s*:/;
const shapes = (svg: string): number =>
  svg.match(/<(?:path|rect|circle|ellipse|polygon|polyline|line)\b/g)?.length ?? 0;

describe('C08 complete asset creation-site coverage', () => {
  it.each(['dark', 'light'] as const)(
    'retains every asset variant and removes motion for static %s',
    (color) => {
      // Given: every actual registered asset and all three deterministic variants.
      const palette = getTerrainPalette100(color);
      const leaks: string[] = [];
      const missingShapes: string[] = [];
      // When: each creation site is rendered under both restricted policies.
      for (const asset of ASSET_CATALOG) {
        for (const variant of [0, 1, 2]) {
          const render = (): string => renderCatalogAsset(asset.id, palette.assets, variant);
          const full = withMotionContext({ mode: 'full', namespace: '' }, render);
          for (const mode of ['subtle', 'off'] as const) {
            const svg = withMotionContext({ mode, namespace: '' }, render);
            if (motionPattern.test(svg)) leaks.push(`${asset.id}/${variant}/${mode}`);
            if (shapes(svg) !== shapes(full) || shapes(svg) === 0)
              missingShapes.push(`${asset.id}/${variant}/${mode}`);
          }
        }
      }
      // Then: no asset loses its base geometry or leaks animation into subtle/off.
      expect(leaks).toEqual([]);
      expect(missingShapes).toEqual([]);
    },
  );

  it.each(['subtle', 'off'] as const)('retains every Wonder without motion for %s', (mode) => {
    // Given: every registered Wonder, including animated portal geometry.
    const palette = getTerrainPalette100('dark');
    // When: each renderer executes under the restricted creation policy.
    const results = EPIC_CATALOG.map((wonder) => {
      const render = (): string => EPIC_RENDERERS[wonder.type](0, 0, palette.assets);
      const full = withMotionContext({ mode: 'full', namespace: '' }, render);
      const svg = withMotionContext({ mode, namespace: '' }, render);
      return {
        id: wonder.id,
        motion: motionPattern.test(svg),
        visible: shapes(svg) > 0 && shapes(svg) === shapes(full),
      };
    });
    // Then: every Wonder retains its complete static base and no animation.
    expect(results.filter((result) => result.motion || !result.visible)).toEqual([]);
    expect(
      withMotionContext({ mode, namespace: '' }, () => renderAssetCSS() + renderEpicCSS()),
    ).toBe('');
  });
});
