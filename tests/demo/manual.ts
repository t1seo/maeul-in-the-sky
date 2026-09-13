import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { startQaServer } from '../../scripts/qa/server.js';
import { verifySetup } from './manual-setup.js';
import { verifyExplorer } from './manual-explorer.js';

const evidence = '.orca/maeul-improvements/evidence/T12/manual';
await mkdir(evidence, { recursive: true });
const actions: { readonly action: string; readonly detail?: unknown }[] = [];
const record = async (action: string, detail?: unknown): Promise<void> => {
  actions.push({ action, detail });
  await writeFile(
    `${evidence}/actions.jsonl`,
    actions.map((entry) => JSON.stringify(entry)).join('\n'),
  );
  console.log(action);
};
const server = await startQaServer({ root: 'docs/demo', port: 0 });
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  acceptDownloads: true,
});
const errors: string[] = [];
page.on('pageerror', (error) => errors.push(error.message));
try {
  await record('Started owned static QA server and real Chrome', { url: server.url });
  await verifySetup(page, server.url, evidence, record);
  await verifyExplorer(page, evidence, record);
  if (errors.length) throw new Error(`Unexpected page errors: ${errors.join('; ')}`);
  await writeFile(
    `${evidence}/result.json`,
    JSON.stringify({ passed: true, actions: actions.length, errors }, null, 2),
  );
} catch (error) {
  await page.screenshot({ path: `${evidence}/failure.png`, fullPage: true });
  await writeFile(
    `${evidence}/result.json`,
    JSON.stringify(
      { passed: false, error: error instanceof Error ? error.message : String(error), errors },
      null,
      2,
    ),
  );
  throw error;
} finally {
  await browser.close();
  await server.close();
  await writeFile(
    `${evidence}/cleanup.txt`,
    `Closed owned Chrome context and static server ${server.url}.\n`,
  );
}
