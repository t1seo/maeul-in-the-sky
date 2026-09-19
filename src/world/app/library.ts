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
      new Option('모든 해', 'all'),
      ...years.map((year) => new Option(`${year}년`, String(year))),
    );
    select('library-year').value = years.some((year) => String(year) === chosen) ? chosen : 'all';
    const year = select('library-year').value;
    const target = html('library-list');
    target.replaceChildren();
    for (const entry of saved.filter((item) => year === 'all' || String(item.year) === year)) {
      const node = card(
        `${entry.year} · @${entry.username}`,
        `${entry.savedAt.slice(0, 10)} 보관 · 기록과 시점이 함께 저장되어 있습니다.`,
      );
      const actions = text('div', '', 'card-actions');
      actions.append(
        cardButton('세계 열기', async () => {
          const epoch = session.epoch();
          const document = await loads.run(() => library.load(entry.key));
          if (!document || signal.aborted || session.epoch() !== epoch) return;
          await open(document);
          dialog('library-dialog').close();
          status(`${entry.year}년의 보관된 세계를 열었습니다.`);
        }),
        cardButton('보관본 삭제', async () => {
          await library.delete(entry.key);
          await refresh();
          status('이 보관본을 삭제했습니다. 지금 열린 풍경은 유지됩니다.');
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
        `${sourcePeriod(document)} 관측 · 가져온 파일, 아직 보관하지 않았습니다.`,
      );
      node.append(
        cardButton('불러온 세계 열기', async () => {
          loads.cancel();
          await open(document);
          dialog('library-dialog').close();
          status('가져온 기록을 열었습니다. 내 세계 보관으로 브라우저에 남길 수 있습니다.');
        }),
      );
      target.append(node);
    }
    if (!target.childElementCount)
      empty(
        target,
        '아직 보관한 세계가 없습니다. 지금의 풍경을 보관하거나 이전 기록 파일을 가져와 보세요.',
      );
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
      status(`${document.scene.year}년 세계와 지금의 시점을 보관했습니다.`);
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
