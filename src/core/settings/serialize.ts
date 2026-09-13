import type { SettingsV1, SnapshotV1 } from '../snapshot-types.js';
import { parseSettings, parseSnapshot } from './parse.js';

export function serializeSettings(settings: SettingsV1): string {
  return JSON.stringify(parseSettings(settings));
}
export function serializeSnapshot(snapshot: SnapshotV1): string {
  return JSON.stringify(parseSnapshot(snapshot));
}
