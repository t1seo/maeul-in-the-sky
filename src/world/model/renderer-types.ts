import type { WorldFocus, WorldScene, WorldView } from './types.js';

export type WorldRendererCapabilities = {
  readonly png: boolean;
  readonly svg: boolean;
  readonly glb: boolean;
  readonly follow: boolean;
};

export type WorldCaptureOptions = {
  readonly format: 'png' | 'svg';
  readonly width: number;
  readonly height: number;
};

export type WorldRendererCallbacks = {
  readonly onSelect: (id: string) => void;
  readonly onViewChange: (view: WorldView) => void;
  readonly onError: (error: Error) => void;
};

export type WorldRenderer = {
  readonly kind: 'map' | 'three';
  readonly capabilities: WorldRendererCapabilities;
  readonly update: (view: WorldView) => void;
  readonly focus: (target: WorldFocus) => void;
  readonly reset: () => void;
  readonly getView: () => WorldView;
  readonly capture: (options: WorldCaptureOptions) => Promise<Blob>;
  readonly exportModel?: () => Promise<Blob>;
  readonly dispose: () => void;
};

export type MountWorldRenderer = (
  host: HTMLElement,
  scene: WorldScene,
  view: WorldView,
  callbacks: WorldRendererCallbacks,
) => WorldRenderer | Promise<WorldRenderer>;
