import { describe, expect, it } from 'vitest';
import { createTourAsset } from '../../src/tour/assets/index.js';
import { TOUR_COLORS } from '../../src/tour/assets/palette.js';
import { villageAsset } from '../../src/tour/authored/village.js';
import type { TourPlacement } from '../../src/tour/types.js';

function placement(id: string): TourPlacement {
  return {
    source: {
      id: `day:${id}`,
      catalogId: id,
      anchorDate: '2026-06-04',
      week: 2,
      day: 4,
      cx: 2,
      cy: 4,
      footprint: { x: 0, y: 0, width: 1, height: 1 },
      drawOrder: 1,
      variant: 0,
      animated: false,
    },
    position: { x: 0, y: 0, z: 0 },
    season: 'summer',
    kind: 'asset',
  };
}

const upgrades = [
  'house',
  'houseB',
  'barn',
  'warehouse',
  'inn',
  'tavern',
  'blacksmith',
  'stable',
  'silo',
  'windmill',
  'windmillGrand',
  'tower',
  'market',
  'well',
  'barrel',
  'fence',
  'haybale',
  'haystack',
  'campfire',
  'tent',
  'torch',
  'iceCreamCart',
  'castle',
  'colosseum',
  'pagoda',
  'torii',
  'cart',
  'wagon',
  'lantern',
  'winterLantern',
  'fountain',
  'frozenFountain',
  'hanok',
  'hanokGate',
  'gatehouse',
  'onggi',
  'houseWinter',
  'houseBWinter',
  'barnWinter',
  'church',
] as const;

describe('semantic authored village mapping', () => {
  it.each(upgrades)(
    'selects local external geometry for %s without mutating dated source identity',
    (id) => {
      // Given a dated source asset.
      const original = placement(id);
      const before = JSON.stringify(original);
      // When the external model is selected.
      const definition = villageAsset(original, createTourAsset(id, 0, 'summer'));
      // Then it has a local bounded model and the calendar remains intact.
      expect(definition?.parts.length).toBeGreaterThan(0);
      for (const part of definition?.parts ?? []) {
        expect(part.file).toMatch(/^village\/[a-z-]+\.glb$/);
        expect(part.height).toBeGreaterThan(0);
        expect(part.maxSpan).toBeGreaterThan(0);
      }
      expect(JSON.stringify(original)).toBe(before);
    },
  );

  it.each([
    'hut',
    'choga',
    'pavilion',
    'shrine',
    'library',
    'clocktower',
    'cathedral',
    'koreanWatermill',
    'watermill',
    'hanokEstate',
    'manor',
    'jangseung',
    'sotdae',
    'eiffelTower',
  ])('keeps %s when no quality-approved equivalent exists', (id) => {
    // Given a culturally or functionally distinct building.
    const original = placement(id);
    // When the replacement catalog is consulted.
    const definition = villageAsset(original, createTourAsset(id, 0, 'summer'));
    // Then it cannot silently become an unrelated house or landmark.
    expect(definition).toBeNull();
  });

  it.each(['hanokGate', 'gatehouse', 'torii', 'colosseum'])(
    'preserves a passable %s entrance',
    (id) => {
      const definition = villageAsset(placement(id), createTourAsset(id, 0, 'summer'));
      expect(definition?.collider).toBeNull();
    },
  );

  it('keeps a varied group of glazed jars on their stone terrace', () => {
    const definition = villageAsset(placement('onggi'), createTourAsset('onggi', 0, 'summer'));
    expect(new Set(definition?.parts.map((part) => part.file)).size).toBe(4);
    expect(definition?.parts.length).toBeGreaterThanOrEqual(4);
  });

  it('keeps the original flame when the campfire solid base changes', () => {
    const fallback = createTourAsset('campfire', 0, 'summer');
    const definition = villageAsset(placement('campfire'), fallback);
    expect(definition?.retainedParts).toEqual(
      fallback.recipe.parts.filter(
        (part) => part.color === TOUR_COLORS.red || part.color === TOUR_COLORS.glow,
      ),
    );
  });

  it('shows ice without active streams for the frozen fountain', () => {
    const definition = villageAsset(
      placement('frozenFountain'),
      createTourAsset('frozenFountain', 0, 'winter'),
    );
    expect(definition?.retainedParts.some((part) => part.color === TOUR_COLORS.ice)).toBe(true);
    expect(definition?.retainedParts.some((part) => part.color === TOUR_COLORS.waterLight)).toBe(
      false,
    );
  });

  it('fits both water surfaces inside the authored fountain basins', () => {
    const fallback = createTourAsset('fountain', 0, 'summer');
    const definition = villageAsset(placement('fountain'), fallback);
    const surfaces = definition?.retainedParts.filter((part) => part.color === TOUR_COLORS.water);
    expect(surfaces?.map((part) => part.position.y * fallback.scale)).toEqual([
      expect.closeTo(0.194),
      expect.closeTo(0.518),
    ]);
    expect(surfaces?.map((part) => part.size.x * fallback.scale)).toEqual([
      expect.closeTo(1.89),
      expect.closeTo(0.767),
    ]);
  });

  it.each(['houseWinter', 'houseBWinter', 'barnWinter'])(
    'keeps snow on the authored roof for %s',
    (id) => {
      const definition = villageAsset(placement(id), createTourAsset(id, 0, 'winter'));
      expect(definition?.parts[0].file).toMatch(/-snow\.glb$/);
      expect(definition?.retainedParts.some((part) => part.color === TOUR_COLORS.snow)).toBe(true);
    },
  );
});
