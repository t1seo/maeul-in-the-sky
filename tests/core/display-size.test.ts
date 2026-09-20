import { describe, expect, it } from 'vitest';
import { resolveDisplaySize } from '../../src/core/display-size.js';
import type { ResolvedRenderSettings } from '../../src/core/render-options.js';

describe('output dimensions', () => {
  const cases: readonly [Pick<ResolvedRenderSettings, 'layout' | 'terrainMode'>, number, number][] =
    [
      [{ layout: 'banner' }, 840, 240],
      [{ layout: 'card' }, 420, 360],
      [{ layout: 'banner', terrainMode: 'calendar' }, 840, 240],
      [{ layout: 'card', terrainMode: 'calendar' }, 420, 360],
      [{ layout: 'banner', terrainMode: 'landscape' }, 1200, 840],
      [{ layout: 'card', terrainMode: 'landscape' }, 840, 840],
    ];
  it.each(cases)('resolves %j to %s × %s for every output adapter', (settings, width, height) => {
    // Given
    const input = settings;
    // When
    const dimensions = resolveDisplaySize(input);
    // Then
    expect(dimensions).toEqual({ width, height });
  });
});
