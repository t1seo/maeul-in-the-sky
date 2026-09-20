import type { TerrainGenerationRequest } from '../generate/types.js';
import {
  executeGeneration,
  operationPaths,
  type GenerationOperation,
} from '../generate/operation.js';
import { resolveActionUsername } from '../action-context.js';
import { invalidOption } from '../generate/options.js';

export interface ActionDependencies {
  readonly getInput: (name: string) => string;
  readonly info: (message: string) => void;
  readonly setOutput: (name: string, value: string) => void;
  readonly setFailed: (message: string) => void;
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly generate: typeof executeGeneration;
}

export function readActionRequest(dependencies: ActionDependencies): TerrainGenerationRequest {
  const input = (name: string) => dependencies.getInput(name) || undefined;
  const source = input('input');
  const config = input('config');
  const username =
    input('username') ||
    (source || config
      ? undefined
      : resolveActionUsername(
          '',
          dependencies.env.GITHUB_REPOSITORY_OWNER,
          dependencies.env.GITHUB_ACTOR,
        ));
  const snapshot = input('write_snapshot');
  if (snapshot !== undefined && snapshot !== 'true' && snapshot !== 'false') {
    invalidOption('write_snapshot', 'must be true or false');
  }
  return {
    username,
    token: input('github_token') || dependencies.env.GITHUB_TOKEN,
    theme: input('theme'),
    title: input('title'),
    outputDir: input('output_dir'),
    year: input('year'),
    years: input('years'),
    hemisphere: input('hemisphere'),
    preset: input('preset'),
    density: input('density'),
    config,
    input: source,
    writeSnapshot: snapshot === undefined ? undefined : snapshot === 'true',
    motion: input('motion'),
    layout: input('layout'),
    style: input('village_style'),
    artStyle: input('art_style'),
    normalization: input('normalization'),
    maxCount: input('max_count'),
    format: input('format'),
    scale: input('scale'),
    layoutSeed: input('layout_seed'),
    terrainMode: input('terrain_mode'),
    landscapeLayout: input('landscape_layout'),
    onProgress: dependencies.info,
  };
}

export function actionOutputs(operation: GenerationOperation): Readonly<Record<string, string>> {
  switch (operation.kind) {
    case 'terrain':
      return {
        dark_svg_path: operation.result.darkPath,
        light_svg_path: operation.result.lightPath,
        dark_png_path: operation.result.darkPngPath ?? '',
        light_png_path: operation.result.lightPngPath ?? '',
        snapshot_path: operation.result.snapshotPath ?? '',
      };
    case 'archive':
      return {
        archive_path: operation.result.archivePath,
        comparison_dark_svg_path: operation.result.comparisonDarkPath,
        comparison_light_svg_path: operation.result.comparisonLightPath,
      };
    default:
      return operation satisfies never;
  }
}

export async function runAction(dependencies: ActionDependencies): Promise<void> {
  try {
    const operation = await dependencies.generate(readActionRequest(dependencies));
    for (const path of operationPaths(operation)) dependencies.info(`Written: ${path}`);
    for (const [name, value] of Object.entries(actionOutputs(operation))) {
      if (value) dependencies.setOutput(name, value);
    }
  } catch (error) {
    dependencies.setFailed(error instanceof Error ? error.message : String(error));
  }
}

export { executeGeneration };
