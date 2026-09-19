import { z } from 'zod';
import { parseSnapshot } from '../../core/settings/parse.js';
import { InputValidationError } from '../../core/settings/errors.js';
import { MAX_IMPORT_BYTES } from '../../core/settings/boundary.js';
import { defaultWorldView, parseWorldScene, WorldModelError } from '../model/index.js';
import type { PublicRepoRecord, WorldScene, WorldView } from '../model/types.js';
import type { SnapshotV1 } from '../../core/snapshot-types.js';
import { WorldDataError } from './errors.js';
import { freezeWorldValue, readWorldJson } from './json.js';
import { parseRepositoryRecords, timestampSchema } from './repository-schema.js';
import { parseWorldView } from './view.js';
import type { WorldDocumentV1 } from './types.js';

const envelope = z
  .object({
    kind: z.literal('maeul-world'),
    schemaVersion: z.literal(1),
    scene: z.unknown(),
    sourceSnapshot: z.unknown(),
    repositoryData: z.unknown(),
    view: z.unknown(),
    savedAt: timestampSchema,
  })
  .strict();

function validateSources(document: WorldDocumentV1): void {
  const { scene, sourceSnapshot, repositoryData } = document;
  const source = new Map(
    sourceSnapshot.weeks
      .flatMap((week) => week.days)
      .filter((day) => day.date >= scene.range.from && day.date <= scene.range.to)
      .map((day) => [day.date, day.count]),
  );
  const observed = scene.days.filter((day) => day.kind === 'observed');
  if (
    sourceSnapshot.username.toLowerCase() !== scene.username.toLowerCase() ||
    source.size !== observed.length ||
    observed.some((day) => day.kind === 'observed' && source.get(day.date) !== day.count)
  )
    throw new WorldDataError(
      'invalid_input',
      'Saved geometry does not match its original contribution dates and counts.',
    );
  const repos = new Map(repositoryData.map((repo) => [repo.id, repo]));
  for (const entity of scene.entities) {
    if (
      (entity.repoId && !repos.has(entity.repoId)) ||
      (entity.releaseId &&
        !repos
          .get(entity.repoId ?? '')
          ?.releases.some((release) => release.id === entity.releaseId))
    )
      throw new WorldDataError(
        'invalid_input',
        'A world place refers to missing repository or release evidence.',
      );
  }
  for (const event of scene.events) {
    if (event.evidence.kind !== 'release') continue;
    const release = repos
      .get(event.evidence.repoId ?? '')
      ?.releases.find((item) => item.id === event.evidence.releaseId);
    if (!release || event.startsOn !== release.publishedAt.slice(0, 10))
      throw new WorldDataError(
        'invalid_input',
        'A release memorial does not match its published date.',
      );
  }
}

export function parseWorldDocument(input: unknown): WorldDocumentV1 {
  const raw = readWorldJson(input);
  const version = z.object({ schemaVersion: z.number() }).safeParse(raw);
  if (version.success && version.data.schemaVersion !== 1)
    throw new WorldDataError('unsupported_version', 'This world file uses an unsupported version.');
  try {
    const parsed = envelope.parse(raw);
    const versions = z
      .object({ schemaVersion: z.number(), generatorVersion: z.number(), modelVersion: z.number() })
      .safeParse(parsed.scene);
    if (versions.success && Object.values(versions.data).some((version) => version !== 1))
      throw new WorldDataError(
        'unsupported_version',
        'This saved scene uses an unsupported generator or model version.',
      );
    readWorldJson(parsed.sourceSnapshot, MAX_IMPORT_BYTES);
    const scene = parseWorldScene(parsed.scene);
    const document: WorldDocumentV1 = {
      kind: 'maeul-world',
      schemaVersion: 1,
      scene,
      sourceSnapshot: parseSnapshot(parsed.sourceSnapshot),
      repositoryData: parseRepositoryRecords(parsed.repositoryData),
      view: parseWorldView(parsed.view, scene),
      savedAt: parsed.savedAt,
    };
    validateSources(document);
    return freezeWorldValue(document);
  } catch (error) {
    if (
      error instanceof z.ZodError ||
      error instanceof InputValidationError ||
      error instanceof WorldModelError
    )
      throw new WorldDataError(
        'invalid_input',
        'The world file contains invalid data or broken scene references.',
      );
    throw error;
  }
}

export function createWorldDocument(input: {
  readonly scene: WorldScene;
  readonly sourceSnapshot: SnapshotV1;
  readonly repositoryData?: readonly PublicRepoRecord[];
  readonly view?: WorldView;
  readonly savedAt?: string;
}): WorldDocumentV1 {
  return parseWorldDocument({
    kind: 'maeul-world',
    schemaVersion: 1,
    ...input,
    repositoryData: input.repositoryData ?? [],
    view: input.view ?? defaultWorldView(input.scene),
    savedAt: input.savedAt ?? new Date().toISOString(),
  });
}

export function serializeWorldDocument(document: WorldDocumentV1): string {
  return JSON.stringify(parseWorldDocument(document));
}
