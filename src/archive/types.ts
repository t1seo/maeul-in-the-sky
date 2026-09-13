import type { ArchiveV1, SnapshotV1 } from '../core/snapshot-types.js';
import type { TerrainGenerationRequest, TerrainGenerationResult } from '../generate/types.js';

export interface TerrainArchiveRequest extends Omit<TerrainGenerationRequest, 'input'> {
  readonly input?: string | ArchiveV1;
  readonly snapshots?: readonly SnapshotV1[];
}

export interface TerrainArchiveResult {
  readonly archivePath: string;
  readonly comparisonDarkPath: string;
  readonly comparisonLightPath: string;
  readonly years: readonly number[];
  readonly normalization: { readonly kind: 'fixed'; readonly maxCount: number };
  readonly outputs: readonly TerrainGenerationResult[];
}
