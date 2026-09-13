import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { chromium, type Browser } from '@playwright/test';
import { startQaServer } from '../qa/server.js';
import { benchmarkReportSchema } from './schema.js';

const reportPath = resolve(process.argv[2] ?? '.orca/maeul-improvements/evidence/T02/before.json');
const report = benchmarkReportSchema.parse(JSON.parse(await readFile(reportPath, 'utf8')));
const directory = resolve(dirname(reportPath), 'browser');
await mkdir(directory, { recursive: true });
for (const fixture of report.fixtures) {
  for (const mode of ['dark', 'light'] as const) {
    await writeFile(
      resolve(directory, `${fixture.name}-${mode}.svg`),
      await readFile(fixture.artifacts[`${mode}Svg`]),
    );
  }
}
await writeFile(
  resolve(directory, 'index.html'),
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Historical terrain benchmark</title><style>body{margin:0;font:16px system-ui;background:#eee}h1{font-size:20px;padding:12px}figure{margin:12px 0}figcaption{padding:8px}img{display:block;width:100%;height:auto}.dark{background:#0d1117;color:white}.light{background:white;color:#111}</style><h1>Terrain samples: ${report.source.historical ? 'historical renderer' : 'current renderer'}</h1>${report.fixtures.map(({ name }) => ['dark', 'light'].map((mode) => `<figure class="${mode}"><figcaption>${name} / ${mode}</figcaption><img src="${name}-${mode}.svg" alt="${name} ${mode} terrain"></figure>`).join('')).join('')}</html>`,
);
const server = await startQaServer({ root: directory });
let browser: Browser | undefined;
const actions: string[] = [];
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const response = await page.goto(server.url);
  actions.push(`GET ${server.url}: ${response?.status()}`);
  if (response?.status() !== 200) throw new Error('Gallery did not load');
  await page.locator('img').evaluateAll(async (images) => {
    await Promise.all(
      images.map((node) =>
        node instanceof HTMLImageElement
          ? node.decode()
          : Promise.reject(new Error('Expected image')),
      ),
    );
  });
  const mobile = resolve(directory, 'mobile-before.png');
  await page.screenshot({ path: mobile, fullPage: true });
  actions.push(`390x844 viewport, six SVG images decoded; screenshot ${mobile}`);
  await page.setViewportSize({ width: 840, height: 900 });
  await page.screenshot({ path: resolve(directory, 'desktop-before.png'), fullPage: true });
  actions.push(
    '840x900 viewport screenshot; reduced motion requested (historical renderer policy preserved)',
  );
} finally {
  try {
    await browser?.close();
  } finally {
    await server.close();
    actions.push('Browser and owned loopback server closed');
    await writeFile(resolve(directory, 'actions.json'), `${JSON.stringify(actions, null, 2)}\n`);
  }
}
console.log(`Browser screenshots: ${directory}`);
