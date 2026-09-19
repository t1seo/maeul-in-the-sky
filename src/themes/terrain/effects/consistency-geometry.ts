import type { ConsistencyEffectKind, SceneBounds } from '../../../core/scene-types.js';

export const CONSISTENCY_DRIFT = { x: 1.2, y: 0.8 } as const;
export const CONSISTENCY_STROKE = 0.18;

type ConsistencyGlyph = {
  readonly body: string;
  readonly detail: string;
  readonly bounds: SceneBounds;
};

export const CONSISTENCY_GLYPHS = {
  springPetals: {
    body: 'M-1.4 0Q-1.1-1.1 0-.5Q1.1-1.1 1.4 0Q.8 1.1 0 1.4Q-.8 1.1-1.4 0Z',
    detail: 'M0-.3Q.2.6 0 1.1',
    bounds: { x: -1.4, y: -1.1, width: 2.8, height: 2.5 },
  },
  summerFireflies: {
    body: 'M0-1.5Q1.5-1.5 1.5 0Q1.5 1.5 0 1.5Q-1.5 1.5-1.5 0Q-1.5-1.5 0-1.5Z',
    detail: 'M0-.5L.5 0L0 .5L-.5 0Z',
    bounds: { x: -1.5, y: -1.5, width: 3, height: 3 },
  },
  autumnLeaves: {
    body: 'M-1.7.8Q-1.4-1.2.4-.8L1.7-1.3Q1.5.9-.6 1.2Z',
    detail: 'M-1.4 1L1.2-.8M-.4.4L-.6-.5M.3-.1L1 .3',
    bounds: { x: -1.7, y: -1.3, width: 3.4, height: 2.5 },
  },
  winterFrost: {
    body: 'M0-.6L.6 0L0 .6L-.6 0Z',
    detail:
      'M-1.6 0H1.6M0-1.6V1.6M-1.1-1.1L1.1 1.1M-1.1 1.1L1.1-1.1M-1.3-.4L-.9 0L-1.3.4M1.3-.4L.9 0L1.3.4M-.4-1.3L0-.9L.4-1.3M-.4 1.3L0 .9L.4 1.3',
    bounds: { x: -1.6, y: -1.6, width: 3.2, height: 3.2 },
  },
} as const satisfies Record<ConsistencyEffectKind, ConsistencyGlyph>;
