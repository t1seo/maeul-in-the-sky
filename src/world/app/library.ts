import { createLatestRequestGate, createWorldDocument, worldRevisionKey } from '../data/index.js';
import type { WorldDocumentV1, WorldLibrary } from '../data/index.js';
import type { WorldSession } from './session.js';
import { sourcePeriod } from './incoming.js';
import {
  action,
  card,
  cardButton,
  click,
  dialog,
  empty,
  html,
  select,
  status,
  text,
} from './dom.js';

export function setupLibrary(
  session: WorldSession,
  library: WorldLibrary,
  open: (document: WorldDocumentV1) => Promise<void>,
  signal: AbortSignal,
) {
  const imported = new Map<string, WorldDocumentV1>();
  const loads = createLatestRequestGate();
  signal.addEventListener('abort', () => loads.cancel(), { once: true });
  let refreshId = 0;

  async function refresh(): Promise<void> {
    const ticket = ++refreshId;
    const saved = await library.list();
    if (ticket !== refreshId || signal.aborted) return;
    const savedKeys = new Set(saved.map((item) => item.key));
    const unsaved = [...imported.entries()].filter(([key]) => !savedKeys.has(key));
    const years = [
      ...new Set([
        ...saved.map((item) => item.year),
        ...unsaved.map(([, item]) => item.scene.year),
      ]),
    ].sort((a, b) => b - a);
    const chosen = select('library-year').value;
    select('library-year').replaceChildren(
      new Option('All years', 'all'),
      ...years.map((year) => new Option(String(year), String(year))),
    );
    select('library-year').value = years.some((year) => String(year) === chosen) ? chosen : 'all';
    const year = select('library-year').value;
    const target = html('library-list');
    target.replaceChildren();
    for (const entry of saved.filter((item) => year === 'all' || String(item.year) === year)) {
      const node = card(
        `${entry.year} · @${entry.username}`,
        `Saved ${entry.savedAt.slice(0, 10)} · Includes records and view.`,
      );
      const actions = text('div', '', 'card-actions');
      actions.append(
        cardButton('Open world', async () => {
          const epoch = session.epoch();
          const document = await loads.run(() => library.load(entry.key));
          if (!document || signal.aborted || session.epoch() !== epoch) return;
          await open(document);
          dialog('library-dialog').close();
          status(`Opened the saved world for ${entry.year}.`);
        }),
        cardButton('Delete saved world', async () => {
          await library.delete(entry.key);
          await refresh();
          status('Deleted the saved world. Your current landscape is unchanged.');
        }),
      );
      node.append(actions);
      target.append(node);
    }
    for (const [, document] of unsaved.filter(
      ([, item]) => year === 'all' || String(item.scene.year) === year,
    )) {
      const node = card(
        `${document.scene.year} · @${document.scene.username}`,
        `Observed ${sourcePeriod(document)} · Imported file, not yet saved.`,
      );
      node.append(
        cardButton('Open imported world', async () => {
          loads.cancel();
          await open(document);
          dialog('library-dialog').close();
          status('Opened the imported records. Choose Save my world to keep them in this browser.');
        }),
      );
      target.append(node);
    }
    if (!target.childElementCount)
      empty(target, 'No saved worlds yet. Save this landscape or import an earlier file.');
  }

  click(
    'save-world',
    async () => {
      const before = session.current();
      const document = createWorldDocument({
        scene: before.scene,
        sourceSnapshot: before.sourceSnapshot,
        repositoryData: before.repositoryData,
        view: before.view,
      });
      await library.save(document, { replace: true });
      status(`Saved the ${document.scene.year} world and current view.`);
      if (dialog('library-dialog').open) await refresh();
    },
    signal,
  );
  select('library-year').addEventListener('change', () => action(refresh), { signal });
  return {
    refresh,
    remember(documents: readonly WorldDocumentV1[]): void {
      for (const document of documents) imported.set(worldRevisionKey(document), document);
    },
  };
}
