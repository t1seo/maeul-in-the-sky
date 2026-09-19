import { describe, expect, it } from 'vitest';
import { SaxesParser } from 'saxes';
import { sampleSnapshot } from '../../../src/demo/sample.js';
import {
  buildWorld,
  defaultWorldSettings,
  defaultWorldView,
  frameWorld,
} from '../../../src/world/model/index.js';
import { renderMapFrame, renderMapSvg } from '../../../src/world/map/render.js';
import { renderRecipe } from '../../../src/world/map/recipes.js';
import { mapFrame, mapScene, mapView } from './fixtures.js';
import type { ModelPart, WorldView } from '../../../src/world/model/types.js';

const sample = sampleSnapshot();
const snapshot = {
  ...sample,
  weeks: sample.weeks.map((week) => ({
    ...week,
    days: week.days.map((day) => ({ ...day, count: 75 })),
  })),
};
const scene = buildWorld({
  snapshot,
  settings: { ...defaultWorldSettings(snapshot), culture: 'korean' },
  repositories: [],
});

function tags(svg: string) {
  const result: Record<string, string>[] = [];
  const parser = new SaxesParser();
  parser.on('opentag', (tag) => result.push({ name: tag.name, ...tag.attributes }));
  parser.write(svg).close();
  return result;
}

describe('complete miniature landscape', () => {
  it('renders all thirteen rolling months with genuine catalog diversity and transit', () => {
    const view = { ...defaultWorldView(scene), motion: 'off' as const };
    const elements = tags(renderMapSvg(scene, view));
    expect(
      elements.filter((element) => element['data-day-id']).map((element) => element['data-date']),
    ).toEqual(scene.days.filter((day) => day.date <= view.cursorDate).map((day) => day.date));
    expect(elements.filter((element) => element['data-tile-id'])).toHaveLength(
      scene.terrain.tiles.length,
    );
    expect(elements.filter((element) => element['data-month-label'])).toHaveLength(13);
    const catalog = new Set(elements.map((element) => element['data-catalog-id']).filter(Boolean));
    expect(catalog.size).toBeGreaterThan(15);
    expect(catalog.has('hanok')).toBe(true);
    expect(new Set(elements.map((element) => element['data-actor-kind']).filter(Boolean))).toEqual(
      new Set(['train', 'ferry', 'resident', 'wildlife']),
    );
    expect(new Set(elements.map((element) => element['data-route-kind']).filter(Boolean))).toEqual(
      new Set(['walk', 'rail', 'water']),
    );
    expect(elements.some((element) => element['data-entity-kind'] === 'courtyard')).toBe(true);
    expect(elements.some((element) => element['data-entity-kind'] === 'stair')).toBe(true);
  });

  it.each(['spring', 'summer', 'autumn', 'winter'] as const)(
    'retains completed seasonal scenery in %s under weather and evening light',
    (season) => {
      const view: WorldView = {
        ...defaultWorldView(scene),
        seasonOverride: season,
        weather: season === 'winter' ? 'snow' : 'rain',
        lighting: season === 'spring' ? 'sunset' : 'night',
        quality: season === 'summer' ? 'low' : 'high',
        motion: 'off',
      };
      const frame = frameWorld(scene, view);
      const anchor = frame.entities[0];
      const seasonal = {
        ...frame,
        events: [
          {
            id: 'seasonal-test',
            kind: 'market' as const,
            anchorId: anchor.id,
            startsOn: frame.cursorDate,
            evidence: { kind: 'consistency' as const },
          },
        ],
      };
      const svg = renderMapFrame(scene, seasonal, view);
      const elements = tags(svg);
      expect(elements.some((element) => element['data-weather'] === view.weather)).toBe(true);
      expect(elements.some((element) => element['data-event-id'] === 'seasonal-test')).toBe(true);
      expect(svg).toContain('<title>market · Village gathering</title>');
      expect(
        elements.some((element) => element.name === 'animate' || element.name === 'script'),
      ).toBe(false);
    },
  );

  it('preserves wonder, generic recipe, and project-label representations independently of day targets', () => {
    const base = mapScene.entities[0];
    const entities = [
      { ...base, id: 'wonder', kind: 'wonder' as const, catalogId: 'sacredGrove' },
      {
        ...base,
        id: 'custom',
        kind: 'repository' as const,
        catalogId: undefined,
        label: undefined,
        repoId: 'public-repository-id',
      },
      { ...base, id: 'pier', kind: 'pier' as const },
      {
        ...base,
        id: 'fallback',
        kind: 'scenery' as const,
        catalogId: undefined,
        modelKey: 'absent',
      },
    ];
    const svg = renderMapFrame(
      { ...mapScene, discoveries: [], entities },
      { ...mapFrame, entities },
      mapView,
    );
    const elements = tags(svg);
    expect(elements.filter((element) => element['data-entity-id'])).toHaveLength(4);
    expect(elements.filter((element) => element['data-day-id'])).toHaveLength(2);
    expect(svg).toContain('public-repository-id');
  });

  it.each(['box', 'cylinder', 'cone', 'sphere', 'roof'] as const)(
    'renders a saved %s recipe into real self-contained vector geometry',
    (primitive) => {
      const part: ModelPart = {
        primitive,
        position: { x: 0, y: 1, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        size: { x: 1, y: 2, z: 1 },
        color: '#668877',
        roughness: 0.8,
        opacity: 1,
      };
      const svg = `<svg xmlns="http://www.w3.org/2000/svg">${renderRecipe({ key: 'portable', version: 1, parts: [part] })}</svg>`;
      const elements = tags(svg);
      expect(
        elements.some((element) => ['polygon', 'ellipse', 'path'].includes(element.name)),
      ).toBe(true);
      expect(svg).not.toMatch(/NaN|undefined|Infinity/);
    },
  );

  it('explains missing days while keeping background scenery out of the selectable calendar', () => {
    const day = { ...mapScene.days[0], kind: 'missing' as const };
    const svg = renderMapFrame(
      mapScene,
      { ...mapFrame, days: [day] },
      { ...mapView, selectedId: day.id },
    );
    expect(svg).toContain(`${day.date} · No observation`);
    expect(tags(svg).filter((element) => element['data-day-id'])).toHaveLength(1);
  });

  it('rejects unbounded postcard dimensions before producing a document', () => {
    expect(() => renderMapSvg(mapScene, mapView, { width: Infinity })).toThrow(RangeError);
  });
});
