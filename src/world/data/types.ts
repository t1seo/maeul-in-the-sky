import type { SnapshotV1 } from '../../core/snapshot-types.js';
import type { PublicRepoRecord, WorldScene, WorldView } from '../model/types.js';

export type WorldDocumentV1 = {
  readonly kind: 'maeul-world';
  readonly schemaVersion: 1;
  readonly scene: WorldScene;
  readonly sourceSnapshot: SnapshotV1;
  readonly repositoryData: readonly PublicRepoRecord[];
  readonly view: WorldView;
  readonly savedAt: string;
};

export type ImportedWorlds = {
  readonly kind: 'world' | 'snapshot' | 'archive';
  readonly documents: readonly WorldDocumentV1[];
  readonly publicSourceUrl?: string;
};

export type WorldSaveSummary = {
  readonly key: string;
  readonly worldId: string;
  readonly revision: string;
  readonly username: string;
  readonly year: number;
  readonly savedAt: string;
};
