import { dirname, join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { createSnapshot } from '../core/settings/parse.js';
import { serializeSnapshot } from '../core/settings/serialize.js';
import type { ResolvedRenderSettings } from '../core/render-options.js';
import type { SnapshotSource } from '../core/snapshot-types.js';
import type { ContributionData, Theme, ThemeOptions } from '../core/types.js';
import type { TerrainGenerationRequest, TerrainGeneratorDependencies } from '../generate/types.js';
import { renderPng } from './png.js';

export interface OutputFileRequest {
  readonly request: TerrainGenerationRequest;
  readonly data: ContributionData;
  readonly theme: Theme;
  readonly settings: ResolvedRenderSettings;
  readonly options: ThemeOptions;
  readonly source: SnapshotSource;
  readonly format: 'svg' | 'png' | 'both';
  readonly scale: number;
}

export async function writeTerrainOutputs(
  input: OutputFileRequest,
  dependencies: TerrainGeneratorDependencies,
) {
  const { request, data, theme, settings, options, format, scale, source } = input;
  const directory = request.outputDir?.trim() || './';
  await dependencies.makeDirectory(directory);
  let darkPath = '';
  let lightPath = '';
  if (format !== 'png') {
    const output = theme.render(data, options);
    darkPath = join(directory, 'maeul-in-the-sky-dark.svg');
    lightPath = join(directory, 'maeul-in-the-sky-light.svg');
    await dependencies.writeFile(darkPath, output.dark);
    await dependencies.writeFile(lightPath, output.light);
  }
  const pngPaths: { darkPngPath?: string; lightPngPath?: string } = {};
  if (format !== 'svg') {
    const staticOutput = theme.render(data, { ...options, motion: 'off' });
    const png = dependencies.renderPng ?? renderPng;
    const writeBinary =
      dependencies.writeBinaryFile ??
      (async (path, bytes) => {
        await writeFile(path, bytes);
      });
    pngPaths.darkPngPath = join(directory, 'maeul-in-the-sky-dark.png');
    pngPaths.lightPngPath = join(directory, 'maeul-in-the-sky-light.png');
    await writeBinary(pngPaths.darkPngPath, await png(staticOutput.dark, { mode: 'dark', scale }));
    await writeBinary(
      pngPaths.lightPngPath,
      await png(staticOutput.light, { mode: 'light', scale }),
    );
  }
  if (!request.writeSnapshot) return { darkPath, lightPath, ...pngPaths };
  const snapshotPath =
    typeof request.writeSnapshot === 'string'
      ? request.writeSnapshot
      : join(directory, 'maeul-in-the-sky.snapshot.json');
  await dependencies.makeDirectory(dirname(snapshotPath));
  await dependencies.writeFile(
    snapshotPath,
    serializeSnapshot(createSnapshot(data, settings, source)),
  );
  return { darkPath, lightPath, ...pngPaths, snapshotPath };
}
