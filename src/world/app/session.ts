import { buildWorld, defaultWorldView } from '../model/index.js';
import type { PublicRepoRecord, WorldFocus, WorldSettings, WorldView } from '../model/types.js';
import { createWorldDocument, type WorldDocumentV1 } from '../data/index.js';
import { createRendererHost, type RendererLoaders, type RendererMode } from './renderer.js';
import { html } from './dom.js';

export type SessionChange = 'scene' | 'view' | 'renderer';
type PendingWorld = {
  readonly document: WorldDocumentV1;
  readonly mode: RendererMode;
  readonly readView: () => WorldView;
};

export function createWorldSession(initial: WorldDocumentV1, loaders: RendererLoaders) {
  let document = initial;
  let mode: RendererMode = 'map';
  let opening = 0;
  let epoch = 0;
  let pending: PendingWorld | undefined;
  let navigationRevision = 0;
  const subscribers = new Set<(change: SessionChange) => void>();
  const notify = (change: SessionChange): void => {
    for (const subscriber of subscribers) subscriber(change);
  };
  const renderer = createRendererHost(html('world-host'), loaders, {
    onSelect: (id) => selectPlace(id),
    onViewChange: (view) => {
      navigationRevision++;
      document = { ...document, view };
      notify('view');
    },
    onError: () => {
      html('world-fallback').hidden = false;
      html('world-fallback').textContent = '3D 화면을 열지 못했습니다. 2D 지도를 이용해 주세요.';
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
    if ('camera' in patch || 'focus' in patch) navigationRevision++;
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
      if (!(await renderer.show(next.scene, intent.readView(), intent.mode, intent.readView)))
        return false;
      document = { ...next, view: renderer.current()?.getView() ?? next.view };
      notify('scene');
      return true;
    } finally {
      opening--;
      if (pending === intent) pending = undefined;
    }
  }

  function open(next: WorldDocumentV1, requested = mode): Promise<boolean> {
    return present({ document: next, mode: requested, readView: () => next.view });
  }

  function intended(): PendingWorld {
    return pending ?? { document: current(), mode, readView: () => current().view };
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
      const selections = new Set([
        ...scene.days.flatMap((day) => [day.id, day.date]),
        ...scene.entities.map((entity) => entity.id),
        ...scene.actors.map((actor) => actor.id),
        ...scene.regions.map((region) => region.id),
      ]);
      const navigation = navigationRevision;
      const camera = defaultWorldView(scene).camera;
      const readView = (): WorldView => {
        const latest = intent.readView();
        return {
          ...latest,
          selectedId:
            latest.selectedId && selections.has(latest.selectedId) ? latest.selectedId : undefined,
          ...(navigation === navigationRevision
            ? { camera, focus: { kind: 'world' } as const, followActorId: undefined }
            : {}),
        };
      };
      await present({
        document: createWorldDocument({
          scene,
          sourceSnapshot: before.sourceSnapshot,
          repositoryData,
          view: readView(),
        }),
        mode: intent.mode,
        readView,
      });
    },
    reset(): void {
      navigationRevision++;
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
