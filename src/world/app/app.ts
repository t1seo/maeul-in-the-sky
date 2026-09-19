import {
  createLatestRequestGate,
  createWorldLibrary,
  createWorldLocalRecords,
  importWorldData,
  readWorldFile,
} from '../data/index.js';
import type { ImportedWorlds, WorldDocumentV1 } from '../data/index.js';
import { sampleSnapshot } from '../../demo/sample.js';
import { action, click, dialog, html, input, reportError, setupDialogs, status } from './dom.js';
import { createWorldSession } from './session.js';
import { paintWorld } from './presentation.js';
import { setupControls } from './controls.js';
import { setupLibrary } from './library.js';
import { setupVisits } from './visits.js';
import { setupProjects } from './projects.js';
import { setupDiscoveries } from './discoveries.js';
import { setupExports } from './exports.js';
import { WorldAppError } from './errors.js';
import type { RendererLoaders } from './renderer.js';
import { prepareIncoming } from './incoming.js';
import { setupVersionSelection } from './versions.js';

export type WorldAppOptions = {
  readonly initialData?: unknown;
  readonly databaseName?: string;
  readonly loaders: RendererLoaders;
  readonly search?: string;
};

export async function startWorldApp(options: WorldAppOptions) {
  const lifetime = new AbortController();
  const { signal } = lifetime;
  const library = createWorldLibrary({ databaseName: options.databaseName });
  const records = createWorldLocalRecords({ databaseName: options.databaseName });
  const imports = createLatestRequestGate();
  let warning: Error | undefined;
  let transferred = false;
  let incoming: ImportedWorlds;
  try {
    const transfer =
      options.initialData === undefined
        ? window.sessionStorage.getItem('maeul-world-transfer')
        : undefined;
    transferred = transfer !== null && transfer !== undefined;
    incoming = prepareIncoming(
      importWorldData(options.initialData ?? transfer ?? sampleSnapshot()),
    );
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    warning = error;
    incoming = prepareIncoming(importWorldData(sampleSnapshot()));
  }
  const first = incoming.documents[0];
  if (!first)
    throw new WorldAppError('empty', '열 수 있는 기록이 없습니다. 다른 세계 파일을 가져와 주세요.');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const initial = reduce ? { ...first, view: { ...first.view, motion: 'off' as const } } : first;
  const session = createWorldSession(initial, options.loaders);
  const visits = setupVisits(session, records, signal);
  const openOwn = async (document: WorldDocumentV1): Promise<void> => {
    imports.cancel();
    await visits.openOwn(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? { ...document, view: { ...document.view, motion: 'off' } }
        : document,
    );
  };
  const collection = setupLibrary(session, library, openOwn, signal);
  collection.remember(incoming.documents);
  const projects = setupProjects(session, signal);
  const discoveries = setupDiscoveries(session, records, signal);
  const stopControls = setupControls(session, signal);
  setupExports(session, signal);
  setupVersionSelection(() => session.current().sourceSnapshot, signal);
  const unsubscribe = session.subscribe((change) => {
    paintWorld(session, change === 'scene');
    if (change === 'scene') imports.cancel();
  });
  setupDialogs(signal, async (id) => {
    switch (id) {
      case 'library-dialog':
        await collection.refresh();
        break;
      case 'discovery-dialog':
        await discoveries.refresh();
        break;
      case 'projects-dialog':
        projects.refresh();
        break;
      case 'visits-dialog':
        await visits.refresh();
        break;
      case 'photo-dialog':
      case 'atmosphere-dialog':
        paintWorld(session);
        break;
      default:
        throw new WorldAppError('element', '이 창을 열 수 없습니다.');
    }
  });
  const chooseFile = (): void => {
    dialog('library-dialog').close();
    input('world-file').click();
  };
  click('open-import', chooseFile, signal);
  click('library-import', chooseFile, signal);
  input('world-file').addEventListener(
    'change',
    () =>
      action(async () => {
        const file = input('world-file').files?.[0];
        if (!file) return;
        try {
          const loaded = prepareIncoming(await imports.run(() => readWorldFile(file)));
          if (signal.aborted) return;
          const next = loaded.documents[0];
          if (!next) throw new WorldAppError('empty', '파일 안에 열 수 있는 세계가 없습니다.');
          await openOwn(next);
          collection.remember(loaded.documents);
          status(
            `${loaded.documents.length}개의 세계를 가져왔습니다.${loaded.documents.length > 1 ? ' 보관한 세계에서 연도를 골라 오갈 수 있습니다.' : ' 현재 기록의 출처와 날짜를 확인해 보세요.'}`,
          );
        } finally {
          if (!signal.aborted) input('world-file').value = '';
        }
      }),
    { signal },
  );

  await session.open(initial, 'map');
  html('world-host').dataset.ready = 'true';
  if (transferred && !warning) window.sessionStorage.removeItem('maeul-world-transfer');
  status(
    transferred && !warning
      ? '기존 데모에서 보고 계시던 기록을 그대로 펼쳤습니다.'
      : initial.sourceSnapshot.source.kind === 'sample'
        ? '샘플 세계를 둘러보고 있습니다. 내 기록 파일을 가져와 나만의 풍경을 만나 보세요.'
        : '기록과 저장된 시점을 펼쳤습니다.',
  );
  if (warning) reportError(warning);
  const remote = new URLSearchParams(options.search ?? window.location.search).get('world');
  if (remote) action(() => visits.openRemote(remote));
  const dispose = async (): Promise<void> => {
    lifetime.abort();
    imports.cancel();
    stopControls();
    unsubscribe();
    projects.dispose();
    visits.dispose();
    session.dispose();
    await Promise.all([library.close(), records.close()]);
  };
  window.addEventListener(
    'pagehide',
    (event) => {
      if (!event.persisted) action(dispose);
    },
    { signal },
  );
  return { session, dispose };
}
