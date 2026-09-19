import { isDeepStrictEqual } from 'node:util';
import { z } from 'zod';
import type { WorldDocumentV1 } from '../../src/world/data/types.js';
import type { SnapshotV1 } from '../../src/core/snapshot-types.js';
import type { WorldScene, WorldView } from '../../src/world/model/types.js';
import { matchesGeneratedGeometry } from './geometry-match.js';

const metricsSchema = z.strictObject({
  renderer: z.literal('three'),
  webgl2: z.literal(true),
  contextLost: z.literal(false),
  calls: z.number().int().positive(),
  triangles: z.number().int().min(1000),
  geometries: z.number().int().positive(),
  textures: z.number().int().nonnegative(),
  frames: z.number().int().positive(),
  elapsed: z.literal(0),
  width: z.literal(1600),
  height: z.literal(1000),
  version: z.string().startsWith('WebGL 2.0'),
});

export type ThreeMetrics = z.infer<typeof metricsSchema>;
export function parseThreeMetrics(input: unknown): ThreeMetrics {
  return metricsSchema.parse(input);
}

export function assertPngBytes(bytes: Buffer): void {
  if (
    bytes.length < 10000 ||
    !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    throw new Error('The staged PNG is missing or invalid.');
  if (bytes.readUInt32BE(16) !== 1600 || bytes.readUInt32BE(20) !== 1160)
    throw new Error('Profile PNG dimensions must be 1600×1160.');
}

export function assertSamePose(before: WorldView, after: WorldView): void {
  const camera = (view: WorldView): readonly number[] => [
    view.camera.position.x,
    view.camera.position.y,
    view.camera.position.z,
    view.camera.target.x,
    view.camera.target.y,
    view.camera.target.z,
    view.camera.zoom,
  ];
  const other = camera(after);
  if (
    !isDeepStrictEqual(before, { ...after, camera: before.camera, lighting: before.lighting }) ||
    camera(before).some((value, index) => Math.abs(value - other[index]) > 1e-8)
  )
    throw new Error('The themed captures do not share the same frozen camera and pose.');
}

export function assertCanonicalWorld(
  document: WorldDocumentV1,
  snapshot: SnapshotV1,
  expectedScene: WorldScene,
): void {
  if (!isDeepStrictEqual(document.sourceSnapshot, snapshot))
    throw new Error('The captured world does not retain the caller snapshot exactly.');
  if (!matchesGeneratedGeometry(document.scene, expectedScene)) {
    const actual = new Map<string, unknown>(Object.entries(document.scene));
    const fields = Object.entries(expectedScene)
      .filter(([key, value]) => !matchesGeneratedGeometry(value, actual.get(key)))
      .map(([key]) => key);
    throw new Error(
      `Captured geometry differs from the checkout model (${fields.join(', ')}); rebuild shipped world assets.`,
    );
  }
  const view = document.view;
  const last = snapshot.weeks
    .flatMap((week) => week.days.map((day) => day.date))
    .sort()
    .at(-1);
  if (
    document.scene.settings.layout !== 'seasonal-circle' ||
    document.repositoryData.length !== 0 ||
    view.lighting !== 'day' ||
    view.weather !== 'clear' ||
    view.seasonOverride !== 'calendar' ||
    view.motion !== 'off' ||
    view.quality !== 'high' ||
    view.elapsedSeconds !== 0 ||
    view.focus.kind !== 'world' ||
    view.followActorId !== undefined ||
    view.cursorDate !== (last ?? document.scene.range.to)
  )
    throw new Error('The canonical world must be the complete frozen daytime seasonal circle.');
}

export function assertThemeWorld(day: WorldDocumentV1, night: WorldDocumentV1): void {
  if (
    night.view.lighting !== 'night' ||
    !isDeepStrictEqual(day.scene, night.scene) ||
    !isDeepStrictEqual(day.sourceSnapshot, night.sourceSnapshot) ||
    !isDeepStrictEqual(day.repositoryData, night.repositoryData)
  )
    throw new Error('The dark capture changed the world or its source evidence.');
  assertSamePose(day.view, night.view);
}
