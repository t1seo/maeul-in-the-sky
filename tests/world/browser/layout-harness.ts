import { expect } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { startWorldApp } from '../../../src/world/app/app.js';
import { html, select } from '../../../src/world/app/dom.js';
import { createWorldDocument } from '../../../src/world/data/index.js';
import { buildWorld, defaultWorldView } from '../../../src/world/model/index.js';
import { TINY_WORLD_INPUT } from '../../../src/world/model/fixture.js';
import type { WorldInput } from '../../../src/world/model/types.js';
import { mountMap } from '../../../src/world/map/index.js';

export const layoutChoices = [
  ['archipelago', 'Monthly islands'],
  ['island', 'One large island'],
  ['seasonal', 'Seasonal islands'],
] as const;

export function mountLayoutPage(): void {
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  for (const script of parsed.querySelectorAll('script')) script.remove();
  document.body.replaceChildren(...parsed.body.childNodes);
  html('world-host').style.cssText = 'width:800px;height:500px';
  sessionStorage.clear();
}

export async function openLayoutApp(input?: WorldInput, databaseName = crypto.randomUUID()) {
  const scene = buildWorld(input ?? TINY_WORLD_INPUT);
  return startWorldApp({
    databaseName: `app-layout-${databaseName}`,
    initialData: createWorldDocument({
      scene,
      sourceSnapshot: input?.snapshot ?? TINY_WORLD_INPUT.snapshot,
      view: { ...defaultWorldView(scene), motion: 'off' },
    }),
    loaders: { map: mountMap, three: mountMap },
    search: '',
  });
}

export function changeLayoutControl(id: string, value: string): void {
  select(id).value = value;
  select(id).dispatchEvent(new Event('change'));
}

export async function chooseLayout(
  app: Awaited<ReturnType<typeof openLayoutApp>>,
  layout: string,
): Promise<void> {
  changeLayoutControl('world-layout', layout);
  await expect.poll(() => app.session.current().scene.settings.layout).toBe(layout);
}
