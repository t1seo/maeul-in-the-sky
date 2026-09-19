import type { SnapshotV1 } from '../../core/snapshot-types.js';
import { centerOf } from './math.js';
import type { WorldScene, WorldSettings, WorldView } from './types.js';

export function defaultWorldSettings(snapshot: SnapshotV1): WorldSettings {
  return {
    layout: 'archipelago',
    layoutSeed: snapshot.settings.layoutSeed ?? '',
    hemisphere: snapshot.settings.hemisphere,
    culture: snapshot.settings.style,
    heightScale: { kind: 'fixed', maxCount: 50 },
    landUse: { nature: 75, town: 18, city: 7 },
  };
}

export function defaultWorldView(scene: WorldScene): WorldView {
  const target = centerOf(scene.bounds);
  const span = Math.max(
    scene.bounds.max.x - scene.bounds.min.x,
    scene.bounds.max.z - scene.bounds.min.z,
    12,
  );
  return {
    cursorDate: scene.days.filter((day) => day.kind === 'observed').at(-1)?.date ?? scene.range.to,
    seasonOverride: 'calendar',
    lighting: 'day',
    weather: 'seasonal',
    motion: 'full',
    quality: 'high',
    focus: { kind: 'world' },
    elapsedSeconds: 0,
    camera: {
      position: { x: target.x + span * 0.8, y: target.y + span, z: target.z + span },
      target,
      zoom: 1,
    },
  };
}
