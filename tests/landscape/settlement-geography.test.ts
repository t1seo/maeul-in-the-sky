import { describe, expect, it } from 'vitest';
import { snapshotToContributionData } from '../../src/core/settings/parse.js';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { buildLandscapeModel } from '../../src/themes/terrain/landscape/model.js';
import { planLandscapeSettlements } from '../../src/themes/terrain/landscape/settlements.js';
import { sampleLandscape } from '../../src/themes/terrain/landscape/sampling.js';
import {
  isLandscapeBuilding,
  landscapeSpriteScale,
} from '../../src/themes/terrain/landscape/sprite-size.js';
import { segmentDistance } from '../../src/themes/terrain/landscape/settlement-geometry.js';
import { prepareTerrainScene } from '../../src/themes/terrain/scene/prepare.js';
import { calendarFixture } from '../themes/terrain/scene/fixtures.js';

describe('settlements on drained geography', () => {
  it.each(['island', 'archipelago', 'valley'] as const)(
    'finds appropriately sized farmland in the actual sample %s',
    (landscapeLayout) => {
      const scene = prepareTerrainScene(snapshotToContributionData(sampleSnapshot()), {
        terrainMode: 'landscape',
        landscapeLayout,
        density: 7,
      });
      expect(scene.geography?.settlement.fields.length).toBeGreaterThanOrEqual(2);
    },
  );

  it.each(['classic', 'korean'] as const)(
    'gives an active %s village readable homes without inventing earned building facts',
    (style) => {
      const scene = prepareTerrainScene(snapshotToContributionData(sampleSnapshot()), {
        style,
        density: 7,
      });
      const model = buildLandscapeModel(scene.cells, {
        layout: 'island',
        seed: 41,
        relief: 1,
        roughness: 0.6,
      });
      const plan = planLandscapeSettlements(model, scene);
      const houses = plan.sprites.filter(
        (sprite) => sprite.kind === 'scenery' && isLandscapeBuilding(sprite.catalogId),
      );
      expect(houses.length).toBeGreaterThanOrEqual(6);
      expect(houses.every((house) => house.anchorDate === undefined)).toBe(true);
      expect(
        houses.every((house) =>
          style === 'korean'
            ? ['hanok', 'choga', 'pavilion'].includes(house.catalogId)
            : ['house', 'houseB', 'tavern', 'barn'].includes(house.catalogId),
        ),
      ).toBe(true);
      expect(plan.sprites.filter((sprite) => sprite.kind === 'asset')).toHaveLength(
        scene.placements.length,
      );
      for (const house of houses) {
        expect(
          plan.roads.every((road) =>
            road.points.every(
              (point, index) =>
                index === 0 ||
                segmentDistance(house.position, road.points[index - 1], point) > 1.05,
            ),
          ),
        ).toBe(true);
      }
    },
  );

  it('does not create decorative homes for observed zero days', () => {
    const scene = prepareTerrainScene(calendarFixture('2025-01-01', 120, 0));
    const model = buildLandscapeModel(scene.cells, {
      layout: 'island',
      seed: 41,
      relief: 1,
      roughness: 0.6,
    });
    const plan = planLandscapeSettlements(model, scene);
    expect(
      plan.sprites.filter(
        (sprite) => sprite.kind === 'scenery' && isLandscapeBuilding(sprite.catalogId),
      ),
    ).toEqual([]);
  });

  it.each(['island', 'archipelago', 'valley'] as const)(
    'preserves facts and grounds every road in %s',
    (layout) => {
      const scene = prepareTerrainScene(snapshotToContributionData(sampleSnapshot()));
      const model = buildLandscapeModel(scene.cells, {
        layout,
        seed: 41,
        relief: 1,
        roughness: 0.6,
      });
      const plan = planLandscapeSettlements(model, scene);
      expect(plan.sprites.filter((sprite) => sprite.kind === 'asset')).toHaveLength(
        scene.placements.length,
      );
      expect(plan.sprites.filter((sprite) => sprite.kind === 'reward')).toHaveLength(
        scene.rewards?.length ?? 0,
      );
      expect(plan.sprites.filter((sprite) => sprite.kind === 'wonder')).toHaveLength(
        scene.wonders.length,
      );
      for (const road of plan.roads) {
        const components = new Set<number>();
        for (const [index, point] of road.points.entries()) {
          const previous = road.points[Math.max(0, index - 1)];
          for (let step = 0; step <= 4; step++) {
            const sampled = sampleLandscape(
              model,
              previous.x + ((point.x - previous.x) * step) / 4,
              previous.z + ((point.z - previous.z) * step) / 4,
            );
            expect(sampled?.elevation).toBeGreaterThanOrEqual(0);
            if (sampled) components.add(sampled.component);
          }
        }
        expect(components.size).toBe(1);
      }
      for (const sprite of plan.sprites) expect(sprite.position.elevation).toBeGreaterThan(0);
    },
  );

  it('uses rice fields for Korean settlements while retaining original Korean asset identities', () => {
    const scene = prepareTerrainScene(snapshotToContributionData(sampleSnapshot()), {
      style: 'korean',
    });
    const model = buildLandscapeModel(scene.cells, {
      layout: 'island',
      seed: 41,
      relief: 1,
      roughness: 0.6,
    });
    const plan = planLandscapeSettlements(model, scene);
    expect(plan.fields.length).toBeGreaterThan(0);
    expect(plan.fields.every((field) => field.crop === 'rice')).toBe(true);
    expect(
      plan.sprites
        .filter((sprite) => sprite.kind === 'asset')
        .map((sprite) => sprite.catalogId)
        .sort(),
    ).toEqual(scene.placements.map((sprite) => sprite.catalogId).sort());
    expect(landscapeSpriteScale('hanok') * 20).toBe(32);
    expect(landscapeSpriteScale('house') * 10).toBe(32);
    expect(landscapeSpriteScale('colosseum') * 14).toBe(86);
    expect(landscapeSpriteScale('tower') * 13).toBeLessThanOrEqual(56);
  });

  it('never truncates genuine primary assets or daily rewards on a multi-year calendar', () => {
    const scene = prepareTerrainScene(calendarFixture('2000-01-01', 2000, 1), { density: 1 });
    const model = buildLandscapeModel(scene.cells, {
      layout: 'island',
      seed: 41,
      relief: 1,
      roughness: 0.6,
    });
    const plan = planLandscapeSettlements(model, scene);
    expect(plan.sprites.filter((sprite) => sprite.kind === 'reward')).toHaveLength(2000);
    expect(plan.sprites.filter((sprite) => sprite.kind === 'asset')).toHaveLength(
      scene.placements.length,
    );
    expect(new Set(plan.sprites.map((sprite) => sprite.id)).size).toBe(plan.sprites.length);
  });
});
