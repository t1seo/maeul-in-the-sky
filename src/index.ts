#!/usr/bin/env node
import packageJson from '../package.json' with { type: 'json' };
import { createCliProgram } from './cli/program.js';

try {
  await createCliProgram(packageJson.version).parseAsync();
} catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
