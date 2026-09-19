import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { button, html, input, select } from '../../../src/world/app/dom.js';
import { parseWorldDocument } from '../../../src/world/data/index.js';
import { captureDownloads, upload } from '../../demo/browser/harness.js';
import { chooseLayout, layoutChoices, mountLayoutPage, openLayoutApp } from './layout-harness.js';

let app: Awaited<ReturnType<typeof openLayoutApp>> | undefined;
let stopDownloads: (() => void) | undefined;
beforeEach(mountLayoutPage);
afterEach(async () => {
  await app?.dispose();
  app = undefined;
  stopDownloads?.();
  stopDownloads = undefined;
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

test.each(layoutChoices)(
  'restores %s and the selected leap day from the local library',
  async (layout) => {
    // Given a stored landform and a selected leap day.
    const database = crypto.randomUUID();
    app = await openLayoutApp(undefined, database);
    await chooseLayout(app, layout);
    app.session.update({ selectedId: 'day:2024-02-29', cursorDate: '2024-02-29' });
    const saved = app.session.current();
    button('save-world').click();
    await expect.poll(() => html('world-status').textContent).toContain('보관했습니다');
    await app.dispose();
    mountLayoutPage();
    const running = await openLayoutApp(undefined, database);
    app = running;
    document.querySelector<HTMLButtonElement>('[data-dialog="library-dialog"]')?.click();
    await expect.poll(() => html('library-list').textContent).toContain('세계 열기');
    // When the saved world is opened after restarting the app.
    [...html('library-list').querySelectorAll('button')]
      .find((node) => node.textContent === '세계 열기')
      ?.click();
    await expect.poll(() => html('world-status').textContent).toContain('보관된 세계를 열었습니다');
    // Then its frozen scene, layout control and selected date are restored.
    expect(running.session.current().scene).toEqual(saved.scene);
    expect(select('world-layout').value).toBe(layout);
    expect(input('world-date').value).toBe('2024-02-29');
    expect(html('day-details').textContent).toContain('0번의 기여');
  },
);

test.each(layoutChoices)(
  'imports an exported %s world with unchanged records and selection',
  async (layout) => {
    // Given a world exported through the real download action.
    const running = await openLayoutApp();
    app = running;
    await chooseLayout(running, layout);
    running.session.update({ selectedId: 'day:2024-02-28', cursorDate: '2024-02-28' });
    const before = running.session.current();
    const captured = captureDownloads();
    stopDownloads = captured.stop;
    button('export-world').click();
    await expect.poll(() => captured.downloads.length).toBe(1);
    const serialized = await captured.downloads[0]?.blob.text();
    const saved = parseWorldDocument(serialized);
    await chooseLayout(running, layout === 'archipelago' ? 'island' : 'archipelago');
    // When the exported JSON is imported through the file input.
    upload('world-file', serialized);
    await expect.poll(() => html('world-status').textContent).toContain('세계를 가져왔습니다');
    // Then every record and the selected dated view survive the round trip.
    expect(saved.scene.settings.layout).toBe(layout);
    expect(running.session.current().scene).toEqual(before.scene);
    expect(select('world-layout').value).toBe(layout);
    expect(input('world-date').value).toBe('2024-02-28');
    expect(html('day-details').textContent).toContain('5번의 기여');
    expect(html('stat-contributions').textContent).toBe('5');
  },
);
