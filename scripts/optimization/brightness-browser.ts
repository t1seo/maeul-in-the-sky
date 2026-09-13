import { chromium, type Page } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { fontFile, sha256 } from './measure.js';

const INPUT = '.orca/maeul-improvements/evidence/brightness';
const OUTPUT = `${INPUT}/browser`;
const OBSERVATION_MS = 1_200;

function traceField(event: unknown, field: 'dur' | 'name'): number | string | undefined {
  if (typeof event !== 'object' || event === null || !(field in event)) return undefined;
  const value = Reflect.get(event, field);
  return typeof value === 'number' || typeof value === 'string' ? value : undefined;
}

function summarizeTrace(events: readonly unknown[]) {
  let paintCount = 0;
  let paintDurationUs = 0;
  let rasterCount = 0;
  let rasterDurationUs = 0;
  let layoutCount = 0;
  let layoutDurationUs = 0;
  for (const event of events) {
    const name = traceField(event, 'name');
    const duration = traceField(event, 'dur');
    const microseconds = typeof duration === 'number' ? duration : 0;
    if (name === 'Paint') {
      paintCount++;
      paintDurationUs += microseconds;
    } else if (name === 'RasterTask') {
      rasterCount++;
      rasterDurationUs += microseconds;
    } else if (name === 'UpdateLayoutTree' || name === 'Layout') {
      layoutCount++;
      layoutDurationUs += microseconds;
    }
  }
  return {
    eventCount: events.length,
    paintCount,
    paintDurationUs,
    rasterCount,
    rasterDurationUs,
    layoutCount,
    layoutDurationUs,
  };
}

async function setSvg(page: Page, svg: string, mode: 'dark' | 'light'): Promise<void> {
  const background = mode === 'dark' ? '#0d1117' : '#ffffff';
  await page.setContent(
    `<style>@font-face{font-family:'Noto Sans KR';src:url('https://optimization.test/font.ttf')}html,body{margin:0;background:${background}}</style>${svg}`,
  );
  await page.evaluate(async () => {
    await document.fonts.load('12px "Noto Sans KR"');
    await document.fonts.ready;
  });
}

async function freezeAt(page: Page, milliseconds: number): Promise<void> {
  await page.evaluate(async (time) => {
    const animations = document.getAnimations();
    for (const animation of animations) animation.pause();
    await Promise.all(animations.map((animation) => animation.ready));
    for (const animation of animations) animation.currentTime = time;
    for (const svg of document.querySelectorAll('svg')) {
      svg.pauseAnimations();
      svg.setCurrentTime(time / 1_000);
    }
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  }, milliseconds);
}

async function screenshot(
  page: Page,
  svg: string,
  mode: 'dark' | 'light',
  name: string,
  time: number,
): Promise<Buffer> {
  await setSvg(page, svg, mode);
  await freezeAt(page, time);
  return page.screenshot({ path: `${OUTPUT}/${name}-${time}.png` });
}

async function pngDelta(page: Page, before: Buffer, after: Buffer) {
  return page.evaluate(
    async ({ source, target }) => {
      const pixels: Uint8ClampedArray[] = [];
      for (const data of [source, target]) {
        const image = new Image();
        image.src = data;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        if (!context) throw new TypeError('Canvas context unavailable');
        context.drawImage(image, 0, 0);
        pixels.push(context.getImageData(0, 0, image.width, image.height).data);
      }
      const [left, right] = pixels;
      let changedPixels = 0;
      let absolute = 0;
      let maximum = 0;
      for (let index = 0; index < left.length; index += 4) {
        let local = 0;
        for (let channel = 0; channel < 4; channel++) {
          const delta = Math.abs(left[index + channel] - right[index + channel]);
          absolute += delta;
          local = Math.max(local, delta);
          maximum = Math.max(maximum, delta);
        }
        if (local > 0) changedPixels++;
      }
      return {
        changedPixels,
        totalPixels: left.length / 4,
        changedFraction: changedPixels / (left.length / 4),
        meanAbsoluteChannelDelta: absolute / left.length,
        maxChannelDelta: maximum,
      };
    },
    {
      source: `data:image/png;base64,${before.toString('base64')}`,
      target: `data:image/png;base64,${after.toString('base64')}`,
    },
  );
}

