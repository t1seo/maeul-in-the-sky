import { z } from 'zod';
import { resolveRenderSettings } from '../core/settings/resolve.js';
import { createSnapshot, snapshotToContributionData } from '../core/settings/parse.js';
import { usernameSchema, renderSettingsInputSchema } from '../core/settings/schema.js';
import type { ContributionData } from '../core/types.js';
import { PreviewError } from './errors.js';

const requestSchema = z.strictObject({
  username: usernameSchema,
  year: z.number().int().min(2008).max(9999).optional(),
  settings: renderSettingsInputSchema.optional(),
});

export function parsePreviewRequest(input: unknown) {
  const result = requestSchema.safeParse(input);
  if (!result.success) {
    const path = result.error.issues[0]?.path.join('.') || 'request';
    throw new PreviewError(400, 'invalid_request', `Invalid ${path}. Check the preview settings.`);
  }
  if (result.data.year !== undefined && result.data.year > new Date().getUTCFullYear()) {
    throw new PreviewError(
      400,
      'invalid_request',
      'Invalid year. Choose a year up to the current year.',
    );
  }
  return {
    ...result.data,
    settings: resolveRenderSettings(result.data.settings, {}, result.data.username),
  };
}

export type PreviewRequest = ReturnType<typeof parsePreviewRequest>;

export async function createPreviewResponse(
  data: ContributionData,
  request: PreviewRequest,
  fetchedAt: string,
) {
  const snapshot = createSnapshot(data, request.settings, { kind: 'github', fetchedAt });
  const verified = snapshotToContributionData(snapshot);
  const { renderTerrain } = await import('../themes/terrain/index.js');
  const rendered = renderTerrain(verified, { ...snapshot.settings, width: 840, height: 240 });
  return { snapshot, metadata: rendered.metadata };
}
