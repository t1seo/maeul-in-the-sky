import { describe, expect, it } from 'vitest';
import {
  createWorldDocument,
  parseWorldDocument,
  serializeWorldDocument,
} from '../../../src/world/data/document.js';
import { buildWorld, defaultWorldView, frameWorld } from '../../../src/world/model/index.js';
import { MAX_WORLD_BYTES } from '../../../src/world/data/json.js';
import { inputFor, sequence } from '../model/helpers.js';
import { worldDocumentFixture } from './world-fixture.js';

describe('seasonal world file compatibility', () => {
  it.each(['north', 'south'] as const)(
    'roundtrips thirteen %s months, selected date and replay through schema one',
    (hemisphere) => {
      const input = inputFor(sequence('2024-09-19', 366, 10), 2025);
      const scene = buildWorld({
        ...input,
        settings: { ...input.settings, layout: 'seasonal', hemisphere },
      });
      const view = {
        ...defaultWorldView(scene),
        cursorDate: '2025-01-15',
        selectedId: 'day:2024-12-31',
        focus: { kind: 'day' as const, date: '2024-12-31' },
        elapsedSeconds: 12.5,
      };
      const document = createWorldDocument({
        scene,
        sourceSnapshot: input.snapshot,
        view,
        savedAt: '2026-09-19T00:00:00Z',
      });
      const json = serializeWorldDocument(document);
      const restored = parseWorldDocument(json);
      expect(restored).toEqual(document);
      expect(restored.scene.settings.layout).toBe('seasonal');
      expect(restored.schemaVersion).toBe(1);
      expect(restored.scene).toMatchObject({
        schemaVersion: 1,
        generatorVersion: 1,
        modelVersion: 1,
      });
      expect(restored.scene.islands.flatMap((island) => island.monthKeys)).toHaveLength(13);
      expect(frameWorld(restored.scene, restored.view)).toEqual(frameWorld(scene, view));
      expect(Buffer.byteLength(json)).toBeLessThan(MAX_WORLD_BYTES);
    },
  );

  it.each(['archipelago', 'island'] as const)(
    'still accepts old frozen %s files without regenerating geometry',
    (layout) => {
      const legacy = worldDocumentFixture();
      const document = {
        ...legacy,
        scene: { ...legacy.scene, settings: { ...legacy.scene.settings, layout } },
      };
      const restored = parseWorldDocument(JSON.stringify(document));
      expect(restored).toEqual(document);
      expect(restored.scene.terrain.tiles).toEqual(legacy.scene.terrain.tiles);
    },
  );

  it('rejects unsupported layout values without relaxing the additive enum', () => {
    const document = worldDocumentFixture();
    expect(() =>
      parseWorldDocument({
        ...document,
        scene: {
          ...document.scene,
          settings: { ...document.scene.settings, layout: 'unknown-layout' },
        },
      }),
    ).toThrow(expect.objectContaining({ code: 'invalid_input' }));
  });
});
