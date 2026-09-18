import { z } from 'zod';
import type { RenderSettingsInput } from '../core/render-options.js';
import { parseBoundary } from '../core/settings/boundary.js';
import { InputValidationError } from '../core/settings/errors.js';
import { renderSettingsInputSchema, yearSchema } from '../core/settings/schema.js';
import type { TerrainGenerationRequest } from './types.js';

export function invalidOption(field: string, message: string): never {
  throw new InputValidationError([{ path: field, message: `Invalid ${field}: ${message}` }]);
}

export function optionalNumber(
  value: string | number | undefined,
  field: string,
): number | undefined {
  if (value === undefined || value === '') return undefined;
  if (typeof value === 'string' && value.trim() === '')
    return invalidOption(field, 'expected a number');
  const parsed = z.coerce.number().finite().safeParse(value);
  if (!parsed.success) return invalidOption(field, 'expected a finite number');
  return parsed.data;
}

export function parseGenerationYear(value: TerrainGenerationRequest['year']): number | undefined {
  const year = optionalNumber(value, 'year');
  if (year === undefined) return undefined;
  const parsed = yearSchema.safeParse(year);
  if (!parsed.success) return invalidOption('year', 'expected an integer from 1 to 9999');
  return parsed.data;
}

export function parseGenerationSettings(
  request: TerrainGenerationRequest,
  archive = false,
): RenderSettingsInput {
  const normalization = request.normalization || undefined;
  const maxCount = optionalNumber(request.maxCount, 'maxCount');
  if (normalization === 'shared' && !archive)
    invalidOption('normalization', 'shared requires an archive');
  if (normalization && !['relative', 'fixed', 'shared'].includes(normalization)) {
    invalidOption('normalization', 'expected relative, fixed, or shared');
  }
  if (maxCount !== undefined && normalization !== 'fixed')
    invalidOption('maxCount', 'requires fixed normalization');
  if (normalization === 'fixed' && maxCount === undefined)
    invalidOption('maxCount', 'required for fixed normalization');
  if (request.style && request.villageStyle && request.style !== request.villageStyle) {
    invalidOption('style', 'conflicts with villageStyle');
  }
  const explicit = {
    preset: request.preset || undefined,
    density: optionalNumber(request.density, 'density'),
    title: request.title || undefined,
    hemisphere: request.hemisphere || undefined,
    motion: request.motion || undefined,
    layout: request.layout || undefined,
    style: request.style || request.villageStyle || undefined,
    artStyle: request.artStyle || undefined,
    layoutSeed: request.layoutSeed,
    normalization:
      normalization === 'fixed'
        ? { kind: 'fixed', maxCount }
        : normalization === 'relative'
          ? { kind: 'relative' }
          : undefined,
  };
  const parsed = renderSettingsInputSchema.safeParse(explicit);
  if (!parsed.success) {
    throw new InputValidationError(
      parsed.error.issues.map((issue) => ({
        path: issue.path.map(String).join('.'),
        message: `Invalid ${String(issue.path[0])}: ${issue.message}`,
      })),
    );
  }
  return parsed.data;
}

export function parseOutputOptions(request: TerrainGenerationRequest) {
  const format = parseBoundary(z.enum(['svg', 'png', 'both']), request.format || 'svg', 'format');
  const scale = parseBoundary(
    z.number().int().min(1).max(4),
    optionalNumber(request.scale, 'scale') ?? 2,
    'scale',
  );
  return { format, scale };
}

export function parseGenerationYears(
  value: TerrainGenerationRequest['years'],
): number[] | undefined {
  if (value === undefined || value === '') return undefined;
  const values =
    typeof value === 'string'
      ? value.split(',').map((part) => optionalNumber(part.trim(), 'years'))
      : value;
  const years = parseBoundary(z.array(yearSchema).min(2).max(5), values, 'years');
  if (new Set(years).size !== years.length)
    invalidOption('years', 'duplicate years are not allowed');
  return [...years].sort((a, b) => a - b);
}
