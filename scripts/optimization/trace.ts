import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { sha256, fontFile } from './measure.js';

const directory = process.argv[2] ?? 'evidence/svg-optimization/fresh';
const output = `${directory}/traces`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const font = await readFile(fontFile);
const rows = [];
try {
  for (const motion of ['full', 'subtle', 'off']) {
    for (const candidate of ['identity', 'geometry-path']) {
      const context = await browser.newContext({
        viewport: { width: 840, height: 240 },
        reducedMotion: 'no-preference',
      });
      const page = await context.newPage();
      const session = await context.newCDPSession(page);
      const events: unknown[] = [];
      session.on('Tracing.dataCollected', (event: { value: unknown[] }) =>
        events.push(...event.value),
      );
      const source = await readFile(`${directory}/${motion}-dark-${candidate}.svg`, 'utf8');
      await page.route('https://optimization.test/font.ttf', (route) =>
        route.fulfill({
          contentType: 'font/ttf',
          body: font,
          headers: { 'access-control-allow-origin': '*' },
        }),
      );
      await page.setContent(
        `<style>@font-face{font-family:'Noto Sans KR';src:url('https://optimization.test/font.ttf')}body{margin:0;background:#0d1117}</style>${source}`,
      );
      await page.evaluate(async () => {
        await document.fonts.load('12px "Noto Sans KR"');
        await document.fonts.ready;
      });
      await session.send('Performance.enable');
      const before = await session.send('Performance.getMetrics');
      await session.send('Tracing.start', {
        categories:
          'devtools.timeline,blink.user_timing,disabled-by-default-devtools.timeline.frame',
        transferMode: 'ReportEvents',
      });
      const intervals = await page.evaluate(
        () =>
          new Promise<number[]>((resolve) => {
            const deltas: number[] = [];
            const start = performance.now();
            let previous = start;
            requestAnimationFrame(function frame(now) {
              deltas.push(now - previous);
              previous = now;
              if (now - start >= 10000) resolve(deltas);
              else requestAnimationFrame(frame);
            });
          }),
      );
      const after = await session.send('Performance.getMetrics');
      const completed = new Promise<void>((resolve) =>
        session.once('Tracing.tracingComplete', () => resolve()),
      );
      await session.send('Tracing.end');
      await completed;
      const sorted = [...intervals].sort((a, b) => a - b);
      const row = {
        motion,
        candidate,
        sourceHash: sha256(source),
        frames: intervals.length,
        p50IntervalMs: sorted[Math.floor(sorted.length / 2)],
        p95IntervalMs: sorted[Math.floor(sorted.length * 0.95)],
        over33ms: intervals.filter((ms) => ms > 33.4).length,
        before: before.metrics,
        after: after.metrics,
        traceEvents: events.length,
      };
      rows.push(row);
      await writeFile(
        `${output}/${motion}-${candidate}.json.gz`,
        gzipSync(JSON.stringify({ traceEvents: events })),
      );
      console.log(JSON.stringify(row));
      await context.close();
    }
  }
  await writeFile(
    `${output}/results.json`,
    JSON.stringify(
      {
        browser: browser.version(),
        durationPerSampleMs: 10000,
        context:
          'Headless Chromium, shared Apple M1 desktop under concurrent worker load; one sample each; not phone/GPU/energy evidence',
        rows,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
