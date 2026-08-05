/**
 * Maeul in the Sky GitHub Action entry point
 *
 * Reads action inputs, fetches contribution data, renders themed SVGs,
 * and writes them to the specified output directory.
 */

import * as core from '@actions/core';

import { resolveActionUsername } from './action-context.js';
import { generateTerrain } from './generate.js';

async function run(): Promise<void> {
  try {
    // Read inputs
    const username = resolveActionUsername(
      core.getInput('username'),
      process.env.GITHUB_REPOSITORY_OWNER,
      process.env.GITHUB_ACTOR,
    );
    if (!username) {
      throw new Error('GitHub username could not be resolved from the input or repository');
    }

    const result = await generateTerrain({
      username,
      token: core.getInput('github_token'),
      theme: core.getInput('theme'),
      title: core.getInput('title'),
      outputDir: core.getInput('output_dir'),
      year: core.getInput('year'),
      hemisphere: core.getInput('hemisphere'),
      preset: core.getInput('preset'),
      density: core.getInput('density'),
      onProgress: (message) => core.info(message),
    });

    core.info(`Written: ${result.darkPath}`);
    core.info(`Written: ${result.lightPath}`);
    core.setOutput('dark_svg_path', result.darkPath);
    core.setOutput('light_svg_path', result.lightPath);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(String(error));
    }
  }
}

run();
