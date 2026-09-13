import { join } from 'node:path';
import { createTerrainGenerator } from './generate.js';
import { nodeGeneratorDependencies } from './generate/dependencies.js';
import { invalidOption } from './generate/options.js';
import type { TerrainGeneratorDependencies } from './generate/types.js';
import { resolveRenderSettings } from './core/settings/resolve.js';
import { selectComparisonSnapshots } from './core/archive/selection.js';
import { serializeArchive } from './core/archive/serialize.js';
import { resolveArchiveInput } from './archive/input.js';
import { renderArchiveComparison } from './archive/comparison.js';
import type { TerrainArchiveRequest, TerrainArchiveResult } from './archive/types.js';

export type { TerrainArchiveRequest, TerrainArchiveResult } from './archive/types.js';

export function createArchiveGenerator(dependencies: TerrainGeneratorDependencies) {
  return async function generateArchive(
    request: TerrainArchiveRequest,
  ): Promise<TerrainArchiveResult> {
    const themeName = request.theme?.trim() || dependencies.getDefaultTheme();
    const theme = dependencies.getTheme(themeName);
    if (!theme)
      invalidOption(
        'theme',
        `Unknown theme "${themeName}". Available themes: ${dependencies.listThemes().join(', ')}`,
      );
    const resolved = await resolveArchiveInput(request, dependencies);
    const directory = request.outputDir?.trim() || './';
    const snapshots = resolved.archive.snapshots.map((snapshot) => ({
      ...snapshot,
      settings: resolveRenderSettings(
        resolved.explicit,
        resolved.config?.settings ?? snapshot.settings,
        snapshot.username,
      ),
    }));
    const archive = { ...resolved.archive, snapshots };
    const selectedSnapshots = selectComparisonSnapshots(snapshots, archive.comparison.years);
    const comparison = renderArchiveComparison(archive, theme, resolved.source);
    const generate = createTerrainGenerator(dependencies);
    const outputs = [];
    for (const snapshot of selectedSnapshots) {
      outputs.push(
        await generate({
          input: snapshot,
          theme: themeName,
          outputDir: join(directory, String(snapshot.year)),
          format: request.format,
          scale: request.scale,
          writeSnapshot: true,
          onProgress: request.onProgress,
        }),
      );
    }
    await dependencies.makeDirectory(directory);
    const archivePath = join(directory, 'archive.json');
    const comparisonDarkPath = join(directory, 'maeul-in-the-sky-comparison-dark.svg');
    const comparisonLightPath = join(directory, 'maeul-in-the-sky-comparison-light.svg');
    await dependencies.writeFile(archivePath, serializeArchive(archive));
    await dependencies.writeFile(comparisonDarkPath, comparison.dark);
    await dependencies.writeFile(comparisonLightPath, comparison.light);
    return {
      archivePath,
      comparisonDarkPath,
      comparisonLightPath,
      years: archive.comparison.years,
      normalization: archive.comparison.normalization,
      outputs,
    };
  };
}

export const generateArchive = createArchiveGenerator(nodeGeneratorDependencies);
