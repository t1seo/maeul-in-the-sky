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
import { setupAnalytics } from '../analytics/index.js';

export type WorldAppOptions = {
  readonly initialData?: unknown;
  readonly databaseName?: string;
  readonly loaders: RendererLoaders;
  readonly search?: string;
};

export async function startWorldApp(options: WorldAppOptions) {
  const parameters = new URLSearchParams(options.search ?? window.location.search);
  const remote = parameters.get('world');
  const requestedMode = parameters.get('view') === 'three' ? 'three' : 'map';
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
    throw new WorldAppError('empty', 'No records are available. Please import another world file.');
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
  const analytics = setupAnalytics(session, signal);
  const stopControls = setupControls(session, signal);
  setupExports(session, signal);
  setupVersionSelection(() => session.current().sourceSnapshot, signal);
  const unsubscribe = session.subscribe((change) => {
    paintWorld(session, change === 'scene');
    if (change === 'scene') {
      imports.cancel();
      if (dialog('analytics-dialog').open) analytics.refresh();
    }
  });
  setupDialogs(signal, async (id) => {
    switch (id) {
      case 'analytics-dialog':
        analytics.refresh();
        break;
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
        throw new WorldAppError('element', 'Could not open this dialog.');
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
          if (!next) throw new WorldAppError('empty', 'This file contains no worlds to open.');
          await openOwn(next);
          collection.remember(loaded.documents);
          status(
            `${loaded.documents.length} ${loaded.documents.length === 1 ? 'world imported' : 'worlds imported'}.${loaded.documents.length > 1 ? ' Choose a year in Saved worlds to switch between them.' : ' Check the source and dates of these records.'}`,
          );
        } finally {
          if (!signal.aborted) input('world-file').value = '';
        }
      }),
    { signal },
  );

  await session.open(initial, remote ? 'map' : requestedMode);
  html('world-host').dataset.ready = 'true';
  if (transferred && !warning) window.sessionStorage.removeItem('maeul-world-transfer');
  status(
    transferred && !warning
      ? 'Opened the records you were viewing in the previous demo.'
      : initial.sourceSnapshot.source.kind === 'sample'
        ? 'You are exploring a sample world. Import your records to see your own landscape.'
        : 'Opened your records and saved view.',
  );
  if (warning) reportError(warning);
  if (remote) action(() => visits.openRemote(remote, requestedMode));
  if (parameters.get('panel') === 'activity') html('open-analytics').click();
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
