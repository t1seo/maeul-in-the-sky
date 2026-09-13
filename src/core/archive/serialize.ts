import type { ArchiveV1 } from '../snapshot-types.js';
import { parseArchive } from './parse.js';

export function serializeArchive(archive: ArchiveV1): string {
  return JSON.stringify(parseArchive(archive));
}
