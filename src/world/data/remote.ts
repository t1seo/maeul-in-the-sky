import { importWorldData, type WorldImportOptions } from './imports.js';
import { requestWorldJson, type WorldRequestOptions } from './transport.js';
import { parseWorldSourceUrl, type WorldUrlOptions } from './urls.js';
import type { ImportedWorlds } from './types.js';
import { z } from 'zod';
import { MAX_IMPORT_BYTES } from '../../core/settings/boundary.js';
import { WorldDataError } from './errors.js';

export async function loadRemoteWorld(
  input: string,
  options: WorldUrlOptions &
    WorldImportOptions &
    Pick<WorldRequestOptions, 'signal' | 'fetch' | 'timeoutMs'> = {},
): Promise<ImportedWorlds> {
  const url = parseWorldSourceUrl(input, options);
  const response = await requestWorldJson(url, options);
  const header = z.object({ kind: z.string() }).safeParse(response.value);
  if (
    header.success &&
    header.data.kind !== 'maeul-world' &&
    response.byteLength > MAX_IMPORT_BYTES
  )
    throw new WorldDataError(
      'too_large',
      'Contribution snapshots and archives must be no larger than 2 MiB.',
    );
  const loaded = importWorldData(response.value, options);
  const isPublished =
    new URL(url).protocol === 'https:' &&
    (new URL(url).hostname === 'raw.githubusercontent.com' ||
      new URL(url).hostname.endsWith('.github.io'));
  return { ...loaded, ...(isPublished ? { publicSourceUrl: url } : {}) };
}
