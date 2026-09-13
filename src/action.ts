import * as core from '@actions/core';
import { executeGeneration, runAction } from './cli/action.js';

void runAction({
  getInput: core.getInput,
  info: core.info,
  setOutput: core.setOutput,
  setFailed: core.setFailed,
  env: process.env,
  generate: executeGeneration,
});
