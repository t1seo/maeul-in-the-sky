import type { fetchContributions } from '../api/client.js';
import type { VillagePreset } from '../core/presets.js';
import type { SettingsV1, SnapshotV1 } from '../core/snapshot-types.js';
import type { Theme } from '../core/types.js';
import type { PngOptions } from '../output/png.js';

export interface TerrainGenerationRequest {
  readonly username?: string;
  readonly token?: string;
  readonly theme?: string;
  readonly title?: string;
  readonly outputDir?: string;
  readonly year?: string | number;
  readonly years?: string | readonly number[];
  readonly hemisphere?: string;
  readonly preset?: string;
  readonly density?: string | number;
  readonly config?: string | SettingsV1;
  readonly input?: string | SnapshotV1;
  readonly writeSnapshot?: boolean | string;
  readonly motion?: string;
  readonly layout?: string;
  readonly style?: string;
  readonly artStyle?: string;
  readonly villageStyle?: string;
  readonly normalization?: string;
  readonly maxCount?: string | number;
  readonly layoutSeed?: string;
  readonly format?: string;
  readonly scale?: string | number;
  readonly onProgress?: (message: string) => void;
}

export interface TerrainGenerationResult {
  readonly darkPath: string;
  readonly lightPath: string;
  readonly darkPngPath?: string;
  readonly lightPngPath?: string;
  readonly snapshotPath?: string;
  readonly themeName: string;
  readonly themeDisplayName: string;
  readonly presetName: VillagePreset;
  readonly density: number;
}

export interface TerrainGeneratorDependencies {
  readonly fetchContributions: typeof fetchContributions;
  readonly getTheme: (name: string) => Theme | undefined;
  readonly listThemes: () => string[];
  readonly getDefaultTheme: () => string;
  readonly makeDirectory: (path: string) => Promise<void>;
  readonly writeFile: (path: string, content: string) => Promise<void>;
  readonly readFile?: (path: string) => Promise<string>;
  readonly writeBinaryFile?: (path: string, content: Uint8Array) => Promise<void>;
  readonly renderPng?: (svg: string, options: PngOptions) => Promise<Uint8Array>;
}
