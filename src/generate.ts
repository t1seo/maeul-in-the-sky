import type { ThemeOptions } from './core/types.js';
import { resolveDisplaySize } from './core/display-size.js';
import { snapshotToContributionData } from './core/settings/parse.js';
import { nodeGeneratorDependencies } from './generate/dependencies.js';
import { resolveGenerationInput } from './generate/input.js';
import { invalidOption } from './generate/options.js';
import type {
  TerrainGenerationRequest,
  TerrainGenerationResult,
  TerrainGeneratorDependencies,
} from './generate/types.js';
import { writeTerrainOutputs } from './output/files.js';

export type {
  TerrainGenerationRequest,
  TerrainGenerationResult,
  TerrainGeneratorDependencies,
} from './generate/types.js';

export function createTerrainGenerator(dependencies: TerrainGeneratorDependencies) {
  return async function generateTerrain(
    request: TerrainGenerationRequest,
  ): Promise<TerrainGenerationResult> {
    const input = await resolveGenerationInput(request, dependencies);
    const themeName = request.theme?.trim() || dependencies.getDefaultTheme();
    const theme = dependencies.getTheme(themeName);
    if (!theme)
      invalidOption(
        'theme',
        `Unknown theme "${themeName}". Available themes: ${dependencies.listThemes().join(', ')}`,
      );
    const { username, year, settings, snapshot, advanced } = input;
    request.onProgress?.(
      snapshot
        ? `Reading snapshot for @${username} (${year})...`
        : `Fetching contributions for @${username} (${year ?? 'last 52 weeks'})...`,
    );
    const data = snapshot
      ? snapshotToContributionData(snapshot)
      : await dependencies.fetchContributions(username, year, request.token || undefined);
    request.onProgress?.(`Rendering with ${theme.displayName} theme...`);
    const options: ThemeOptions = {
      title: settings.title,
      ...resolveDisplaySize(settings),
      hemisphere: settings.hemisphere,
      density: settings.density,
      ...(advanced
        ? {
            motion: settings.motion,
            layout: settings.layout,
            style: settings.style,
            artStyle: settings.artStyle,
            normalization: settings.normalization,
            ...(settings.layoutSeed === undefined ? {} : { layoutSeed: settings.layoutSeed }),
            ...(settings.terrainMode === undefined
              ? {}
              : { terrainMode: settings.terrainMode, landscapeLayout: settings.landscapeLayout }),
          }
        : {}),
    };
    const paths = await writeTerrainOutputs(
      { ...input, request, data, theme, options, source: snapshot?.source ?? { kind: 'github' } },
      dependencies,
    );
    return {
      ...paths,
      themeName: theme.name,
      themeDisplayName: theme.displayName,
      presetName: settings.preset,
      density: settings.density,
    };
  };
}

export const generateTerrain = createTerrainGenerator(nodeGeneratorDependencies);
