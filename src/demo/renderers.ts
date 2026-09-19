import { z } from 'zod';
import { renderTerrain } from '../browser.js';
import type { RendererVersion } from './renderer-version.js';

export type TerrainRenderer = typeof renderTerrain;
export type DemoRenderer = {
  readonly version: RendererVersion;
  readonly renderTerrain: TerrainRenderer;
};
export const CURRENT_RENDERER: DemoRenderer = { version: 'current', renderTerrain };
const archivedModule = z.object({
  renderTerrain: z.custom<TerrainRenderer>((value: unknown) => typeof value === 'function'),
});

export class RendererLoadError extends Error {
  readonly name = 'RendererLoadError';
  constructor(message: string) {
    super(message);
  }
}

export function createClassicLoader(
  importModule: (url: string) => Promise<unknown> = (url) => import(/* @vite-ignore */ url),
): () => Promise<DemoRenderer> {
  let pending: Promise<DemoRenderer> | undefined;
  let attempts = 0;
  return () => {
    if (pending) return pending;
    const url = new URL('./versions/classic/browser.js', document.baseURI);
    if (attempts > 0) url.searchParams.set('retry', String(attempts));
    attempts += 1;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<never>((_, reject) => {
      timeout = setTimeout(
        () => reject(new RendererLoadError('The classic download timed out. Please try again.')),
        15_000,
      );
    });
    pending = Promise.race([importModule(url.href), deadline])
      .then((module): DemoRenderer => ({
        version: 'classic',
        renderTerrain: archivedModule.parse(module).renderTerrain,
      }))
      .catch((error: unknown) => {
        pending = undefined;
        throw error;
      })
      .finally(() => clearTimeout(timeout));
    return pending;
  };
}

export const loadClassicRenderer = createClassicLoader();
