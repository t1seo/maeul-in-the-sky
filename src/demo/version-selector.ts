import { errorMessage, html, select } from './dom.js';
import {
  rendererVersionSchema,
  RENDERER_VERSIONS,
  type RendererVersion,
} from './renderer-version.js';
import { CURRENT_RENDERER, loadClassicRenderer, type DemoRenderer } from './renderers.js';
import type { DemoSettings } from './state.js';

export function setupVersionSelector(
  current: () => DemoSettings,
  apply: (renderer: DemoRenderer, settings: DemoSettings | undefined, push: boolean) => void,
  recover: () => void,
  load = loadClassicRenderer,
  editRevision: () => number = () => 0,
): (version: RendererVersion, settings?: DemoSettings, push?: boolean) => Promise<void> {
  let generation = 0;
  const picker = select('renderer-version');
  const message = html('renderer-status');
  const choose = async (
    version: RendererVersion,
    settings?: DemoSettings,
    push = true,
  ): Promise<void> => {
    const request = ++generation;
    const beforeLoading = editRevision();
    picker.value = version;
    message.dataset.error = 'false';
    message.textContent =
      version === 'classic' ? 'Loading classic artwork… Your current scene stays available.' : '';
    html('renderer-selection').setAttribute('aria-busy', String(version === 'classic'));
    try {
      const renderer = version === 'current' ? CURRENT_RENDERER : await load();
      if (generation !== request) return;
      apply(renderer, editRevision() === beforeLoading ? settings : undefined, push);
      message.textContent = `${RENDERER_VERSIONS[version].label} applied. Your contribution history and settings are preserved.`;
    } catch (error) {
      if (generation !== request) return;
      picker.value = current().renderer;
      message.dataset.error = 'true';
      message.textContent = `Could not apply ${RENDERER_VERSIONS[version].label}: ${errorMessage(error)} Your previous scene is kept. Select the version again to retry.`;
      recover();
    } finally {
      if (generation === request) html('renderer-selection').setAttribute('aria-busy', 'false');
    }
  };
  picker.addEventListener('change', () => {
    void choose(rendererVersionSchema.parse(picker.value));
  });
  return choose;
}
