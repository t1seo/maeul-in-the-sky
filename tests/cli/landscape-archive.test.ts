import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { renderArchiveComparison } from '../../src/archive/comparison.js';
import { createArchive } from '../../src/core/archive/comparison.js';
import { parseSnapshot } from '../../src/core/settings/parse.js';
import { terrainTheme } from '../../src/themes/terrain/index.js';
import { annualSnapshot } from '../core/settings/archive-fixtures.js';
import { harness } from './fixtures.js';

describe('landscape archive cards', () => {
  it('preserves both established calendar-only comparison SVG hashes', () => {
    // Given
    const archive = createArchive([annualSnapshot(2024), annualSnapshot(2025)]);
    // When
    const output = renderArchiveComparison(archive, terrainTheme, 'shared-p90');
    // Then
    const digest = (svg: string) => createHash('sha256').update(svg).digest('hex');
    expect(digest(output.dark)).toBe(
      '1130a5212ce5dc9d5a8880416a8941ff1df45058387167993325f923c37805d5',
    );
    expect(digest(output.light)).toBe(
      'b5bb4e6481de01b69abb0ee9182b9c9af74dbd366ac8caf725567b958294a5e6',
    );
  });

  it('fits different card sizes and forwards each saved geography mode', () => {
    // Given
    const test = harness();
    const archive = createArchive([
      annualSnapshot(2024),
      parseSnapshot({
        ...annualSnapshot(2025),
        settings: { terrainMode: 'landscape', landscapeLayout: 'valley' },
      }),
    ]);
    const theme = { name: 'fixture', displayName: 'Fixture', description: '', render: test.render };
    // When
    const output = renderArchiveComparison(archive, theme, 'shared-p90');
    // Then
    expect(test.render.mock.calls[0]?.[1]).toMatchObject({ width: 420, height: 360 });
    expect(test.render.mock.calls[1]?.[1]).toMatchObject({
      width: 840,
      height: 840,
      terrainMode: 'landscape',
      landscapeLayout: 'valley',
    });
    expect(output.light).toContain('viewBox="0 0 840 1324"');
    expect(output.light).toContain('x="210" y="94"');
    expect(output.light).toContain('x="0" y="484"');
    expect(output.light).not.toContain('Equal contribution counts use equal terrain heights.');
  });
});
