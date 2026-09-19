import type { WorldScene, WorldView } from '../model/types.js';
import type {
  MountWorldRenderer,
  WorldRenderer,
  WorldRendererCallbacks,
} from '../model/renderer-types.js';

export type RendererMode = 'map' | 'three';
export type RendererLoaders = Readonly<Record<RendererMode, MountWorldRenderer>>;
export type RendererEvents = WorldRendererCallbacks & {
  readonly onModeChange: (mode: RendererMode) => void;
  readonly onLoadingChange: (loading: boolean) => void;
};
export type RendererHost = {
  readonly show: (
    scene: WorldScene,
    view: WorldView,
    mode: RendererMode,
    readLatestView?: () => WorldView | undefined,
  ) => Promise<boolean>;
  readonly current: () => WorldRenderer | undefined;
  readonly dispose: () => void;
};

export function createRendererHost(
  host: HTMLElement,
  loaders: RendererLoaders,
  events: RendererEvents,
): RendererHost {
  let revision = 0;
  let active: WorldRenderer | undefined;
  let activeSlot: HTMLElement | undefined;
  const pending = new Set<HTMLElement>();

  async function show(
    scene: WorldScene,
    view: WorldView,
    requested: RendererMode,
    readLatestView?: () => WorldView | undefined,
  ): Promise<boolean> {
    const ticket = ++revision;
    events.onLoadingChange(true);
    const slot = document.createElement('div');
    slot.className = 'renderer-host';
    slot.style.visibility = 'hidden';
    host.append(slot);
    pending.add(slot);
    let candidate: WorldRenderer | undefined;
    const callbacks: WorldRendererCallbacks = {
      onSelect: (id) => {
        if (candidate && candidate === active) events.onSelect(id);
      },
      onViewChange: (next) => {
        if (candidate && candidate === active) events.onViewChange(next);
      },
      onError: (error) => {
        if (ticket !== revision) return;
        events.onError(error);
        if (candidate === active && candidate?.kind === 'three') {
          void show(scene, candidate.getView(), 'map').catch((failure: unknown) => {
            if (failure instanceof Error) events.onError(failure);
            else throw failure;
          });
        }
      },
    };
    try {
      try {
        candidate = await loaders[requested](slot, scene, view, callbacks);
      } catch (error) {
        if (ticket !== revision) return false;
        if (!(error instanceof Error) || requested !== 'three') throw error;
        events.onError(error);
        slot.replaceChildren();
        candidate = await loaders.map(slot, scene, view, callbacks);
      }
      if (ticket !== revision) {
        candidate.dispose();
        return false;
      }
      const latest = readLatestView?.();
      if (latest) {
        try {
          candidate.update(latest);
        } catch (error) {
          candidate.dispose();
          throw error;
        }
      }
      active?.dispose();
      activeSlot?.remove();
      active = candidate;
      activeSlot = slot;
      slot.style.visibility = '';
      events.onModeChange(candidate.kind);
      return true;
    } finally {
      pending.delete(slot);
      if (slot !== activeSlot) slot.remove();
      if (ticket === revision) events.onLoadingChange(false);
    }
  }

  return {
    show,
    current: () => active,
    dispose: () => {
      revision++;
      active?.dispose();
      active = undefined;
      activeSlot?.remove();
      activeSlot = undefined;
      for (const slot of pending) slot.remove();
      pending.clear();
    },
  };
}
