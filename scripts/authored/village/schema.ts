import { z } from 'zod';

const sourceSchema = z
  .object({
    creator: z.string(),
    originalTitle: z.string(),
    modelUrl: z.url(),
    downloadUrl: z.url(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    license: z.enum(['CC0-1.0', 'CC-BY-3.0']),
    licenseUrl: z.url(),
    licenseFile: z.string(),
    disclosure: z.string().optional(),
    licenseEvidence: z.string().optional(),
    licenseEvidenceUrl: z.url().optional(),
    archiveSha256: z.string().optional(),
  })
  .readonly();

export const villageSourcesSchema = z.object({
  version: z.literal(1),
  models: z
    .array(
      z
        .object({
          id: z.string().regex(/^[a-z][a-z0-9-]+$/),
          input: z.string(),
          source: sourceSchema,
          treatment: z.enum(['solid', 'textured', 'fountain', 'gate', 'onggi', 'snow']),
          resources: z
            .array(
              z
                .object({
                  file: z.string(),
                  bytes: z.number(),
                  sha256: z.string().regex(/^[a-f0-9]{64}$/),
                })
                .readonly(),
            )
            .readonly(),
        })
        .readonly(),
    )
    .readonly(),
});

export type VillageSource = z.infer<typeof villageSourcesSchema>['models'][number];

export class VillagePreparationError extends Error {
  constructor(
    readonly id: string,
    readonly reason: string,
  ) {
    super(`${id}: ${reason}`);
    this.name = 'VillagePreparationError';
  }
}
