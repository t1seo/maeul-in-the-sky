import { parseProfileOptions } from './profile/options.js';
import { renderProfile } from './profile/run.js';

const interrupted = new AbortController();
const stop = (): void => interrupted.abort(new Error('Profile capture interrupted.'));
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
try {
  const options = parseProfileOptions(process.argv.slice(2));
  const signal = AbortSignal.any([interrupted.signal, AbortSignal.timeout(240_000)]);
  const result = await renderProfile(options, signal);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Profile capture failed.');
  process.exitCode = 1;
} finally {
  process.removeListener('SIGINT', stop);
  process.removeListener('SIGTERM', stop);
}
