import { parseSettings } from '../core/settings/parse.js';
import { serializeSettings } from '../core/settings/serialize.js';
import type { SettingsV1 } from '../core/snapshot-types.js';
import { button, click, html, input, safeAction, status } from './dom.js';
import { copyOrDownload, downloadText } from './downloads.js';
import { readImportFile } from './imports.js';
import { readmeDocument, workflowDocument } from './setup.js';
import { demoQuery, type DemoSettings } from './state.js';
import { RENDERER_VERSIONS, type RendererVersion } from './renderer-version.js';

export function updateSetup(document: SettingsV1, renderer: RendererVersion = 'current'): void {
  const workflow = workflowDocument(document, renderer);
  html('workflow-version').textContent = RENDERER_VERSIONS[renderer].description;
  html('workflow-preview').textContent = workflow.ok ? workflow.content : workflow.message;
  for (const [field, id] of [
    ['title', 'title-error'],
    ['layoutSeed', 'layout-seed-error'],
  ] as const) {
    html(id).textContent = !workflow.ok && workflow.field === field ? workflow.message : '';
    html(id).hidden = workflow.ok || workflow.field !== field;
  }
  button('download-workflow').disabled = !workflow.ok;
  button('copy-workflow').disabled = !workflow.ok;
  html('readme-preview').textContent = readmeDocument(document, input('repository').value);
}

export function disableSetup(message: string): void {
  button('download-workflow').disabled = true;
  button('copy-workflow').disabled = true;
  html('workflow-preview').textContent = `Correct the settings before exporting: ${message}`;
}

export function setupExports(
  current: () => DemoSettings,
  restore: (document: SettingsV1) => void,
): void {
  const workflow = (): string | undefined => {
    const settings = current();
    const result = workflowDocument(settings.document, settings.renderer);
    if (!result.ok) {
      status(result.message, true);
      return undefined;
    }
    return result.content;
  };
  click('download-workflow', () => {
    const content = workflow();
    if (content) {
      downloadText(content, 'maeul.yml', 'text/yaml');
      status('Downloaded maeul.yml. Save it in .github/workflows/ and run it from Actions.');
    }
  });
  click('copy-workflow', async () => {
    const content = workflow();
    if (content) status(await copyOrDownload(content, 'maeul.yml', 'text/yaml'));
  });
  click('download-readme', () =>
    downloadText(
      readmeDocument(current().document, input('repository').value),
      'maeul-readme.html',
      'text/html',
    ),
  );
  click('copy-readme', async () =>
    status(
      await copyOrDownload(
        readmeDocument(current().document, input('repository').value),
        'maeul-readme.html',
        'text/html',
      ),
    ),
  );
  click('download-settings', () =>
    downloadText(serializeSettings(current().document), 'maeul-settings.json'),
  );
  click('share-settings', async () => {
    const url = new URL(window.location.href);
    url.search = demoQuery(current());
    url.hash = '';
    status(
      `${await copyOrDownload(url.href, 'maeul-settings-link.txt', 'text/plain')} This link contains settings only; download a snapshot to share contribution data.`,
    );
  });
  input('repository').addEventListener('input', () =>
    safeAction(() => updateSetup(current().document, current().renderer)),
  );
  input('settings-input').addEventListener('change', (event) =>
    safeAction(async () => {
      if (!(event.target instanceof HTMLInputElement)) return;
      const file = event.target.files?.[0];
      if (!file) return;
      const document = parseSettings(await readImportFile(file));
      restore(document);
      event.target.value = '';
      status('Imported settings. Contribution data and its source have not changed.');
    }),
  );
}
