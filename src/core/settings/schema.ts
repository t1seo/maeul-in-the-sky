import { z } from 'zod';
import type { ResolvedRenderSettings } from '../render-options.js';

const xml10TextSchema = z.string().refine(
  (value) =>
    Array.from(value).every((character) => {
      const codePoint = character.codePointAt(0);
      return (
        codePoint !== undefined &&
        (codePoint === 0x09 ||
          codePoint === 0x0a ||
          codePoint === 0x0d ||
          (codePoint >= 0x20 && codePoint <= 0xd7ff) ||
          (codePoint >= 0xe000 && codePoint <= 0xfffd) ||
          (codePoint >= 0x10000 && codePoint <= 0x10ffff))
      );
    }),
  'Expected XML 1.0 compatible text',
);
const villageStyleSchema = z.enum(['classic', 'korean']);

export const usernameSchema = z
  .string()
  .trim()
  .min(1)
  .max(39)
  .regex(/^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i, 'Expected a GitHub username');
export const yearSchema = z.number().int().min(1).max(9999);
export const fixedNormalizationSchema = z.strictObject({
  kind: z.literal('fixed'),
  maxCount: z.number().finite().positive(),
});
export const normalizationSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('relative') }),
  fixedNormalizationSchema,
]);

export const renderSettingsSchema = z.strictObject({
  preset: z.enum(['nature', 'balanced', 'civilization']),
  density: z.number().int().min(1).max(10),
  title: xml10TextSchema.max(1000),
  hemisphere: z.enum(['north', 'south']),
  motion: z.enum(['full', 'subtle', 'off']),
  layout: z.enum(['banner', 'card']),
  style: villageStyleSchema,
  artStyle: z.enum(['miniature', 'pixel']),
  normalization: normalizationSchema,
  layoutSeed: xml10TextSchema.max(256).optional(),
});

export const renderSettingsInputSchema = renderSettingsSchema
  .partial()
  .extend({ villageStyle: villageStyleSchema.optional() })
  .superRefine((settings, context) => {
    if (
      settings.style !== undefined &&
      settings.villageStyle !== undefined &&
      settings.style !== settings.villageStyle
    ) {
      context.addIssue({
        code: 'custom',
        path: ['villageStyle'],
        message: 'villageStyle conflicts with style',
      });
    }
  })
  .transform(({ villageStyle, ...settings }): Partial<ResolvedRenderSettings> => {
    const style = settings.style ?? villageStyle;
    return { ...settings, ...(style === undefined ? {} : { style }) };
  });
