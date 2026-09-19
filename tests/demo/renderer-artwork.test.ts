import { expect, it } from 'vitest';
import { renderTerrain as classicRenderTerrain } from '../../assets/versions/classic/browser.js';
import { snapshotToContributionData } from '../../src/core/settings/parse.js';
import { renderOptions, renderSnapshot, staticSnapshotSvg } from '../../src/demo/preview.js';
import { annualCardSvg } from '../../src/demo/archive-view.js';
import { sampleSnapshot } from '../../src/demo/sample.js';
import type { DemoRenderer } from '../../src/demo/renderers.js';

const classic: DemoRenderer = { version: 'classic', renderTerrain: classicRenderTerrain };

it.each(['miniature', 'pixel'] as const)(
  'uses exact archived %s artwork when classic is selected',
  (artStyle) => {
    const sample = sampleSnapshot();
    const snapshot = {
      ...sample,
      settings: { ...sample.settings, artStyle, motion: 'off' as const },
    };
    const before = JSON.stringify(snapshot);

    const old = renderSnapshot(snapshot, snapshot.settings, 'village', classic);
    const current = renderSnapshot(snapshot);
    const expected = classicRenderTerrain(snapshotToContributionData(snapshot), {
      ...renderOptions({ ...snapshot.settings, title: `${snapshot.settings.title} · sample data` }),
      namespace: 'village',
    });

    expect(old).toEqual(expected);
    expect(old.dark).not.toBe(current.dark);
    expect(old.light).not.toBe(current.light);
    expect(old.metadata.cells.map(({ date, count }) => ({ date, count }))).toEqual(
      current.metadata.cells.map(({ date, count }) => ({ date, count })),
    );
    expect(JSON.stringify(snapshot)).toBe(before);
  },
);

it('uses the archived engine with motion off when producing a static PNG source', () => {
  const snapshot = sampleSnapshot();

  const svg = staticSnapshotSvg(snapshot, 'dark', classic);

  expect(svg).toBe(
    renderSnapshot(snapshot, { ...snapshot.settings, motion: 'off' }, 'village', classic).dark,
  );
  expect(svg).not.toMatch(/@keyframes|<animate\b|<animateTransform\b/);
});

it('keeps classic and the common scale when rendering an annual archive card', () => {
  const snapshot = sampleSnapshot();

  const svg = annualCardSvg(snapshot, 'light', 25, classic);

  expect(svg).toBe(
    renderSnapshot(
      snapshot,
      {
        ...snapshot.settings,
        title: `@${snapshot.username} · ${snapshot.year}`,
        layout: 'card',
        motion: 'off',
        normalization: { kind: 'fixed', maxCount: 25 },
      },
      'village',
      classic,
    ).light,
  );
});
