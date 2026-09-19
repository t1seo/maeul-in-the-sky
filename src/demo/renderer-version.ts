import { z } from 'zod';

export const rendererVersionSchema = z.enum(['current', 'classic']);
export type RendererVersion = z.infer<typeof rendererVersionSchema>;
export const CLASSIC_COMMIT = '05a10eff07575acf2c81adcd66a66bc501507217';
export const RENDERER_VERSIONS = {
  current: { label: 'Current', revision: 'main', description: 'Current artwork, following main.' },
  classic: {
    label: 'Classic · before Sky World',
    revision: CLASSIC_COMMIT,
    description: `Pre-update artwork, pinned to ${CLASSIC_COMMIT}.`,
  },
} as const;
