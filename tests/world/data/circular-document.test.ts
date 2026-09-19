import { describe, expect, it } from 'vitest';
import { buildWorld, defaultWorldView, frameWorld } from '../../../src/world/model/index.js';
import {
  createWorldDocument,
  parseWorldDocument,
  serializeWorldDocument,
} from '../../../src/world/data/document.js';
import { MAX_WORLD_BYTES } from '../../../src/world/data/json.js';
import { circleInput } from '../model/circular-fixture.js';
import { inputFor, sequence } from '../model/helpers.js';

describe('circular world document compatibility', () => {
  it.each([366, 793])(
    'roundtrips %i observations and frozen scene/view through version one',
    (count) => {
      // Given
      const input = circleInput(
        inputFor(sequence(count === 366 ? '2024-09-19' : '2023-12-01', count, 50), 2025),
      );
      const scene = buildWorld(input);
      const view = {
        ...defaultWorldView(scene),
        cursorDate: '2025-01-15',
        selectedId: 'day:2024-12-31',
        elapsedSeconds: 12.5,
      };
      const document = createWorldDocument({
        scene,
        sourceSnapshot: input.snapshot,
        view,
        savedAt: '2026-09-19T00:00:00Z',
      });
      // When
      const json = serializeWorldDocument(document);
      const restored = parseWorldDocument(json);
      // Then
      expect(restored).toEqual(document);
      expect(restored.scene).toMatchObject({
        schemaVersion: 1,
        generatorVersion: 1,
        modelVersion: 1,
        settings: { layout: 'seasonal-circle' },
      });
      expect(frameWorld(restored.scene, restored.view)).toEqual(frameWorld(scene, view));
      expect(Buffer.byteLength(json)).toBeLessThan(MAX_WORLD_BYTES);
    },
  );
});
