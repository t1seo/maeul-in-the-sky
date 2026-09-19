import { describe, expect, it } from 'vitest';
import { createWorldDocument } from '../../src/world/data/document.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../src/world/model/fixture.js';
import { profilePostcardCopy } from '../../src/world/app/postcard-copy.js';

describe('honest profile postcard captions', () => {
  it('labels sample evidence and counts a supplied zero as observed', () => {
    const document = createWorldDocument({
      scene: TINY_WORLD_SCENE,
      sourceSnapshot: TINY_WORLD_INPUT.snapshot,
    });
    const copy = profilePostcardCopy(document);
    expect(copy.stats).toBe('5 contributions · 1 active / 2 observed days');
    expect(copy.source).toContain('Sample records · 2024-02-28 — 2024-02-29');
    expect(copy.legend.map((entry) => entry.label)).toEqual([
      'Spring',
      'Summer',
      'Autumn',
      'Winter',
    ]);
    expect(copy.legendNote).toBe('Seasonal scenery');
  });

  it('never includes future contributions when exporting an earlier replay date', () => {
    const document = createWorldDocument({
      scene: TINY_WORLD_SCENE,
      sourceSnapshot: TINY_WORLD_INPUT.snapshot,
      view: {
        cursorDate: '2024-02-28',
        seasonOverride: 'calendar',
        lighting: 'day',
        weather: 'clear',
        motion: 'off',
        quality: 'high',
        focus: { kind: 'world' },
        elapsedSeconds: 0,
        camera: { position: { x: 10, y: 10, z: 10 }, target: { x: 0, y: 0, z: 0 }, zoom: 1 },
      },
    });
    expect(profilePostcardCopy(document).stats).toBe('5 contributions · 1 active / 1 observed day');
  });
});
