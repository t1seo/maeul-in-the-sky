import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { performance } from 'node:perf_hooks';
import { Resvg } from '@resvg/resvg-js';

export const fontFile = 'assets/fonts/NotoSansKR.ttf';
export const sha256 = (value: string | Uint8Array): string =>
  createHash('sha256').update(value).digest('hex');

export function measure(operation: () => unknown, warmup = 5, samples = 20) {
  for (let i = 0; i < warmup; i++) operation();
  const times: number[] = [];
  for (let i = 0; i < samples; i++) {
    const start = performance.now();
    operation();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  return {
    medianMs: times[Math.floor(samples / 2)],
    p95Ms: times[Math.ceil(samples * 0.95) - 1],
    warmup,
    samples,
  };
}

export function sizes(svg: string) {
  return {
    rawBytes: Buffer.byteLength(svg),
    gzipBytes: gzipSync(svg).byteLength,
    sha256: sha256(svg),
  };
}

export function raster(svg: string, mode: 'dark' | 'light', scale = 1) {
  return new Resvg(svg, {
    background: mode === 'dark' ? '#0d1117' : '#ffffff',
    fitTo: { mode: 'zoom', value: scale },
    font: {
      fontFiles: [fontFile],
      loadSystemFonts: false,
      defaultFontFamily: 'Noto Sans KR',
      sansSerifFamily: 'Noto Sans KR',
    },
  }).render();
}

export function pixelDelta(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) throw new RangeError('Raster dimensions differ');
  let changed = 0;
  let absolute = 0;
  let maximum = 0;
  for (let i = 0; i < a.length; i += 4) {
    let local = 0;
    for (let c = 0; c < 4; c++) {
      const difference = Math.abs(a[i + c] - b[i + c]);
      absolute += difference;
      maximum = Math.max(maximum, difference);
      local = Math.max(local, difference);
    }
    if (local > 0) changed++;
  }
  return {
    changedPixels: changed,
    totalPixels: a.length / 4,
    changedFraction: changed / (a.length / 4),
    meanAbsoluteChannelDelta: absolute / a.length,
    maxChannelDelta: maximum,
  };
}
