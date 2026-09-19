import { VILLAGE_PRESETS, isVillagePreset } from '../core/presets.js';
import type { SettingsV1, SnapshotV1 } from '../core/snapshot-types.js';
import type { TerrainRenderResult } from '../core/scene-types.js';
import { setupArchive } from './archive.js';
import { button, click, element, errorMessage, html, input, safeAction, status } from './dom.js';
import { setupEncyclopedia, updateEncyclopedia } from './encyclopedia.js';
import { setupZoom, updateExplorer } from './explorer.js';
import { parseImportedData, readImportFile } from './imports.js';
import { fetchPreview, localCapability } from './local-client.js';
import { renderSnapshot } from './preview.js';
import { CURRENT_RENDERER } from './renderers.js';
import { setupVersionSelector } from './version-selector.js';
import { setupSceneDownloads } from './scene-downloads.js';
import { sampleSnapshot } from './sample.js';
import { readForm, updateFormLabels, updatePresentationLabels, writeForm } from './settings.js';
import { disableSetup, setupExports, updateSetup } from './setup-panel.js';
import { demoQuery, parseDemoQuery, type DemoSettings } from './state.js';
import { consumeDemoTransfer, setupWorldBridge } from './world-bridge.js';

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
  const initialRenderer = settings.renderer;
  settings = { ...settings, renderer: 'current' };
  let renderer = CURRENT_RENDERER;
  let snapshot = sampleSnapshot();
  let output = renderSnapshot(snapshot, settings.document.settings);
  let valid = !initialError;
  let editRevision = 0;
  const form = element('#settings-form', HTMLFormElement);
  const settingsUrl = () =>
    `${window.location.pathname}${demoQuery(settings)}${window.location.hash}`;
  const replaceHistory = () => window.history.replaceState({}, '', settingsUrl());
  const currentSnapshot = (): SnapshotV1 => ({ ...snapshot, settings: settings.document.settings });
  const sourceSnapshot = () => snapshot;
  const bridge = setupWorldBridge(sourceSnapshot, () => settings.renderer, currentSnapshot);
  const synchronize = (push = false, prepared?: TerrainRenderResult): void => {
    output =
      prepared ??
      renderSnapshot(currentSnapshot(), settings.document.settings, 'village', renderer);
    updateExplorer(output, snapshot, settings.mode);
    html('preview-panel').dataset.renderer = renderer.version;
    updateEncyclopedia(output.metadata);
    bridge.refresh();
    if (valid) updateSetup(settings.document, settings.renderer);
    else disableSetup(html('settings-error').textContent ?? initialError);
    updatePresentationLabels(settings);
    const next = settingsUrl();
    const previous = window.location.pathname + window.location.search + window.location.hash;
    if (push && previous !== next) window.history.pushState({}, '', next);
  };
  const showValidation = (message = ''): void => {
    valid = !message;
    html('settings-error').textContent = message;
    html('settings-error').hidden = !message;
    if (message) disableSetup(message);
  };
  const restore = (document: SettingsV1, push = true, prepared?: TerrainRenderResult): void => {
    editRevision++;
    const rendered = prepared ?? renderSnapshot(snapshot, document.settings, 'village', renderer);
    settings = { ...settings, document };
    writeForm(document);
    input('repository').value = `${document.username}/${document.username}`;
    showValidation();
    synchronize(push, rendered);
  };
  const openSnapshot = (incoming: SnapshotV1): void => {
    const prepared = renderSnapshot(incoming, incoming.settings, 'village', renderer);
    snapshot = incoming;
    restore(
      {
        schemaVersion: 1,
        kind: 'maeul-settings',
        username: incoming.username,
        year: incoming.year,
        settings: incoming.settings,
      },
      true,
      prepared,
    );
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
  const archive = setupArchive(
    currentSnapshot,
    () => settings.mode,
    openSnapshot,
    () => renderer,
  );
  const chooseVersion = setupVersionSelector(
    () => settings,
    (nextRenderer, restored, push) => {
      const next = { ...(restored ?? settings), renderer: nextRenderer.version };
      const prepared = renderSnapshot(snapshot, next.document.settings, 'village', nextRenderer);
      renderer = nextRenderer;
      settings = next;
      if (restored) {
        writeForm(settings.document);
        input('repository').value = `${settings.document.username}/${settings.document.username}`;
        showValidation();
      }
      synchronize(push, prepared);
      if (!push) replaceHistory();
      archive.refresh();
    },
    replaceHistory,
    undefined,
    () => editRevision,
  );
  setupEncyclopedia();
  const currentScene = () => ({
    output,
    mode: settings.mode,
    snapshot: currentSnapshot(),
    renderer,
  });
  setupZoom(currentScene);
  setupSceneDownloads(currentScene);
  setupExports(
    () => ({ ...settings, document: readForm(settings.document.settings.preset) }),
    restore,
  );
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', () => {
    editRevision++;
    updateFormLabels();
    try {
      const document = readForm(settings.document.settings.preset);
      settings = { ...settings, document };
      updateSetup(document, settings.renderer);
      showValidation();
    } catch (error) {
      showValidation(errorMessage(error));
    }
  });
  form.addEventListener('change', () => {
    editRevision++;
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
        editRevision++;
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
        editRevision++;
        settings = { ...settings, mode };
        synchronize(true);
        archive.refresh();
      }),
    ),
  );
  window.addEventListener('popstate', () => {
    try {
      const restored = parseDemoQuery(window.location.search);
      void chooseVersion(restored.renderer, restored, false);
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
  consumeDemoTransfer(openSnapshot);
  if (initialRenderer === 'classic') void chooseVersion(initialRenderer, undefined, false);
  if (initialError)
    showValidation(
      `Invalid settings link: ${initialError}. Correct your settings to enable workflow export.`,
    );
}

safeAction(main);
