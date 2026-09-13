import { VILLAGE_PRESETS, isVillagePreset } from '../core/presets.js';
import { serializeSnapshot } from '../core/settings/serialize.js';
import type { SettingsV1, SnapshotV1 } from '../core/snapshot-types.js';
import { setupArchive } from './archive.js';
import { button, click, element, errorMessage, html, input, safeAction, status } from './dom.js';
import { downloadBlob, downloadText, pngBlob } from './downloads.js';
import { setupEncyclopedia, updateEncyclopedia } from './encyclopedia.js';
import { setupZoom, updateExplorer } from './explorer.js';
import { parseImportedData, readImportFile } from './imports.js';
import { fetchPreview, localCapability } from './local-client.js';
import { renderOptions, renderSnapshot, staticSnapshotSvg } from './preview.js';
import { sampleSnapshot } from './sample.js';
import { readForm, updateFormLabels, writeForm } from './settings.js';
import { disableSetup, setupExports, updateSetup } from './setup-panel.js';
import { demoQuery, parseDemoQuery, type DemoSettings } from './state.js';

declare global {
  interface Window {
    maeulEnhanced?: boolean;
    maeulInitialSearch?: string;
  }
}

function main(): void {
  let settings: DemoSettings;
  let initialError = '';
  try {
    settings = parseDemoQuery(
      window.maeulInitialSearch ?? window.location.search,
      window.matchMedia('(prefers-color-scheme: light)').matches,
    );
  } catch (error) {
    initialError = errorMessage(error);
    settings = parseDemoQuery('');
  }
  let snapshot = sampleSnapshot();
  let output = renderSnapshot(snapshot, settings.document.settings);
  let valid = !initialError;
  const currentSnapshot = (): SnapshotV1 => ({ ...snapshot, settings: settings.document.settings });
  const synchronize = (push = false): void => {
    output = renderSnapshot(currentSnapshot());
    updateExplorer(output, snapshot, settings.mode);
    updateEncyclopedia(output.metadata);
    updateSetup(settings.document);
    html('preset-name').textContent =
      VILLAGE_PRESETS[settings.document.settings.preset].displayName;
    html('preset-description').textContent =
      VILLAGE_PRESETS[settings.document.settings.preset].description;
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
    const next = `${window.location.pathname}${demoQuery(settings)}${window.location.hash}`;
    if (
      push &&
      `${window.location.pathname}${window.location.search}${window.location.hash}` !== next
    )
      window.history.pushState({}, '', next);
  };
  const showValidation = (message = ''): void => {
    valid = !message;
    html('settings-error').textContent = message;
    html('settings-error').hidden = !message;
    if (message) disableSetup(message);
  };
  const restore = (document: SettingsV1, push = true): void => {
    settings = { ...settings, document };
    writeForm(document);
    input('repository').value = `${document.username}/${document.username}`;
    showValidation();
    synchronize(push);
  };
  const openSnapshot = (incoming: SnapshotV1): void => {
    snapshot = incoming;
    restore({
      schemaVersion: 1,
      kind: 'maeul-settings',
      username: incoming.username,
      year: incoming.year,
      settings: incoming.settings,
    });
    status(
      `Opened ${incoming.source.kind} data for @${incoming.username}. ${output.metadata.stats.total.toLocaleString()} actual contributions in the supplied dates.`,
    );
  };
  writeForm(settings.document);
  input('repository').value = `${settings.document.username}/${settings.document.username}`;
  synchronize();
  document.querySelectorAll<HTMLElement>('.enhanced').forEach((node) => {
    node.hidden = false;
  });
  window.maeulEnhanced = true;
  status('Your sample village is ready. Import a snapshot to explore your own history.');
  const archive = setupArchive(currentSnapshot, () => settings.mode, openSnapshot);
  setupEncyclopedia();
  setupZoom(() => ({ output, mode: settings.mode, snapshot: currentSnapshot() }));
  setupExports(
    () => ({ ...settings, document: readForm(settings.document.settings.preset) }),
    restore,
  );
  const form = element('#settings-form', HTMLFormElement);
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', () => {
    updateFormLabels();
    try {
      updateSetup(readForm(settings.document.settings.preset));
      showValidation();
    } catch (error) {
      showValidation(errorMessage(error));
    }
  });
  form.addEventListener('change', () => {
    try {
      const document = readForm(settings.document.settings.preset);
      settings = { ...settings, document };
      showValidation();
      synchronize(true);
    } catch (error) {
      showValidation(errorMessage(error));
    }
  });
  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((node) =>
    node.addEventListener('click', () =>
      safeAction(() => {
        const preset = node.dataset.preset;
        if (!preset || !isVillagePreset(preset)) return;
        input('density').value = String(VILLAGE_PRESETS[preset].density);
        restore(readForm(preset));
      }),
    ),
  );
  document.querySelectorAll<HTMLButtonElement>('button[data-mode]').forEach((node) =>
    node.addEventListener('click', () =>
      safeAction(() => {
        const mode = node.dataset.mode;
        if (mode !== 'light' && mode !== 'dark') return;
        settings = { ...settings, mode };
        synchronize(true);
        archive.refresh();
      }),
    ),
  );
  window.addEventListener('popstate', () => {
    try {
      settings = parseDemoQuery(window.location.search);
      restore(settings.document, false);
      archive.refresh();
    } catch (error) {
      showValidation(`Invalid settings link: ${errorMessage(error)}`);
    }
  });
  input('snapshot-input').addEventListener('change', (event) =>
    safeAction(async () => {
      if (!(event.target instanceof HTMLInputElement)) return;
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const data = parseImportedData(await readImportFile(file));
        const first = data.snapshots[0];
        if (first && (await archive.importData(data))) openSnapshot(first);
      } finally {
        event.target.value = '';
      }
    }),
  );
  click('use-sample', () => {
    snapshot = sampleSnapshot();
    synchronize();
    status('Showing the fixed sample history. No account has been fetched.');
  });
  click('download-svg', () =>
    downloadText(output[settings.mode], `maeul-in-the-sky-${settings.mode}.svg`, 'image/svg+xml'),
  );
  click('download-snapshot', () =>
    downloadText(
      serializeSnapshot(currentSnapshot()),
      `maeul-${snapshot.username}-${snapshot.year}.json`,
    ),
  );
  click('download-png', async () => {
    const dimensions = renderOptions(settings.document.settings);
    const blob = await pngBlob(
      staticSnapshotSvg(currentSnapshot(), settings.mode),
      dimensions.width,
      dimensions.height,
      settings.mode === 'light',
    );
    downloadBlob(blob, `maeul-in-the-sky-${settings.mode}.png`);
    status('Downloaded a complete static PNG at 2× resolution.');
  });
  safeAction(async () => {
    const capability = await localCapability(new URL(window.location.href));
    html('service-status').textContent = capability.message;
    button('fetch-preview').disabled = !capability.available;
  });
  click('fetch-preview', async () => {
    if (!valid) {
      status('Correct the settings before fetching contributions.', true);
      return;
    }
    button('fetch-preview').disabled = true;
    status('Fetching contributions through your local preview service…');
    try {
      const incoming = await fetchPreview(
        readForm(settings.document.settings.preset),
        new URL(window.location.href),
      );
      openSnapshot(incoming);
    } finally {
      button('fetch-preview').disabled = false;
    }
  });
  if (initialError)
    showValidation(
      `Invalid settings link: ${initialError}. Correct your settings to enable workflow export.`,
    );
}

safeAction(main);
