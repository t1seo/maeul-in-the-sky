import { describe, expect, it } from 'vitest';
import { SaxesParser } from 'saxes';
import type {
  ConsistencyEffectKind,
  SceneConsistencyEffect,
  SceneWonderPlacement,
  TerrainScene,
} from '../../../../src/core/scene-types.js';
import { EPIC_CATALOG } from '../../../../src/themes/terrain/epics/catalog.js';
import { getTerrainPalette100 } from '../../../../src/themes/terrain/palette.js';
import { prepareTerrainScene } from '../../../../src/themes/terrain/scene/prepare.js';
import { renderPresentation } from '../../../../src/themes/terrain/scene/presentation.js';
import { calendarFixture, sceneOptions } from './fixtures.js';

function wonder(catalogId: string, date = '2025-01-01'): SceneWonderPlacement {
  return {
    id: `${catalogId}:${date}`,
    catalogId,
    anchorDate: date,
    week: 0,
    day: 3,
    cx: 0,
    cy: 0,
    footprint: { x: -8, y: -16, width: 16, height: 20 },
    drawOrder: 0,
    variant: 0,
    animated: true,
    tier: 'rare',
    thresholds: [],
    explanation: '',
  };
}

function effect(kind: ConsistencyEffectKind, date = '2025-01-01'): SceneConsistencyEffect {
  return {
    id: `${kind}:${date}`,
    kind,
    anchorDate: date,
    week: 0,
    day: 3,
    cx: 0,
    cy: 0,
    tier: 1,
    activeDays: 5,
    particles: [{ x: 0, y: 0, size: 1 }],
    footprint: { x: -2, y: -2, width: 4, height: 4 },
  };
}

const base = prepareTerrainScene(calendarFixture('2025-01-01', 365, 100), sceneOptions);
const palette = getTerrainPalette100('light');

function tags(content: string, className: string) {
  const matches: Readonly<Record<string, string>>[] = [];
  const parser = new SaxesParser({ xmlns: false });
  parser.on('opentag', (tag) => {
    if (tag.attributes.class === className) matches.push(tag.attributes);
  });
  parser.write(`<svg xmlns="http://www.w3.org/2000/svg">${content}</svg>`).close();
  return matches;
}

function discovered(content: string): readonly string[] {
  return tags(content, 'collection-badge').map((tag) => tag['data-collection-id']);
}

