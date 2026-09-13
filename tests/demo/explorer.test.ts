import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseSnapshot } from '../../src/core/settings/parse.js';
import { renderSnapshot, staticSnapshotSvg } from '../../src/demo/preview.js';
import { describeDay } from '../../src/demo/day-details.js';

const snapshot = parseSnapshot(readFileSync('tests/fixtures/improvements/mixed-2025.json', 'utf8'));

describe('C12 truthful browser rendering', () => {
  it('labels sample data inside the exported image when setup has a different account title', () => {
    const output = renderSnapshot(snapshot, { ...snapshot.settings, title: '@unfetched-account' });
    expect(output.light).toContain('@unfetched-account · sample data');
    expect(output.metadata.username).toBe(snapshot.username);
  });

  it('uses catalog names when a day references placed asset identities', () => {
    const { metadata } = renderSnapshot(snapshot);
    const cell = metadata.cells.find((cell) => cell.assetIds.length > 0);
    expect(cell).toBeDefined();
    if (!cell) return;
    const description = describeDay(cell, metadata);
    expect(description).toContain(`${cell.count.toLocaleString()} contribution`);
    expect(description).not.toContain('asset:');
    expect(description).not.toContain('level');
    expect(description).not.toContain('week');
  });

  it('produces complete deterministic static SVG when exporting a moving village to PNG', () => {
    const first = staticSnapshotSvg(snapshot, 'light');
    expect(first).toBe(staticSnapshotSvg(snapshot, 'light'));
    expect(first).not.toMatch(/<animate|@keyframes/);
    expect(first).toContain('terrain-blocks');
  });
});
