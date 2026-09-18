import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { gzipSync } from 'node:zlib';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import { PIXEL_ROOT } from './fingerprint.js';

const lane = resolve(PIXEL_ROOT, '.orca/asset-overhaul/lanes/pixel');
const result = await build({
  entryPoints: [resolve(PIXEL_ROOT, 'src/themes/terrain/pixel/render.ts')],
  bundle: true,
  platform: 'browser',
  format: 'esm',
  minify: true,
  metafile: true,
  outfile: resolve(lane, 'pixel-runtime.js'),
});
writeFileSync(resolve(lane, 'browser-metafile.json'), JSON.stringify(result.metafile, null, 2));
const code = readFileSync(resolve(lane, 'pixel-runtime.js'));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1024, height: 760 },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    '<html><body style="margin:20px;background:#eef2e8;font:16px sans-serif"><h1>Static pixel SVG — Chromium</h1><main></main></body></html>',
  );
  const verification = await page.evaluate(
    async ({ moduleData, palette }) => {
      const module: unknown = await import(`data:text/javascript;base64,${moduleData}`);
      if (typeof module !== 'object' || module === null || !('renderPixelAsset' in module))
        throw new TypeError('Missing browser module');
      const render = module.renderPixelAsset;
      if (typeof render !== 'function') throw new TypeError('Missing browser renderer export');
      const ids = ['pine', 'hanok', 'ricePaddy', 'choga', 'sotdae', 'pagoda'];
      const outputs = ids.map((id) => {
        const svg: unknown = render(id, 0, 0, palette);
        if (typeof svg !== 'string') throw new TypeError('Renderer is not synchronous');
        return svg;
      });
      const main = document.querySelector('main');
      if (!main) throw new TypeError('Missing evidence canvas');
      main.innerHTML = outputs
        .map(
          (art, index) =>
            `<section style="display:inline-block;width:300px;text-align:center"><p>${ids[index]}</p><svg xmlns="http://www.w3.org/2000/svg" width="300" height="260" viewBox="-18 -26 36 32">${art}</svg></section>`,
        )
        .join('');
      return {
        ids,
        paths: document.querySelectorAll('path').length,
        curves: document.querySelectorAll('circle,ellipse,polygon').length,
        synchronous: true,
      };
    },
    { moduleData: code.toString('base64'), palette: getTerrainPalette100('light').assets },
  );
  await page.screenshot({ path: resolve(lane, 'browser-pixel.png'), fullPage: true });
  writeFileSync(
    resolve(lane, 'browser-verification.json'),
    JSON.stringify(
      {
        ...verification,
        bundleBytes: code.byteLength,
        bundleGzipBytes: gzipSync(code).byteLength,
        externalImports: Object.values(result.metafile.outputs).flatMap((output) => output.imports),
        runtimeInputs: Object.keys(result.metafile.inputs),
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(verification));
} finally {
  await browser.close();
}
