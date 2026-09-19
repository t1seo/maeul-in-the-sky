import {
  beginVisit,
  createLatestRequestGate,
  createWorldShareUrl,
  loadRemoteWorld,
  returnFromVisit,
} from '../data/index.js';
import type {
  ImportedWorlds,
  WorldDocumentV1,
  WorldLocalRecords,
  WorldVisit,
} from '../data/index.js';
import type { WorldSession } from './session.js';
import { prepareIncoming } from './incoming.js';
import {
  action,
  button,
  card,
  cardButton,
  click,
  dialog,
  element,
  empty,
  html,
  input,
  status,
  text,
} from './dom.js';

export function setupVisits(
  session: WorldSession,
  records: WorldLocalRecords,
  signal: AbortSignal,
  pageUrl = window.location.href,
) {
  let visit: WorldVisit | undefined;
  const gate = createLatestRequestGate();
  let refreshId = 0;
  const showVisit = (): void => {
    html('visit-banner').hidden = visit === undefined;
    button('bookmark-visit').disabled = visit?.publicSourceUrl === undefined;
    if (visit)
      html('visit-label').textContent =
        `@${visit.document.scene.username}님의 세계를 둘러보고 있습니다.`;
  };

  async function refresh(): Promise<void> {
    showVisit();
    const ticket = ++refreshId;
    const bookmarks = await records.listBookmarks();
    if (signal.aborted || ticket !== refreshId) return;
    const target = html('bookmark-list');
    target.replaceChildren(
      ...bookmarks.map((bookmark) => {
        const node = card(bookmark.title, bookmark.url);
        const actions = text('div', '', 'card-actions');
        actions.append(
          cardButton('섬 방문하기', () => openRemote(bookmark.url)),
          cardButton('방문지 지우기', async () => {
            await records.removeBookmark(bookmark.id);
            await refresh();
            status('기억한 방문지를 지웠습니다. 친구의 공개 세계는 변경되지 않습니다.');
          }),
        );
        node.append(actions);
        return node;
      }),
    );
    if (!bookmarks.length)
      empty(target, '다시 찾아갈 섬을 기억해 두세요. 공개 세계를 방문한 뒤 저장하실 수 있습니다.');
  }

  async function showImported(incoming: ImportedWorlds): Promise<void> {
    const first = incoming.documents[0];
    if (!first) throw new TypeError('공개 파일에 열 수 있는 세계가 없습니다.');
    const next = beginVisit(visit?.home ?? session.current(), first, incoming.publicSourceUrl);
    if (!(await session.open(first))) return;
    visit = next;
    showVisit();
    dialog('visits-dialog').close();
    status(
      `@${first.scene.username}님의 공개 세계에 도착했습니다. 내 세계는 그대로 보관되어 있습니다.`,
    );
  }

  async function openRemote(url: string): Promise<void> {
    status('공개 세계를 불러오고 있습니다.');
    const incoming = await gate.run((signal) => loadRemoteWorld(url, { pageUrl, signal }));
    if (!signal.aborted) await showImported(prepareIncoming(incoming));
  }

  async function openOwn(document: WorldDocumentV1): Promise<void> {
    gate.cancel();
    if (!(await session.open(document))) return;
    visit = undefined;
    showVisit();
  }

  element('visit-form', HTMLFormElement).addEventListener(
    'submit',
    (event) => {
      event.preventDefault();
      action(() => openRemote(input('visit-url').value.trim()));
    },
    { signal },
  );
  click(
    'return-own',
    async () => {
      if (!visit) return;
      await openOwn(returnFromVisit(visit));
      status('내 세계로 돌아왔습니다. 떠나기 전의 기록과 시점을 복원했습니다.');
    },
    signal,
  );
  click(
    'bookmark-visit',
    async () => {
      if (!visit?.publicSourceUrl) return;
      await records.addBookmark(
        {
          url: visit.publicSourceUrl,
          title: `${visit.document.scene.username}님의 ${visit.document.scene.year}년 세계`,
        },
        { replace: true },
      );
      await refresh();
      status('다시 찾아올 수 있도록 친구의 세계를 기억했습니다.');
    },
    signal,
  );
  click(
    'share-world',
    async () => {
      const share = createWorldShareUrl(
        new URL('./', pageUrl).href,
        input('visit-url').value.trim(),
      );
      input('share-link').value = share;
      html('share-link-field').hidden = false;
      input('share-link').focus();
      input('share-link').select();
      status('공유 링크를 만들었습니다. 선택된 주소를 복사해 나누실 수 있습니다.');
    },
    signal,
  );
  const unsubscribe = session.subscribe((change) => {
    if (change === 'scene') gate.cancel();
  });
  showVisit();
  return {
    refresh,
    openRemote,
    openOwn,
    dispose: () => {
      gate.cancel();
      unsubscribe();
    },
  };
}
