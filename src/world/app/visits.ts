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
        `You are exploring @${visit.document.scene.username}’s world.`;
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
          cardButton('Visit island', () => openRemote(bookmark.url)),
          cardButton('Remove bookmark', async () => {
            await records.removeBookmark(bookmark.id);
            await refresh();
            status('Removed the bookmark. Your friend’s public world is unchanged.');
          }),
        );
        node.append(actions);
        return node;
      }),
    );
    if (!bookmarks.length)
      empty(
        target,
        'Bookmark an island to visit again. Explore a public world, then save it here.',
      );
  }

  async function showImported(incoming: ImportedWorlds): Promise<void> {
    const first = incoming.documents[0];
    if (!first) throw new TypeError('This public file contains no worlds to open.');
    const next = beginVisit(visit?.home ?? session.current(), first, incoming.publicSourceUrl);
    if (!(await session.open(first))) return;
    visit = next;
    showVisit();
    dialog('visits-dialog').close();
    status(
      `You have arrived in @${first.scene.username}’s public world. Your own world is preserved.`,
    );
  }

  async function openRemote(url: string): Promise<void> {
    status('Loading the public world.');
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
      status('Welcome back to your world. Your records and view have been restored.');
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
          title: `${visit.document.scene.username}’s ${visit.document.scene.year} world`,
        },
        { replace: true },
      );
      await refresh();
      status('Bookmarked your friend’s world for another visit.');
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
      status('Your share link is ready. Copy the selected address to share it.');
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
