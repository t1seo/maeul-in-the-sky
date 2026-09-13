import { resolve } from 'node:path';
import { startQaServer } from '../../scripts/qa/server.js';

const server = await startQaServer({
  root: resolve(import.meta.dirname, '../..'),
  port: Number(process.env.MAEUL_QA_PORT ?? '4317'),
});
console.log(`Browser QA serving ${server.url}/docs/demo/`);
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void server.close();
  });
}
