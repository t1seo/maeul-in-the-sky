import { buildWorld } from '../model/index.js';
import type { PublicRepoRecord, WorldFocus, WorldSettings, WorldView } from '../model/types.js';
import { createWorldDocument, type WorldDocumentV1 } from '../data/index.js';
import { createRendererHost, type RendererLoaders, type RendererMode } from './renderer.js';
import { html } from './dom.js';
import { rebuildView } from './rebuild-view.js';

export type SessionChange = 'scene' | 'view' | 'renderer';
type PendingWorld = {
  readonly document: WorldDocumentV1;
  readonly mode: RendererMode;
  readonly readView: () => WorldView;
  readonly reframe: boolean;
};

export function createWorldSession(initial: WorldDocumentV1, loaders: RendererLoaders) {
  let document = initial;
  let mode: RendererMode = 'map';
  let opening = 0;
  let epoch = 0;
  let pending: PendingWorld | undefined;
  const subscribers = new Set<(change: SessionChange) => void>();
  const notify = (change: SessionChange): void => {
    for (const subscriber of subscribers) subscriber(change);
  };
  const renderer = createRendererHost(html('world-host'), loaders, {
    onSelect: (id) => selectPlace(id),
    onViewChange: (view) => {
      document = { ...document, view };
      notify('view');
    },
    onError: () => {
      html('world-fallback').hidden = false;
      html('world-fallback').textContent = 'Could not open the 3D walk. Please use the 2D map.';
    },
    onModeChange: (next) => {
      mode = next;
      if (!opening) notify('renderer');
    },
    onLoadingChange: (loading) => {
      html('world-host').setAttribute('aria-busy', String(loading));
      html('world-loading').hidden = !loading;
    },
  });

  function current(): WorldDocumentV1 {
    return { ...document, view: renderer.current()?.getView() ?? document.view };
  }

  function update(patch: Partial<WorldView>): void {
    const view = { ...current().view, ...patch };
    document = { ...document, view };
    renderer.current()?.update(view);
    notify('view');
  }

  function focus(target: WorldFocus): void {
    update({ focus: target, followActorId: target.kind === 'actor' ? target.actorId : undefined });
    renderer.current()?.focus(target);
    document = current();
    notify('view');
  }

  function selectPlace(id: string): void {
    const day = document.scene.days.find(
      (item) => item.id === id || item.date === id || item.tileId === id,
    );
    const entity = document.scene.entities.find((item) => item.id === id);
    const date = day?.date ?? entity?.date;
    update({
      selectedId: day?.id ?? id,
      ...(date && date > document.view.cursorDate ? { cursorDate: date } : {}),
    });
  }

  async function present(intent: PendingWorld): Promise<boolean> {
    pending = intent;
    epoch++;
    opening++;
    html('world-fallback').hidden = true;
    try {
      const next = intent.document;
      const readView = (): WorldView =>
        intent.reframe ? rebuildView(next.scene, intent.readView()) : intent.readView();
      if (!(await renderer.show(next.scene, readView(), intent.mode, readView))) return false;
      document = { ...next, view: renderer.current()?.getView() ?? next.view };
      notify('scene');
      return true;
    } finally {
      opening--;
      if (pending === intent) pending = undefined;
    }
  }

  function open(next: WorldDocumentV1, requested = mode): Promise<boolean> {
    return present({ document: next, mode: requested, readView: () => next.view, reframe: false });
  }

  function intended(): PendingWorld {
    return pending ?? { document: current(), mode, readView: () => current().view, reframe: false };
  }

  return {
    current,
    update,
    focus,
    open,
    selectPlace,
    renderer,
    mode: () => mode,
    epoch: () => epoch,
    subscribe(listener: (change: SessionChange) => void): () => void {
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },
    async switchRenderer(requested: RendererMode): Promise<void> {
      await present({ ...intended(), mode: requested });
    },
    async rebuild(
      settings: Partial<WorldSettings>,
      repositories?: readonly PublicRepoRecord[],
    ): Promise<void> {
      const intent = intended();
      const before = intent.document;
      const repositoryData = repositories ?? before.repositoryData;
      const scene = buildWorld({
        snapshot: before.sourceSnapshot,
        settings: { ...before.scene.settings, ...settings },
        range: before.scene.range,
        repositories: repositoryData,
      });
      await present({
        document: createWorldDocument({
          scene,
          sourceSnapshot: before.sourceSnapshot,
          repositoryData,
          view: rebuildView(scene, intent.readView()),
        }),
        mode: intent.mode,
        readView: intent.readView,
        reframe: true,
      });
    },
    reset(): void {
      renderer.current()?.reset();
      document = current();
      notify('view');
    },
    dispose(): void {
      pending = undefined;
      renderer.dispose();
      subscribers.clear();
    },
  };
}

export type WorldSession = ReturnType<typeof createWorldSession>;
