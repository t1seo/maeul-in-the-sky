import { afterEach, expect, test } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { setupVisits } from '../../../src/world/app/visits.js';
import { createWorldSession } from '../../../src/world/app/session.js';
import { createWorldDocument, createWorldLocalRecords } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { mountMap } from '../../../src/world/map/index.js';
import { button, dialog, html, input } from '../../../src/world/app/dom.js';

afterEach(() => document.body.replaceChildren());

test('a published HTTPS explorer creates a selectable public-source link without pretending to upload local data', async () => {
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  for (const script of parsed.querySelectorAll('script')) script.remove();
  document.body.replaceChildren(...parsed.body.childNodes);
  html('world-host').style.cssText = 'width:800px;height:500px';
  const current = createWorldDocument({
    scene: TINY_WORLD_SCENE,
    sourceSnapshot: TINY_WORLD_INPUT.snapshot,
  });
  const session = createWorldSession(current, { map: mountMap, three: mountMap });
  const records = createWorldLocalRecords({ databaseName: `app-share-${crypto.randomUUID()}` });
  const lifetime = new AbortController();
  const visits = setupVisits(
    session,
    records,
    lifetime.signal,
    'https://maeul.github.io/project/world/',
  );
  try {
    await session.open(current);
    dialog('visits-dialog').showModal();
    input('visit-url').value = 'https://friend.github.io/world.json';
    button('share-world').click();
    expect(html('share-link-field').hidden).toBe(false);
    const link = new URL(input('share-link').value);
    expect(link.origin + link.pathname).toBe('https://maeul.github.io/project/world/');
    expect(link.searchParams.get('world')).toBe('https://friend.github.io/world.json');
    expect(html('world-status').textContent).toContain('주소를 복사해');
    expect(input('share-link').readOnly).toBe(true);
    expect(document.activeElement).toBe(input('share-link'));
    expect(input('share-link').selectionEnd).toBe(input('share-link').value.length);
    expect(session.current().sourceSnapshot).toEqual(current.sourceSnapshot);
  } finally {
    lifetime.abort();
    visits.dispose();
    session.dispose();
    await records.close();
  }
});
