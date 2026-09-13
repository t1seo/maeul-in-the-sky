import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import { z } from 'zod';
import { parseBoundary } from '../core/settings/boundary.js';
import type { ColorMode } from '../core/types.js';

export interface PngOptions {
  readonly mode: ColorMode;
  readonly scale?: number;
  readonly wasmPath?: string;
  readonly fontPath?: string;
}

let initialization: Promise<void> | undefined;
let defaultFont: Promise<Uint8Array> | undefined;

async function readBundledFile(bundled: URL, source: () => string | URL): Promise<Uint8Array> {
  try {
    return await readFile(bundled);
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error;
    return readFile(source());
  }
}

async function initialize(wasmPath?: string): Promise<void> {
  const bytes = wasmPath
    ? await readFile(wasmPath)
    : await readBundledFile(new URL('./resvg.wasm', import.meta.url), () =>
        createRequire(import.meta.url).resolve('@resvg/resvg-wasm/index_bg.wasm'),
      );
  await initWasm(new Uint8Array(bytes));
}

/** Rasterize a freshly rendered motion=off SVG with an opaque mode background. */
export async function renderPng(svg: string, options: PngOptions): Promise<Uint8Array> {
  const scale = parseBoundary(z.number().int().min(1).max(4), options.scale ?? 2, 'scale');
  const mode = parseBoundary(z.enum(['dark', 'light']), options.mode, 'mode');
  initialization ??= initialize(options.wasmPath).catch((error: unknown) => {
    initialization = undefined;
    throw error;
  });
  await initialization;
  const font = options.fontPath
    ? await readFile(options.fontPath)
    : await (defaultFont ??= readBundledFile(
        new URL('./fonts/NotoSansKR.ttf', import.meta.url),
        () => new URL('../../assets/fonts/NotoSansKR.ttf', import.meta.url),
      ));
  const renderer = new Resvg(svg, {
    fitTo: { mode: 'zoom', value: scale },
    background: mode === 'dark' ? '#0d1117' : '#ffffff',
    font: {
      fontBuffers: [font],
      defaultFontFamily: 'Noto Sans KR',
      sansSerifFamily: 'Noto Sans KR',
    },
  });
  try {
    const image = renderer.render();
    try {
      return new Uint8Array(image.asPng());
    } finally {
      image.free();
    }
  } finally {
    renderer.free();
  }
}
