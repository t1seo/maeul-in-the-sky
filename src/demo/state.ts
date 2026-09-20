import type { SettingsV1 } from '../core/snapshot-types.js';
import type { ColorMode } from '../core/types.js';
import { z } from 'zod';
import { parseSettings } from '../core/settings/parse.js';
import { rendererVersionSchema, type RendererVersion } from './renderer-version.js';
import { settingsForRenderer } from './renderer-settings.js';

export type DemoSettings = {
  readonly document: SettingsV1;
  readonly mode: ColorMode;
  readonly renderer: RendererVersion;
};

export function parseDemoQuery(search: string, light = false): DemoSettings {
  const query = new URLSearchParams(search);
  if (query.has('v')) z.literal('1').parse(query.get('v'));
  const settings: Record<string, unknown> = {};
  for (const key of [
    'preset',
    'title',
    'hemisphere',
    'motion',
    'layout',
    'layoutSeed',
    'artStyle',
    'terrainMode',
    'landscapeLayout',
  ]) {
    if (query.has(key)) settings[key] = query.get(key);
  }
  if (query.has('style') || query.has('villageStyle')) {
    settings.style = query.get('style') ?? query.get('villageStyle');
  }
  if (query.has('density')) settings.density = Number(query.get('density'));
  if (query.has('normalization')) {
    settings.normalization =
      query.get('normalization') === 'fixed'
        ? { kind: 'fixed', maxCount: Number(query.get('maxCount')) }
        : { kind: query.get('normalization') };
  }
  const renderer = rendererVersionSchema.parse(query.get('renderer') ?? 'current');
  const document = parseSettings({
    schemaVersion: 1,
    kind: 'maeul-settings',
    username: query.get('user') ?? 'octocat',
    ...(query.has('year') ? { year: Number(query.get('year')) } : {}),
    settings,
  });
  return {
    document: { ...document, settings: settingsForRenderer(document.settings, renderer) },
    mode: z.enum(['dark', 'light']).parse(query.get('mode') ?? (light ? 'light' : 'dark')),
    renderer,
  };
}

export function demoQuery({ document, mode, renderer }: DemoSettings): string {
  const settings = settingsForRenderer(document.settings, renderer);
  const query = new URLSearchParams({
    v: '1',
    user: document.username,
    preset: settings.preset,
    mode,
    renderer,
    title: settings.title,
    density: String(settings.density),
    hemisphere: settings.hemisphere,
    motion: settings.motion,
    layout: settings.layout,
    style: settings.style,
    artStyle: settings.artStyle,
  });
  if (document.year !== undefined) query.set('year', String(document.year));
  if (settings.layoutSeed !== undefined) query.set('layoutSeed', settings.layoutSeed);
  if (settings.terrainMode === 'landscape') {
    query.set('terrainMode', 'landscape');
    query.set('landscapeLayout', settings.landscapeLayout ?? 'island');
  }
  if (settings.normalization.kind === 'fixed') {
    query.set('normalization', 'fixed');
    query.set('maxCount', String(settings.normalization.maxCount));
  }
  return `?${query}`;
}
