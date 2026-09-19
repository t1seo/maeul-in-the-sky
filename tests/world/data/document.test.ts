import { describe, expect, it } from 'vitest';
import {
  createWorldDocument,
  parseWorldDocument,
  serializeWorldDocument,
} from '../../../src/world/data/document.js';
import { MAX_WORLD_BYTES } from '../../../src/world/data/json.js';
import { worldDocumentFixture, publicRepositoryFixture } from './world-fixture.js';

describe('the versioned public world envelope', () => {
  it('roundtrips frozen original evidence, geometry and view without touching caller state', () => {
    const input = worldDocumentFixture();
    const before = JSON.stringify(input);
    const parsed = parseWorldDocument(before);
    expect(parsed).toEqual(input);
    expect(Object.isFrozen(parsed.scene.entities[0].position)).toBe(true);
    expect(Object.isFrozen(parsed.sourceSnapshot.weeks[0].days)).toBe(true);
    expect(Object.isFrozen(parsed.view.camera)).toBe(true);
    expect(JSON.parse(serializeWorldDocument(parsed))).toEqual(input);
    expect(Object.isFrozen(input)).toBe(false);
    expect(JSON.stringify(input)).toBe(before);
  });

  it('creates a complete envelope using the scene default view', () => {
    const input = worldDocumentFixture();
    const document = createWorldDocument({
      scene: input.scene,
      sourceSnapshot: input.sourceSnapshot,
      savedAt: input.savedAt,
    });
    expect(document).toEqual(input);
  });

  it.each(['schemaVersion', 'generatorVersion', 'modelVersion'])(
    'rejects unsupported saved scene %s',
    (field) => {
      const input = worldDocumentFixture();
      expect(() => parseWorldDocument({ ...input, scene: { ...input.scene, [field]: 2 } })).toThrow(
        expect.objectContaining({ code: 'unsupported_version' }),
      );
    },
  );

  it('rejects unsupported envelope versions, malformed JSON and oversized files', () => {
    const input = worldDocumentFixture();
    expect(() => parseWorldDocument({ ...input, schemaVersion: 2 })).toThrow(
      expect.objectContaining({ code: 'unsupported_version' }),
    );
    expect(() => parseWorldDocument('{broken')).toThrow(
      expect.objectContaining({ code: 'invalid_input' }),
    );
    expect(() => parseWorldDocument(' '.repeat(MAX_WORLD_BYTES + 1))).toThrow(
      expect.objectContaining({ code: 'too_large' }),
    );
  });

  it('keeps private local records out of the exported envelope', () => {
    const input = worldDocumentFixture();
    for (const localField of ['bookmarks', 'journal', 'accessToken'])
      expect(() => parseWorldDocument({ ...input, [localField]: [] })).toThrow(
        expect.objectContaining({ code: 'invalid_input' }),
      );
  });

  it('rejects nonfinite camera and geometry data plus broken entity references', () => {
    const input = worldDocumentFixture();
    const entity = input.scene.entities[0];
    for (const invalidEntity of [
      { ...entity, position: { x: Infinity, y: 0, z: 0 } },
      { ...entity, islandId: 'absent' },
    ])
      expect(() =>
        parseWorldDocument({ ...input, scene: { ...input.scene, entities: [invalidEntity] } }),
      ).toThrow(expect.objectContaining({ code: 'invalid_input' }));
    expect(() =>
      parseWorldDocument({ ...input, view: { ...input.view, elapsedSeconds: NaN } }),
    ).toThrow(expect.objectContaining({ code: 'invalid_input' }));
  });

  it('rejects geometry with changed source counts while preserving a previously loaded world', () => {
    const input = worldDocumentFixture();
    let current = parseWorldDocument(input);
    const original = current;
    const changed = {
      ...input,
      sourceSnapshot: {
        ...input.sourceSnapshot,
        weeks: input.sourceSnapshot.weeks.map((week) => ({
          ...week,
          days: week.days.map((day) => ({ ...day, count: day.count + 1 })),
        })),
      },
    };
    expect(() => {
      current = parseWorldDocument(changed);
    }).toThrow(expect.objectContaining({ code: 'invalid_input' }));
    expect(current).toBe(original);
  });

  it('requires repository and release evidence for every attached place', () => {
    const input = worldDocumentFixture();
    const scene = {
      ...input.scene,
      entities: input.scene.entities.map((entity) => ({ ...entity, repoId: '1', releaseId: '10' })),
    };
    expect(() => parseWorldDocument({ ...input, scene })).toThrow(
      expect.objectContaining({ code: 'invalid_input' }),
    );
    expect(
      parseWorldDocument({ ...input, scene, repositoryData: [publicRepositoryFixture()] })
        .repositoryData,
    ).toHaveLength(1);
  });

  it('retains real release publication evidence and rejects invented event dates', () => {
    const input = worldDocumentFixture();
    const repositoryData = [publicRepositoryFixture()];
    const event = {
      id: 'release-event',
      kind: 'release' as const,
      anchorId: input.scene.entities[0].id,
      startsOn: '2024-02-28',
      evidence: { kind: 'release' as const, repoId: '1', releaseId: '10' },
    };
    const entities = input.scene.entities.map((entity) => ({
      ...entity,
      kind: 'release' as const,
      label: 'Release v1',
      repoId: '1',
      releaseId: '10',
    }));
    const document = {
      ...input,
      repositoryData,
      scene: { ...input.scene, entities, events: [event] },
    };
    expect(parseWorldDocument(document).scene.events[0].startsOn).toBe('2024-02-28');
    expect(() =>
      parseWorldDocument({
        ...document,
        scene: { ...document.scene, events: [{ ...event, startsOn: '2024-02-29' }] },
      }),
    ).toThrow(expect.objectContaining({ code: 'invalid_input' }));
  });
});
