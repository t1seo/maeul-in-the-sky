import type { Group, Intersection } from 'three';
import type { WorldFrame, WorldScene, WorldView } from '../model/types.js';

export type WorldGeometry = {
  readonly content: Group;
  readonly update: (frame: WorldFrame, view: WorldView) => void;
  readonly identify: (hit: Intersection) => string | undefined;
  readonly dispose: () => void;
};

export type CreateWorldGeometry = (scene: WorldScene) => WorldGeometry;
