import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { startWorldApp } from '../../../src/world/app/app.js';
import { createWorldDocument } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import type { PublicRepoRecord } from '../../../src/world/model/types.js';
import { mountMap } from '../../../src/world/map/index.js';
import { button, html, input } from '../../../src/world/app/dom.js';

let app: Awaited<ReturnType<typeof startWorldApp>> | undefined;
beforeEach(() => {
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  for (const script of parsed.querySelectorAll('script')) script.remove();
  document.body.replaceChildren(...parsed.body.childNodes);
  html('world-host').style.cssText = 'width:800px;height:500px';
});
afterEach(async () => {
  await app?.dispose();
  app = undefined;
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

async function open() {
  app = await startWorldApp({
    databaseName: `app-project-edge-${crypto.randomUUID()}`,
    initialData: createWorldDocument({
      scene: TINY_WORLD_SCENE,
      sourceSnapshot: TINY_WORLD_INPUT.snapshot,
    }),
    loaders: { map: mountMap, three: mountMap },
    search: '',
  });
  document.querySelector<HTMLButtonElement>('[data-dialog="projects-dialog"]')?.click();
  return app;
}
function repository() {
  return {
    id: 13,
    full_name: 'octocat/garden',
    html_url: 'https://github.com/octocat/garden',
    private: false,
    description: '<b>A garden</b>',
    language: null,
    created_at: '2024-02-29T00:00:00Z',
  };
}
function search(query: string): void {
  input('project-query').value = query;
  html('project-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}
function choose(id: string, name: string): void {
  [...html(id).querySelectorAll('button')].find((node) => node.textContent === name)?.click();
}

test('shows partial public release coverage and seeks forward to a district within the current year', async () => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (request) => {
    const url = new URL(request instanceof Request ? request.url : String(request));
    if (url.pathname.endsWith('/releases'))
      return Response.json(
        [
          {
            id: 15,
            tag_name: 'spring',
            name: null,
            html_url: 'https://github.com/octocat/garden/releases/tag/spring',
            published_at: '2024-02-29T01:00:00Z',
            draft: false,
          },
        ],
        { headers: { link: '<https://api.github.com/next>; rel="next"' } },
      );
    return Response.json(url.pathname.startsWith('/users/') ? [repository()] : repository());
  });
  const running = await open();
  running.session.update({ cursorDate: '2024-02-28' });
  search('octocat');
  await expect.poll(() => html('project-results').textContent).toContain('<b>A garden</b>');
  expect(html('project-results').querySelector('b')).toBeNull();
  expect(html('project-results').textContent).toContain('Language not listed');
  choose('project-results', 'Add to my world');
  await expect.poll(() => running.session.current().repositoryData.length).toBe(1);
  expect(html('project-selected').textContent).toContain('Partial public data');
  expect(html('project-status').textContent).toContain('partial data');
  expect(html('project-selected').textContent).not.toContain('spring');
  choose('project-selected', 'Visit neighborhood');
  expect(running.session.current().view.cursorDate).toBe('2024-02-29');
  document.querySelector<HTMLButtonElement>('[data-dialog="projects-dialog"]')?.click();
  expect(html('project-selected').textContent).toContain('spring');
});

test('keeps the twelve chosen districts when a thirteenth public repository is requested', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json([repository()]));
  const running = await open();
  const repositories: PublicRepoRecord[] = Array.from({ length: 12 }, (_, index) => ({
    id: String(index + 1),
    fullName: `octocat/repo-${index + 1}`,
    url: `https://github.com/octocat/repo-${index + 1}`,
    description: null,
    visibility: 'public',
    createdAt: '2024-01-01T00:00:00Z',
    retrievedAt: '2024-03-01T00:00:00Z',
    releases: [],
    coverage: { complete: true },
  }));
  await running.session.rebuild({}, repositories);
  search('octocat');
  await expect.poll(() => html('project-results').textContent).toContain('octocat/garden');
  choose('project-results', 'Add to my world');
  expect(html('world-status').textContent).toContain('up to 12');
  expect(running.session.current().repositoryData).toHaveLength(12);
});

test('ignores a cancelled old search when a newer public search succeeds', async () => {
  let finish: (value: Response) => void = () => {
    throw new Error('Request not started');
  };
  const delayed = new Promise<Response>((resolve) => {
    finish = resolve;
  });
  vi.spyOn(globalThis, 'fetch')
    .mockReturnValueOnce(delayed)
    .mockResolvedValueOnce(Response.json([repository()]));
  await open();
  search('old-user');
  search('octocat');
  await expect.poll(() => html('project-results').textContent).toContain('octocat/garden');
  finish(Response.json([]));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  expect(html('project-results').textContent).toContain('octocat/garden');
  expect(html('project-status').textContent).toContain('1 public repository');
  expect(button('project-more').disabled).toBe(false);
});
