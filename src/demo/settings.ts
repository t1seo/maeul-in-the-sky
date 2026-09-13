import { parseSettings } from '../core/settings/parse.js';
import type { SettingsV1 } from '../core/snapshot-types.js';
import { html, input, select } from './dom.js';

export function readForm(preset: string): SettingsV1 {
  const year = input('year').value.trim();
  const layoutSeed = input('layout-seed').value;
  return parseSettings({
    schemaVersion: 1,
    kind: 'maeul-settings',
    username: input('username').value,
    ...(year ? { year: Number(year) } : {}),
    settings: {
      preset,
      title: input('title').value,
      density: Number(input('density').value),
      hemisphere: select('hemisphere').value,
      motion: select('motion').value,
      layout: select('layout').value,
      style: select('style').value,
      normalization:
        select('normalization').value === 'fixed'
          ? { kind: 'fixed', maxCount: Number(input('max-count').value) }
          : { kind: 'relative' },
      ...(layoutSeed ? { layoutSeed } : {}),
    },
  });
}

export function writeForm(document: SettingsV1): void {
  const { settings } = document;
  input('username').value = document.username;
  input('year').value = document.year === undefined ? '' : String(document.year);
  input('title').value = settings.title;
  input('density').value = String(settings.density);
  input('layout-seed').value = settings.layoutSeed ?? '';
  select('hemisphere').value = settings.hemisphere;
  select('motion').value = settings.motion;
  select('layout').value = settings.layout;
  select('style').value = settings.style;
  select('normalization').value = settings.normalization.kind;
  if (settings.normalization.kind === 'fixed') {
    input('max-count').value = String(settings.normalization.maxCount);
  }
  updateFormLabels();
}

export function updateFormLabels(): void {
  html('density-value').textContent = input('density').value;
  html('max-count-field').hidden = select('normalization').value !== 'fixed';
}