async function observeAnimation(page: Page, source: string, events: unknown[]) {
  await setSvg(page, source, 'dark');
  events.length = 0;
  const session = await page.context().newCDPSession(page);
  session.on('Tracing.dataCollected', (event) => events.push(...event.value));
  await session.send('Tracing.start', {
    categories:
      'devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.frame',
    transferMode: 'ReportEvents',
  });
  const intervals = await page.evaluate(async (duration) => {
    const samples: number[] = [];
    const started = performance.now();
    let previous = started;
    while (previous - started < duration) {
      const now = await new Promise<number>((resolve) => requestAnimationFrame(resolve));
      samples.push(now - previous);
      previous = now;
    }
    return samples;
  }, OBSERVATION_MS);
  const completed = new Promise<void>((resolve) =>
    session.once('Tracing.tracingComplete', () => resolve()),
  );
  await session.send('Tracing.end');
  await completed;
  await session.detach();
  return { frames: intervals.length, intervals, trace: summarizeTrace(events) };
}

async function main(): Promise<void> {
  await mkdir(OUTPUT, { recursive: true });
  const font = await readFile(fontFile);
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 840, height: 240 } });
  await context.route('https://optimization.test/font.ttf', (route) =>
    route.fulfill({
      body: font,
      contentType: 'font/ttf',
      headers: { 'access-control-allow-origin': '*' },
    }),
  );
  const page = await context.newPage();
  const comparisons = [];
  const names = [
    'empty-dark-static',
    'empty-light-static',
    'mixed-dark-static',
    'mixed-light-static',
    'full-dark-static',
    'full-light-static',
    'mixed-dark-animated',
  ] as const;
  try {
    for (const name of names) {
      const mode = name.includes('-light-') ? 'light' : 'dark';
      const times = name.endsWith('-animated') ? [0, 1_000] : [0];
      const referenceSvg = await readFile(`${INPUT}/${name}-reference.svg`, 'utf8');
      for (const time of times) {
        const reference = await screenshot(page, referenceSvg, mode, `${name}-reference`, time);
        const repeated = await screenshot(page, referenceSvg, mode, `${name}-repeat`, time);
        comparisons.push({
          name,
          time,
          candidate: 'identity-repeat',
          pixels: await pngDelta(page, reference, repeated),
        });
        for (const candidate of ['integer', 'fractional'] as const) {
          const candidateSvg = await readFile(`${INPUT}/${name}-${candidate}.svg`, 'utf8');
          const captured = await screenshot(page, candidateSvg, mode, `${name}-${candidate}`, time);
          comparisons.push({
            name,
            time,
            candidate,
            pixels: await pngDelta(page, reference, captured),
          });
        }
      }
    }
    const reference = await readFile(`${INPUT}/mixed-dark-animated-reference.svg`, 'utf8');
    const integer = await readFile(`${INPUT}/mixed-dark-animated-integer.svg`, 'utf8');
    const observations = [];
    const events: unknown[] = [];
    for (let sample = 0; sample < 3; sample++) {
      for (const [candidate, source] of [
        ['reference', reference],
        ['integer', integer],
      ] as const) {
        observations.push({ candidate, sample, ...(await observeAnimation(page, source, events)) });
      }
    }
    const result = {
      browser: browser.version(),
      headed: true,
      viewport: '840x240 DPR1',
      font: { path: fontFile, sha256: sha256(font) },
      screenshotMethod: 'CSS and SMIL frozen at exact 0/1000ms; two animation frames settled',
      observation: `${OBSERVATION_MS}ms live mixed-dark motion-full; three paired samples; one browser`,
      comparisons,
      observations,
    };
    await writeFile(`${OUTPUT}/results.json`, `${JSON.stringify(result, null, 2)}\n`);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser.close();
  }
}

void main().catch((error: unknown) => {
  console.error(
    `${basename(import.meta.filename)}: ${error instanceof Error ? error.stack : String(error)}`,
  );
  process.exitCode = 1;
});
