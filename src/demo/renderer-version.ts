import { z } from 'zod';

export const rendererVersionSchema = z.enum(['current', 'classic']);
export type RendererVersion = z.infer<typeof rendererVersionSchema>;
export const CLASSIC_COMMIT = '05a10eff07575acf2c81adcd66a66bc501507217';
export const RENDERER_VERSIONS = {
  current: {
    label: 'Current',
    revision: 'v2.1.0',
    description: 'Calendar artwork, pinned to v2.1.0.',
  },
  classic: {
    label: 'Classic · original artwork',
    revision: CLASSIC_COMMIT,
    description: `Pre-update artwork, pinned to ${CLASSIC_COMMIT}.`,
  },
} as const;
