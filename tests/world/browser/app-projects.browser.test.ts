import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { startWorldApp } from '../../../src/world/app/app.js';
import { createWorldDocument } from '../../../src/world/data/index.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { mountMap } from '../../../src/world/map/index.js';
import { button, dialog, html, input } from '../../../src/world/app/dom.js';

let app: Awaited<ReturnType<typeof startWorldApp>> | undefined;
beforeEach(() => {
  const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
  for (const script of parsed.querySelectorAll('script')) script.remove();
  document.body.replaceChildren(...parsed.body.childNodes);
  html('world-host').style.cssText = 'width:800px;height:500px';
  sessionStorage.clear();
});
afterEach(async () => {
  await app?.dispose();
  app = undefined;
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

async function open() {
  app = await startWorldApp({
    databaseName: `app-projects-${crypto.randomUUID()}`,
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
function repository(id = 1, created = '2024-02-28T00:00:00Z') {
  return {
    id,
    full_name: `octocat/garden${id}`,
    html_url: `https://github.com/octocat/garden${id}`,
    private: false,
    visibility: 'public',
    description: null,
    language: 'TypeScript',
    created_at: created,
    stargazers_count: 7,
  };
}
function release() {
  return {
    id: 40,
    tag_name: 'v1.0',
    name: 'First bloom',
    html_url: 'https://github.com/octocat/garden1/releases/tag/v1.0',
    published_at: '2024-02-28T12:00:00Z',
    draft: false,
  };
}
function search(query: string): void {
  input('project-query').value = query;
  html('project-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}
function action(id: string, label: string): HTMLButtonElement {
  const target = [...html(id).querySelectorAll('button')].find(
    (node) => node.textContent === label,
  );
  if (!target) throw new Error(`Missing action ${label}`);
  return target;
}

test('fetches public metadata and releases into an actual district, with pagination and removal', async () => {
  const calls: string[] = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (request) => {
    const url = new URL(request instanceof Request ? request.url : String(request));
    calls.push(url.pathname + url.search);
    if (url.pathname.endsWith('/releases')) return Response.json([release()]);
    if (url.pathname.includes('/repos/octocat/')) return Response.json(repository());
    return Response.json([repository(url.searchParams.get('page') === '2' ? 2 : 1)], {
      headers:
        url.searchParams.get('page') === '1'
          ? { link: '<https://api.github.com/users/octocat/repos?page=2>; rel="next"' }
          : {},
    });
  });
  const running = await open();
  search('octocat');
  await expect.poll(() => html('project-results').textContent).toContain('octocat/garden1');
  expect(button('project-more').hidden).toBe(false);
  button('project-more').click();
  await expect.poll(() => html('project-results').querySelectorAll('article').length).toBe(2);
  expect(button('project-more').hidden).toBe(true);
  action('project-results', '내 세계에 더하기').click();
  await expect.poll(() => running.session.current().repositoryData.length).toBe(1);
  expect(running.session.current().repositoryData[0]?.releases[0]?.tag).toBe('v1.0');
  expect(
    running.session
      .current()
      .scene.entities.some((entity) => entity.kind === 'release' && entity.releaseId === '40'),
  ).toBe(true);
  expect(html('project-selected').textContent).toContain('v1.0');
  expect(action('project-results', '동네에 포함됨').disabled).toBe(true);
  action('project-selected', '동네로 가기').click();
  expect(dialog('projects-dialog').open).toBe(false);
  expect(running.session.current().view.focus).toEqual({ kind: 'entity', entityId: 'repo:1' });
  document.querySelector<HTMLButtonElement>('[data-dialog="projects-dialog"]')?.click();
  action('project-selected', '동네에서 빼기').click();
  await expect.poll(() => running.session.current().repositoryData.length).toBe(0);
  expect(calls.some((url) => url.includes('/releases'))).toBe(true);
});

test('does not navigate outside an older world for a repository created in a later year', async () => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (request) => {
    const url = new URL(request instanceof Request ? request.url : String(request));
    return Response.json(
      url.pathname.endsWith('/releases') ? [] : repository(2, '2025-01-01T00:00:00Z'),
    );
  });
  const running = await open();
  search('octocat/garden2');
  await expect.poll(() => html('project-results').textContent).toContain('octocat/garden2');
  action('project-results', '내 세계에 더하기').click();
  await expect.poll(() => running.session.current().repositoryData.length).toBe(1);
  expect(action('project-selected', '동네로 가기').disabled).toBe(true);
  expect(html('project-selected').textContent).toContain('이 세계의 기간 이후');
  button('save-world').click();
  await expect.poll(() => html('world-status').textContent).toContain('보관했습니다');
});

test('reports empty results, invalid names and public rate limits without changing the world', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(Response.json([]));
  const running = await open();
  running.session.update({ motion: 'off' });
  const before = running.session.current();
  search('nobody');
  await expect
    .poll(() => html('project-results').textContent)
    .toContain('찾은 공개 저장소가 없습니다');
  search('wrong name');
  await expect.poll(() => html('project-status').textContent).toContain('형식이 올바르지 않습니다');
  fetch.mockResolvedValueOnce(new Response('', { status: 429, headers: { 'retry-after': '60' } }));
  search('ratelimited');
  await expect.poll(() => html('project-status').textContent).toContain('요청 한도');
  expect(running.session.current()).toEqual(before);
});
