import { parseSettings } from '../core/settings/parse.js';
import type { SettingsV1 } from '../core/snapshot-types.js';
import { element, errorMessage, html, input, select } from './dom.js';
import { VILLAGE_PRESETS } from '../core/presets.js';
import type { DemoSettings } from './state.js';

export function updatePresentationLabels(settings: DemoSettings): void {
  const preset = VILLAGE_PRESETS[settings.document.settings.preset];
  html('preset-name').textContent = preset.displayName;
  html('preset-description').textContent = preset.description;
  document
    .querySelectorAll<HTMLButtonElement>('[data-preset]')
    .forEach((node) =>
      node.setAttribute(
        'aria-pressed',
        String(node.dataset.preset === settings.document.settings.preset),
      ),
    );
  document
    .querySelectorAll<HTMLButtonElement>('button[data-mode]')
    .forEach((node) =>
      node.setAttribute('aria-pressed', String(node.dataset.mode === settings.mode)),
    );
}

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
      artStyle: select('art-style').value,
      terrainMode: select('terrain-mode').value,
      ...(select('terrain-mode').value === 'landscape'
        ? { landscapeLayout: select('landscape-layout').value }
        : {}),
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
  select('art-style').value = settings.artStyle;
  select('terrain-mode').value = settings.terrainMode ?? 'calendar';
  select('landscape-layout').value = settings.landscapeLayout ?? 'island';
  select('normalization').value = settings.normalization.kind;
  if (settings.normalization.kind === 'fixed') {
    input('max-count').value = String(settings.normalization.maxCount);
  }
  updateFormLabels();
}

export function updateFormLabels(): void {
  html('density-value').textContent = input('density').value;
  html('max-count-field').hidden = select('normalization').value !== 'fixed';
  const classic = select('renderer-version').value === 'classic';
  const landscape = select('terrain-mode').value === 'landscape';
  select('terrain-mode').disabled = classic;
  html('landscape-layout-field').hidden = !landscape;
  html('normalization-label').textContent = landscape ? 'Activity scale' : 'Height scale';
  html('terrain-note').textContent = classic
    ? 'Classic artwork supports the calendar terrain only. Choose Current to explore landscapes.'
    : landscape
      ? 'Explore mountains, coasts and village paths. Daily contributions keep their own rewards; terrain elevation comes from geography.'
      : 'The original dated calendar terrain. Height follows contribution activity.';
}

export function setupSettingsForm(
  preset: () => string,
  apply: (document: SettingsV1, commit: boolean) => void,
  edit: () => void,
  showError: (message: string) => void,
): void {
  const form = element('#settings-form', HTMLFormElement);
  form.addEventListener('submit', (event) => event.preventDefault());
  for (const event of ['input', 'change']) {
    form.addEventListener(event, () => {
      edit();
      if (event === 'input') updateFormLabels();
      try {
        apply(readForm(preset()), event === 'change');
      } catch (error) {
        showError(errorMessage(error));
      }
    });
  }
}