describe('actual landscape collection', () => {
  it('counts recognized catalog IDs once across duplicate dates and ignores unknown IDs', () => {
    const scene = {
      ...base,
      wonders: [
        wonder('mountFuji'),
        wonder('mountFuji', '2025-01-02'),
        wonder('worldTree'),
        wonder('constructor'),
        wonder('futureWonder'),
        wonder('<script>alert(1)</script>'),
      ],
    };
    const content = renderPresentation(scene, palette);
    expect(discovered(content)).toEqual(['worldTree', 'mountFuji']);
    expect(tags(content, 'village-collection')[0]?.['data-discovered-count']).toBe('2');
    expect(tags(content, 'village-collection')[0]?.['data-catalog-count']).toBe('30');
    expect(content).toContain('World tree (Legendary)');
    expect(content).toContain('Mount Fuji (Rare)');
    expect(content).not.toContain('futureWonder');
    expect(content).not.toContain('<script>');
  });

  it('does not infer discoveries from high stats, ordinary decorations, or seasonal dates', () => {
    const content = renderPresentation({ ...base, wonders: [], consistencyEffects: [] }, palette);
    expect(discovered(content)).toEqual([]);
    expect(tags(content, 'village-collection')[0]?.['data-discovered-count']).toBe('0');
    expect(tags(content, 'collection-season').map((tag) => tag['data-state'])).toEqual([
      'unseen',
      'unseen',
      'unseen',
      'unseen',
    ]);
    expect(content).toContain('30 not seen here');
    expect(content).not.toMatch(/next unlock|complete|guaranteed/i);
  });

  it('deduplicates only the actual four seasonal effect kinds', () => {
    const content = renderPresentation(
      {
        ...base,
        wonders: [],
        consistencyEffects: [
          effect('springPetals'),
          { ...effect('springPetals', '2025-04-02'), tier: 3 },
          effect('winterFrost'),
        ],
      },
      palette,
    );
    const tokens = tags(content, 'collection-season');
    expect(
      tokens.filter((tag) => tag['data-state'] === 'discovered').map((tag) => tag['data-kind']),
    ).toEqual(['springPetals', 'winterFrost']);
    expect(tokens).toHaveLength(4);
    expect(content).toContain('Spring petals; Winter frost');
    expect(content).not.toContain('Rain');
  });

  it('distinguishes old scenes without effect metadata from recorded empty discoveries', () => {
    const { consistencyEffects: _effects, ...legacy } = base;
    const content = renderPresentation(legacy, palette);
    expect(
      tags(content, 'collection-season').every((tag) => tag['data-state'] === 'unrecorded'),
    ).toBe(true);
    expect(content).toContain('Seasonal auras not recorded in this landscape.');
    expect(content).not.toContain('0 of 4');
  });

  it('keeps only current frame placements even when an earlier render had more discoveries', () => {
    renderPresentation({ ...base, wonders: [wonder('mountFuji'), wonder('worldTree')] }, palette);
    const content = renderPresentation(
      { ...base, wonders: [wonder('mountFuji')], consistencyEffects: [] },
      palette,
    );
    expect(discovered(content)).toEqual(['mountFuji']);
    expect(content).not.toContain('World tree');
    expect(content).toContain('In this landscape');
  });

  it('never mutates the prepared scene, its arrays, or its placements', () => {
    const scene: TerrainScene = Object.freeze({
      ...base,
      wonders: Object.freeze([
        Object.freeze(wonder('worldTree')),
        Object.freeze(wonder('mountFuji')),
      ]),
      consistencyEffects: Object.freeze([Object.freeze(effect('winterFrost'))]),
    });
    const before = structuredClone(scene);
    renderPresentation(scene, palette);
    renderPresentation(scene, getTerrainPalette100('dark'));
    expect(scene).toEqual(before);
  });

  it.each(['banner', 'card'] as const)(
    'caps %s badges while retaining every name and rarity',
    (layout) => {
      const content = renderPresentation(
        {
          ...base,
          settings: { ...base.settings, layout },
          wonders: EPIC_CATALOG.map((entry) => wonder(entry.id)),
        },
        palette,
      );
      expect(discovered(content)).toHaveLength(3);
      expect(tags(content, 'village-collection')[0]?.['data-discovered-count']).toBe('30');
      expect(content).toContain('+27 more');
      for (const entry of EPIC_CATALOG) {
        const rarity = entry.tier[0].toUpperCase() + entry.tier.slice(1);
        expect(tags(content, 'village-collection')[0]?.['aria-label']).toContain(
          `${entry.displayName} (${rarity})`,
        );
      }
    },
  );

  it('preserves discovery order across array order, lighting, layout, and motion settings', () => {
    const wonders = [wonder('mountFuji'), wonder('ancientPortal'), wonder('aurora')];
    const expected = ['ancientPortal', 'aurora', 'mountFuji'];
    for (const mode of ['dark', 'light'] as const) {
      for (const layout of ['banner', 'card'] as const) {
        for (const motion of ['off', 'subtle', 'full'] as const) {
          const scene = {
            ...base,
            wonders: [...wonders].reverse(),
            settings: { ...base.settings, layout, motion },
          };
          expect(discovered(renderPresentation(scene, getTerrainPalette100(mode)))).toEqual(
            expected,
          );
        }
      }
    }
  });

  it('preserves empty and zero-contribution explanations without invented discoveries', () => {
    for (const count of [0, 1]) {
      const scene = prepareTerrainScene(calendarFixture('2025-01-01', count, 0), sceneOptions);
      const content = renderPresentation(scene, palette);
      expect(discovered(content)).toEqual([]);
      expect(content).toContain(
        count ? 'Garden decorations · 0 contributions' : 'No contribution dates supplied',
      );
    }
  });
});
