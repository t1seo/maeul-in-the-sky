import { chromium, type Page } from '@playwright/test';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fontFile, sha256 } from './measure.js';

const directory = process.argv[2] ?? 'evidence/svg-optimization/initial';
const output = `${directory}/browser`;
await mkdir(output, { recursive: true });
const font = await readFile(fontFile);
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 840, height: 240 },
  deviceScaleFactor: 1,
});
await context.route('https://optimization.test/font.ttf', (route) =>
  route.fulfill({
    contentType: 'font/ttf',
    body: font,
    headers: { 'access-control-allow-origin': '*' },
  }),
);
const page = await context.newPage();
const comparisons = [];

async function capture(svg: string, name: string, time: number, reduced: boolean): Promise<Buffer> {
  await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await page.setContent(
    `<style>@font-face{font-family:'Noto Sans KR';src:url('https://optimization.test/font.ttf')}body{margin:0;background:${name.includes('light') ? '#fff' : '#0d1117'}}</style>${svg}`,
  );
  await page.evaluate(async (ms) => {
    await document.fonts.load('12px "Noto Sans KR"');
    await document.fonts.ready;
    document.documentElement.getBoundingClientRect();
    const root = document.querySelector('svg');
    if (!(root instanceof SVGSVGElement)) throw new TypeError('Expected SVG root');
    const animations = document.getAnimations();
    for (const animation of animations) {
      animation.pause();
    }
    await Promise.all(animations.map((animation) => animation.ready));
    for (const animation of animations) animation.currentTime = ms;
    for (const svg of document.querySelectorAll('svg')) {
      svg.pauseAnimations();
      svg.setCurrentTime(ms / 1000);
    }
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }, time);
  const screenshot = await page.screenshot({
    path: `${output}/${name}-${reduced ? 'reduce' : 'normal'}-${time}.png`,
  });
  const timing = await page.evaluate(() => ({
    svg: Array.from(document.querySelectorAll('svg'), (svg) => ({
      time: svg.getCurrentTime(),
      paused: svg.animationsPaused(),
    })),
    css: document.getAnimations().map((animation) => ({
      time: animation.currentTime,
      state: animation.playState,
      pending: animation.pending,
    })),
    smil: Array.from(document.querySelectorAll('animate, animateTransform'), (animation) => {
      const parent = animation.parentElement;
      const matrix = parent instanceof SVGGraphicsElement ? parent.getCTM() : null;
      return {
        type: animation.tagName,
        parent: parent?.tagName,
        transform: parent?.getAttribute('transform'),
        matrix: matrix
          ? { a: matrix.a, b: matrix.b, c: matrix.c, d: matrix.d, e: matrix.e, f: matrix.f }
          : null,
      };
    }),
  }));
  if (
    timing.svg.some((svg) => !svg.paused || svg.time !== time / 1000) ||
    timing.css.some(
      (animation) => animation.state !== 'paused' || animation.pending || animation.time !== time,
    )
  ) {
    throw new TypeError(`Browser animation timing was not frozen: ${name}`);
  }
  await writeFile(
    `${output}/${name}-${reduced ? 'reduce' : 'normal'}-${time}.state.json`,
    JSON.stringify(timing),
  );
  return screenshot;
}

async function pngDelta(target: Page, before: Buffer, after: Buffer) {
  return target.evaluate(
    async ({ a, b }) => {
      const images: Uint8ClampedArray[] = [];
      for (const data of [a, b]) {
        const img = new Image();
        img.src = data;
        await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new TypeError('Canvas context unavailable');
        ctx.drawImage(img, 0, 0);
        images.push(ctx.getImageData(0, 0, img.width, img.height).data);
      }
      const [x, y] = images;
      let changed = 0;
      let sum = 0;
      let max = 0;
      for (let i = 0; i < x.length; i += 4) {
        let local = 0;
        for (let c = 0; c < 4; c++) {
          const delta = Math.abs(x[i + c] - y[i + c]);
          sum += delta;
          local = Math.max(local, delta);
          max = Math.max(max, delta);
        }
        if (local) changed++;
      }
      return {
        changedPixels: changed,
        changedFraction: changed / (x.length / 4),
        meanAbsoluteChannelDelta: sum / x.length,
        maxChannelDelta: max,
      };
    },
    {
      a: `data:image/png;base64,${before.toString('base64')}`,
      b: `data:image/png;base64,${after.toString('base64')}`,
    },
  );
}

try {
  const files = await readdir(directory);
  for (const input of files.filter((name) => name.endsWith('-identity.svg'))) {
    const base = input.replace(/-identity\.svg$/, '');
    const source = await readFile(`${directory}/${input}`, 'utf8');
    for (const reduced of [false, true])
      for (const time of [0, 1000]) {
        const original = await capture(source, `${base}-identity`, time, reduced);
        const repeated = await capture(source, `${base}-identity-repeat`, time, reduced);
        const control = await pngDelta(page, original, repeated);
        comparisons.push({
          base,
          candidate: 'identity-repeat',
          reduced,
          time,
          sourceHash: sha256(source),
          outputHash: sha256(source),
          pixels: control,
        });
        console.log(
          JSON.stringify({ base, candidate: 'identity-repeat', reduced, time, pixels: control }),
        );
        for (const candidate of ['geometry', 'geometry-path', 'static-pine-use', 'svgo-path']) {
          const file = `${base}-${candidate}.svg`;
          if (!files.includes(file)) continue;
          const svg = await readFile(`${directory}/${file}`, 'utf8');
          const optimized = await capture(svg, `${base}-${candidate}`, time, reduced);
          const result = {
            base,
            candidate,
            reduced,
            time,
            sourceHash: sha256(source),
            outputHash: sha256(svg),
            pixels: await pngDelta(page, original, optimized),
          };
          comparisons.push(result);
          console.log(JSON.stringify(result));
        }
      }
  }
  await writeFile(
    `${output}/results.json`,
    JSON.stringify(
      {
        browser: browser.version(),
        fontFile,
        fontHash: sha256(font),
        viewport: '840x240 DPR1, exact CSS + SMIL timeline at 0/1000ms',
        comparisons,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
