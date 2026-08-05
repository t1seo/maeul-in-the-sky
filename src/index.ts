#!/usr/bin/env node

/**
 * Maeul in the Sky CLI — Transform GitHub contributions into animated terrain SVGs
 */

import { Command } from 'commander';
import packageJson from '../package.json' with { type: 'json' };

import { generateTerrain } from './generate.js';

const program = new Command();

program
  .name('maeul-sky')
  .description('Transform GitHub contributions into animated terrain SVGs')
  .version(packageJson.version)
  .requiredOption('-u, --user <username>', 'GitHub username')
  .option('-t, --theme <name>', 'Theme name')
  .option('--title <text>', 'Custom title text')
  .option('-o, --output <dir>', 'Output directory', './')
  .option('-y, --year <number>', 'Year to visualize (omit for rolling 52 weeks)')
  .option('--token <token>', 'GitHub personal access token (or use GITHUB_TOKEN env)')
  .option('--hemisphere <hemisphere>', 'Hemisphere for seasonal terrain (north or south)', 'north')
  .option('--density <number>', 'Building density 1-10 (higher = buildings at lower activity)', '5')
  .action(async (opts) => {
    try {
      const result = await generateTerrain({
        username: opts.user,
        theme: opts.theme,
        title: opts.title,
        outputDir: opts.output,
        year: opts.year,
        token: opts.token || process.env.GITHUB_TOKEN,
        hemisphere: opts.hemisphere,
        density: opts.density,
        onProgress: (message) => console.log(message),
      });
      console.log(`Written: ${result.darkPath}`);
      console.log(`Written: ${result.lightPath}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error(`Error: ${String(error)}`);
      }
      process.exitCode = 1;
    }
  });

await program.parseAsync();
