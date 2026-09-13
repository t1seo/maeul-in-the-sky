import { Command } from 'commander';
import { z } from 'zod';
import { parseBoundary } from '../core/settings/boundary.js';
import { executeGeneration, operationPaths } from '../generate/operation.js';
import { startPreviewServer } from '../preview/server.js';

const optionText = z.string().min(1).optional();
const cliSchema = z.strictObject({
  user: optionText,
  theme: optionText,
  title: z.string().optional(),
  output: optionText,
  year: optionText,
  years: optionText,
  token: z.string().optional(),
  hemisphere: optionText,
  preset: optionText,
  density: optionText,
  config: optionText,
  input: optionText,
  writeSnapshot: z.union([z.boolean(), z.string()]).optional(),
  motion: optionText,
  layout: optionText,
  style: optionText,
  villageStyle: optionText,
  normalization: optionText,
  maxCount: optionText,
  format: optionText,
  scale: optionText,
  layoutSeed: z.string().optional(),
});

export interface CliDependencies {
  readonly generate: typeof executeGeneration;
  readonly preview: typeof startPreviewServer;
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly log: (message: string) => void;
}

export function createCliProgram(
  version: string,
  dependencies: CliDependencies = {
    generate: executeGeneration,
    preview: startPreviewServer,
    env: process.env,
    log: console.log,
  },
): Command {
  const program = new Command()
    .name('maeul-sky')
    .description('Build an isometric village from a GitHub Contribution Calendar')
    .version(version)
    .option('-u, --user <username>', 'GitHub username (inferred from snapshot input)')
    .option('-t, --theme <name>', 'Theme name')
    .option('--title <text>', 'Custom title')
    .option('-o, --output <dir>', 'Output directory (default: current directory)')
    .option('-y, --year <number>', 'Year (omit for rolling 52 weeks)')
    .option('--years <years>', 'Compare 2–5 comma-separated years')
    .option('--token <token>', 'GitHub token (overrides GITHUB_TOKEN)')
    .option('--hemisphere <value>', 'north or south')
    .option('--preset <name>', 'nature, balanced, civilization')
    .option('--density <number>', 'Building density 1–10')
    .option('--config <path>', 'Settings JSON file')
    .option('--input <path>', 'Snapshot or archive JSON (no network)')
    .option('--write-snapshot [path]', 'Write a reusable snapshot JSON')
    .option('--motion <mode>', 'full, subtle, off')
    .option('--layout <layout>', 'banner or card')
    .option('--style <style>', 'classic or korean')
    .option('--village-style <style>', 'Alias for --style')
    .option('--normalization <kind>', 'relative, fixed, shared (archive only)')
    .option('--max-count <count>', 'Fixed contribution maximum')
    .option('--layout-seed <seed>', 'Override the deterministic village seed')
    .option('--format <format>', 'svg, png, both (default: svg)')
    .option('--scale <number>', 'PNG scale 1–4 (default: 2)')
    .action(async (raw: unknown) => {
      const { user, output, token, ...options } = parseBoundary(cliSchema, raw, 'options');
      const operation = await dependencies.generate({
        ...options,
        username: user,
        outputDir: output,
        token: token || dependencies.env.GITHUB_TOKEN,
        onProgress: dependencies.log,
      });
      for (const path of operationPaths(operation)) dependencies.log(`Written: ${path}`);
    });
  program
    .command('preview')
    .description('Start a private local preview using GITHUB_TOKEN')
    .option('--port <number>', 'Loopback port (default: 4318)')
    .action(async (raw: unknown) => {
      const options = parseBoundary(
        z.object({ port: z.coerce.number().int().min(0).max(65535).optional() }),
        raw,
        'preview',
      );
      const handle = await dependencies.preview({ port: options.port ?? 4318 });
      dependencies.log(`Preview: ${handle.url}`);
      const stop = () => {
        void handle.close().catch((error: unknown) => {
          dependencies.log(error instanceof Error ? error.message : String(error));
          process.exitCode = 1;
        });
      };
      process.once('SIGINT', stop);
      process.once('SIGTERM', stop);
      handle.server.once('close', () => {
        process.off('SIGINT', stop);
        process.off('SIGTERM', stop);
      });
    });
  return program;
}
