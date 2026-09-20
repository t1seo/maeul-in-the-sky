import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseSnapshot, snapshotToContributionData } from '../../src/core/settings/parse.js';
import {
  prepareTerrainScene,
  renderTerrain,
  renderTerrainScene,
} from '../../src/themes/terrain/index.js';
import { terrainMetadata } from '../../src/themes/terrain/scene/metadata.js';
import { createLandscapeProjection } from '../../src/themes/terrain/landscape/projection.js';
import { calendarFixture } from '../themes/terrain/scene/fixtures.js';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { riverDistance } from '../../src/themes/terrain/landscape/settlement-geometry.js';

function fixture(name: string) {
  return snapshotToContributionData(
    parseSnapshot(
      readFileSync(new URL(`../fixtures/improvements/${name}.json`, import.meta.url), 'utf8'),
    ),
  );
}

describe('unchanged calendar output', () => {
  it.each([
    [
      'partial-2025',
      '2a01e659d6bd9b8a12869f036f09df0bfa50ef1d10ae555c7972c69198acfdd4',
      '5636872b81c8dc195853547b90aea14c469ad3791d1578a41068829d42cc67a2',
    ],
    [
      'empty-2025',
      '20b108932ee776f352de80452fae92972200cfa4a850848dcc3ddb9398e34662',
      'e49df65ec64707a55280f3e72fe0c1c0861d250c801aa14a478be1bf851a5ea5',
    ],
    [
      'wonders-2025',
      '399d103d00c260aa680298fa67a190c557152fe5c92fffb7be106f2303e29a5b',
      '556bba241e20405b911bd717b11d2cb50ec1d5ff2f7d9530f373e60c13412fbb',
    ],
  ])('%s preserves the original dark/light SVG bytes', (name, dark, light) => {
    const result = renderTerrain(fixture(name));
    expect(createHash('sha256').update(result.dark).digest('hex')).toBe(dark);
    expect(createHash('sha256').update(result.light).digest('hex')).toBe(light);
  });
});

describe('production landscape scene', () => {
  it('describes actual river banks and land biomes without inventing ponds', () => {
    const scene = prepareTerrainScene(snapshotToContributionData(sampleSnapshot()), {
      terrainMode: 'landscape',
    });
    const geography = scene.geography;
    if (!geography) throw new Error('Expected a geographic scene');
    const metadata = terrainMetadata(scene);
    const onRiver = geography.model.plots.filter(
      (plot) => riverDistance(geography.model, plot.position) <= 0,
    );
    expect(onRiver.length).toBeGreaterThan(0);
    for (const plot of onRiver) {
      expect(metadata.cells.find(({ date }) => date === plot.date)?.biome).toMatchObject({
        isRiver: true,
        nearWater: true,
      });
    }
    expect(metadata.cells.every((cell) => !cell.biome.isPond)).toBe(true);
    for (const plot of geography.model.plots) {
      expect(metadata.cells.find(({ date }) => date === plot.date)?.biome.landscapeBiome).toBe(
        plot.position.biome,
      );
    }
  });

  it('keeps overlapping date coordinates when activity, density and the date window change', () => {
    const original = prepareTerrainScene(calendarFixture('2025-02-01', 12, 5), {
      terrainMode: 'landscape',
      density: 1,
    });
    const next = prepareTerrainScene(calendarFixture('2025-02-07', 12, 50), {
      terrainMode: 'landscape',
      density: 10,
    });
    for (const cell of original.cells.filter((cell) => cell.date >= '2025-02-07')) {
      expect(next.cells.find((candidate) => candidate.date === cell.date)).toMatchObject({
        isoX: cell.isoX,
        isoY: cell.isoY,
        height: cell.height,
      });
    }
  });

  it('reports the exact projected sprite and date positions used for the standalone image', () => {
    const scene = prepareTerrainScene(fixture('partial-2025'), { terrainMode: 'landscape' });
    const geography = scene.geography;
    if (!geography) throw new Error('Expected a geographic scene');
    const projection = createLandscapeProjection(geography.model);
    const metadata = terrainMetadata(scene);
    const placements = [
      ...metadata.placements,
      ...metadata.wonders,
      ...(metadata.rewards ?? []),
      ...(metadata.scenery ?? []),
    ];
    for (const sprite of geography.settlement.sprites) {
      const point = projection.point(sprite.position);
      expect(placements.find(({ id }) => id === sprite.id)).toMatchObject({
        cx: point.x,
        cy: point.y,
      });
    }
    for (const plot of geography.model.plots) {
      const point = projection.point(plot.position);
      expect(scene.cells.find(({ date }) => date === plot.date)).toMatchObject({
        isoX: point.x,
        isoY: point.y,
        height: plot.position.elevation,
      });
    }
  });

  it('preserves contribution and earned reward facts while changing geography', () => {
    const data = fixture('wonders-2025');
    const old = prepareTerrainScene(data, { motion: 'off' });
    const scene = prepareTerrainScene(data, { terrainMode: 'landscape', motion: 'off' });
    expect(scene.geography?.version).toBe(1);
    expect(scene.stats).toEqual(old.stats);
    expect(
      scene.cells.map(({ date, count, level100, rewardTier }) => ({
        date,
        count,
        level100,
        rewardTier,
      })),
    ).toEqual(
      old.cells.map(({ date, count, level100, rewardTier }) => ({
        date,
        count,
        level100,
        rewardTier,
      })),
    );
    expect(
      scene.wonders.map(({ id, catalogId, thresholds, anchorDate }) => ({
        id,
        catalogId,
        thresholds,
        anchorDate,
      })),
    ).toEqual(
      old.wonders.map(({ id, catalogId, thresholds, anchorDate }) => ({
        id,
        catalogId,
        thresholds,
        anchorDate,
      })),
    );
    expect(
      scene.rewards?.map(({ id, catalogId, rewardTier, count }) => ({
        id,
        catalogId,
        rewardTier,
        count,
      })),
    ).toEqual(
      old.rewards?.map(({ id, catalogId, rewardTier, count }) => ({
        id,
        catalogId,
        rewardTier,
        count,
      })),
    );
    expect(scene.cells).not.toEqual(old.cells);
    expect(scene.placements.map(({ cx, cy }) => [cx, cy])).not.toEqual(
      old.placements.map(({ cx, cy }) => [cx, cy]),
    );
  });

  it('replays JSON scenes into identical standalone light and dark images', () => {
    const scene = prepareTerrainScene(fixture('partial-2025'), {
      terrainMode: 'landscape',
      motion: 'off',
    });
    const restored: typeof scene = JSON.parse(JSON.stringify(scene));
    expect(restored).toEqual(scene);
    for (const mode of ['light', 'dark'] as const) {
      const svg = renderTerrainScene(scene, mode);
      expect(renderTerrainScene(restored, mode)).toBe(svg);
      expect(svg).toContain('data-terrain-mode="landscape"');
      expect(svg).not.toMatch(/<script|<foreignObject|NaN|Infinity|<animate|<set\b/);
    }
  });

  it.each(['empty-2025', 'no-days-2025'])('%s never invents activity or earned Wonders', (name) => {
    const result = renderTerrain(fixture(name), { terrainMode: 'landscape', motion: 'off' });
    expect(result.metadata.stats.total).toBe(0);
    expect(result.metadata.wonders).toHaveLength(0);
    expect(result.metadata.rewards).toHaveLength(0);
    expect(result.metadata.terrainMode).toBe('landscape');
    expect(result.dark).toContain('data-terrain-mode="landscape"');
  });
});
