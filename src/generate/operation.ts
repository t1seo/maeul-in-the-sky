import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { createArchiveGenerator } from '../archive.js';
import { createTerrainGenerator } from '../generate.js';
import { parseArchive } from '../core/archive/parse.js';
import { parseBoundary, readJsonInput } from '../core/settings/boundary.js';
import { parseSnapshot } from '../core/settings/parse.js';
import { nodeGeneratorDependencies } from './dependencies.js';
import { invalidOption, parseGenerationYears } from './options.js';
import type { TerrainGenerationRequest, TerrainGeneratorDependencies } from './types.js';

export async function executeGeneration(
  request: TerrainGenerationRequest,
  dependencies: TerrainGeneratorDependencies = nodeGeneratorDependencies,
) {
  const years = parseGenerationYears(request.years);
  if (years && request.year !== undefined && request.year !== '')
    invalidOption('year', 'cannot be combined with years');
  const { input, ...options } = request;
  if (input !== undefined) {
    const json = readJsonInput(
      typeof input === 'string'
        ? await (dependencies.readFile ?? ((path) => readFile(path, 'utf-8')))(input)
        : input,
    );
    const { kind } = parseBoundary(
      z.object({ kind: z.enum(['maeul-snapshot', 'maeul-archive']) }),
      json,
    );
    switch (kind) {
      case 'maeul-snapshot':
        if (years) invalidOption('years', 'requires archive input with all selected years');
        return {
          kind: 'terrain' as const,
          result: await createTerrainGenerator(dependencies)({
            ...options,
            input: parseSnapshot(json),
          }),
        };
      case 'maeul-archive':
        return {
          kind: 'archive' as const,
          result: await createArchiveGenerator(dependencies)({
            ...options,
            input: parseArchive(json),
          }),
        };
      default:
        return kind satisfies never;
    }
  }
  if (years)
    return {
      kind: 'archive' as const,
      result: await createArchiveGenerator(dependencies)({ ...options, years }),
    };
  return { kind: 'terrain' as const, result: await createTerrainGenerator(dependencies)(options) };
}

export type GenerationOperation = Awaited<ReturnType<typeof executeGeneration>>;

export function operationPaths(operation: GenerationOperation): string[] {
  switch (operation.kind) {
    case 'terrain':
      return [
        operation.result.darkPath,
        operation.result.lightPath,
        operation.result.darkPngPath,
        operation.result.lightPngPath,
        operation.result.snapshotPath,
      ].filter((path): path is string => typeof path === 'string' && path !== '');
    case 'archive':
      return [
        ...operation.result.outputs.flatMap((result) =>
          operationPaths({ kind: 'terrain', result }),
        ),
        operation.result.archivePath,
        operation.result.comparisonDarkPath,
        operation.result.comparisonLightPath,
      ];
    default:
      return operation satisfies never;
  }
}
