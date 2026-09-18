import type { SettingsV1 } from '../core/snapshot-types.js';
import type { ColorMode } from '../core/types.js';
import { z } from 'zod';
import { parseSettings } from '../core/settings/parse.js';

export type DemoSettings = { readonly document: SettingsV1; readonly mode: ColorMode };

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
  return {
    document: parseSettings({
      schemaVersion: 1,
      kind: 'maeul-settings',
      username: query.get('user') ?? 'octocat',
      ...(query.has('year') ? { year: Number(query.get('year')) } : {}),
      settings,
    }),
    mode: z.enum(['dark', 'light']).parse(query.get('mode') ?? (light ? 'light' : 'dark')),
  };
}

export function demoQuery({ document, mode }: DemoSettings): string {
  const settings = document.settings;
  const query = new URLSearchParams({
    v: '1',
    user: document.username,
    preset: settings.preset,
    mode,
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
  if (settings.normalization.kind === 'fixed') {
    query.set('normalization', 'fixed');
    query.set('maxCount', String(settings.normalization.maxCount));
  }
  return `?${query}`;
}
