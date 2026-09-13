import { z } from 'zod';
import { parseSnapshot } from '../core/settings/parse.js';
import type { SettingsV1, SnapshotV1 } from '../core/snapshot-types.js';

const healthSchema = z.object({
  status: z.literal('ok'),
  capabilities: z.object({ github: z.boolean() }),
});
const errorSchema = z.object({ error: z.object({ code: z.string(), message: z.string() }) });
const previewSchema = z.object({ snapshot: z.unknown() });

export type LocalCapability = { readonly available: boolean; readonly message: string };

export function isLoopbackPage(url: URL): boolean {
  return url.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
}

export async function localCapability(url: URL): Promise<LocalCapability> {
  if (!isLoopbackPage(url))
    return {
      available: false,
      message:
        'Import JSON here, or open the local preview page to fetch an account. This public page never contacts localhost.',
    };
  try {
    const response = await window.fetch(new URL('/api/health', url.origin), {
      signal: AbortSignal.timeout(3000),
      cache: 'no-store',
      credentials: 'same-origin',
    });
    if (!response.ok)
      return {
        available: false,
        message:
          'This origin is not a running Maeul preview service. Start maeul-sky preview and open its local URL.',
      };
    const body: unknown = await response.json();
    const parsed = healthSchema.safeParse(body);
    if (!parsed.success)
      return {
        available: false,
        message: 'The local server did not identify itself as a Maeul preview service.',
      };
    return parsed.data.capabilities.github
      ? {
          available: true,
          message:
            'Local preview connected. Your token stays on the server; fetch uses this page’s origin.',
        }
      : {
          available: false,
          message:
            'Local preview found. Restart it with GITHUB_TOKEN in the server environment to fetch contributions.',
        };
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    return {
      available: false,
      message: `Local preview is unavailable: ${error.name}. You can still import a snapshot.`,
    };
  }
}

export class PreviewRequestError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function fetchPreview(document: SettingsV1, url: URL): Promise<SnapshotV1> {
  if (!isLoopbackPage(url))
    throw new PreviewRequestError(
      'local_only',
      'Open the local preview page before fetching contributions.',
    );
  const response = await window.fetch(new URL('/api/preview', url.origin), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: document.username,
      ...(document.year === undefined ? {} : { year: document.year }),
      settings: document.settings,
    }),
    signal: AbortSignal.timeout(35_000),
    cache: 'no-store',
    credentials: 'same-origin',
  });
  const body: unknown = await response.json();
  if (!response.ok) {
    const parsed = errorSchema.safeParse(body);
    throw new PreviewRequestError(
      parsed.success ? parsed.data.error.code : 'invalid_response',
      parsed.success
        ? parsed.data.error.message
        : `The local service returned HTTP ${response.status}.`,
    );
  }
  return parseSnapshot(previewSchema.parse(body).snapshot);
}
