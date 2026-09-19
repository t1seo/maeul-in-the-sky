import {
  createLatestRequestGate,
  createPublicGithubClient,
  WorldDataError,
} from '../data/index.js';
import type { PublicRepoRecord } from '../model/types.js';
import type { WorldSession } from './session.js';
import {
  action,
  button,
  card,
  cardButton,
  click,
  describeError,
  element,
  empty,
  html,
  input,
  status,
  text,
} from './dom.js';

export function setupProjects(session: WorldSession, signal: AbortSignal) {
  const client = createPublicGithubClient();
  const searchGate = createLatestRequestGate();
  const districtGate = createLatestRequestGate();
  let nextPage: number | undefined;
  let username = '';
  let results: readonly PublicRepoRecord[] = [];

  function link(label: string, url: string): HTMLAnchorElement {
    const node = text('a', label);
    node.href = url;
    node.target = '_blank';
    node.rel = 'noopener noreferrer';
    return node;
  }

  async function add(repository: PublicRepoRecord): Promise<void> {
    const before = session.current();
    const epoch = session.epoch();
    if (before.repositoryData.some((item) => item.id === repository.id)) return;
    if (before.repositoryData.length >= 12) {
      status('프로젝트 동네는 최대 12개까지 고를 수 있습니다.', true);
      return;
    }
    html('project-status').textContent = `${repository.fullName}의 공개 릴리스를 읽고 있습니다.`;
    const complete = await districtGate.run((signal) =>
      client.getRepository(repository.fullName, { signal }),
    );
    if (signal.aborted || session.epoch() !== epoch) return;
    await session.rebuild({}, [...before.repositoryData, complete]);
    renderSelected();
    renderResults();
    html('project-status').textContent =
      `${complete.fullName} 동네를 더했습니다. 공개 릴리스 ${complete.releases.length}개${complete.coverage.complete ? '' : ' · 일부만 수집됨'}.`;
  }

  function renderResults(): void {
    const target = html('project-results');
    const selected = new Set(session.current().repositoryData.map((item) => item.id));
    target.replaceChildren(
      ...results.map((repository) => {
        const node = card(
          repository.fullName,
          repository.description ?? '설명이 없는 공개 저장소입니다.',
        );
        const actions = text('div', '', 'card-actions');
        const choose = cardButton(
          selected.has(repository.id) ? '동네에 포함됨' : '내 세계에 더하기',
          () => add(repository),
        );
        choose.disabled = selected.has(repository.id);
        actions.append(choose, link('GitHub에서 보기', repository.url));
        node.append(
          text(
            'small',
            `${repository.primaryLanguage ?? '언어 정보 없음'} · ${repository.retrievedAt.slice(0, 10)} 공개 정보`,
          ),
          actions,
        );
        return node;
      }),
    );
    if (!results.length)
      empty(target, '찾은 공개 저장소가 없습니다. 사용자 이름이나 저장소 주소를 확인해 보세요.');
    button('project-more').hidden = nextPage === undefined;
  }

  function renderSelected(): void {
    const current = session.current();
    const target = html('project-selected');
    target.replaceChildren(
      ...current.repositoryData.map((repository) => {
        const releases = repository.releases.filter(
          (release) => release.publishedAt.slice(0, 10) <= current.view.cursorDate,
        );
        const node = card(
          repository.fullName,
          `${releases.length}개의 공개 릴리스가 현재 재생 날짜 이전에 발행되었습니다.`,
        );
        const place = current.scene.entities.find(
          (entity) => entity.repoId === repository.id && entity.kind === 'repository',
        );
        const actions = text('div', '', 'card-actions');
        if (place) {
          const go = cardButton('동네로 가기', () => {
            if (place.visibleFrom > current.view.cursorDate)
              session.update({ cursorDate: place.visibleFrom });
            session.focus({ kind: 'entity', entityId: place.id });
            element('projects-dialog', HTMLDialogElement).close();
          });
          go.disabled = place.visibleFrom > current.scene.range.to;
          actions.append(go);
          if (go.disabled)
            node.append(
              text(
                'p',
                '이 세계의 기간 이후에 만들어진 저장소입니다. 이후 연도에서 동네를 만나실 수 있습니다.',
              ),
            );
        }
        actions.append(
          cardButton('동네에서 빼기', async () => {
            districtGate.cancel();
            await session.rebuild(
              {},
              session.current().repositoryData.filter((item) => item.id !== repository.id),
            );
            renderSelected();
            renderResults();
          }),
        );
        node.append(actions);
        for (const release of releases)
          node.append(
            link(`${release.tag} · ${release.publishedAt.slice(0, 10)}`, release.url),
            text('br', ''),
          );
        if (!repository.coverage.complete)
          node.append(
            text('small', '일부 공개 정보만 수집되었습니다. GitHub에서 전체 기록을 확인해 주세요.'),
          );
        return node;
      }),
    );
    if (!current.repositoryData.length)
      empty(target, '아직 프로젝트 동네가 없습니다. 공개 저장소를 찾아 더해 보세요.');
  }

  async function search(append = false): Promise<void> {
    const query = input('project-query').value.trim();
    html('project-status').textContent = 'GitHub의 공개 저장소를 찾고 있습니다.';
    button('project-more').disabled = true;
    try {
      const response = await searchGate.run(async (signal) => {
        if (query.includes('/'))
          return {
            repositories: [await client.getRepository(query, { signal })],
            page: 1,
            coverage: { complete: true },
          };
        username = query;
        return client.listRepositories(username, { signal, page: append ? nextPage : 1 });
      });
      if (signal.aborted) return;
      results = append ? [...results, ...response.repositories] : response.repositories;
      nextPage = 'nextPage' in response ? response.nextPage : undefined;
      renderResults();
      html('project-status').textContent =
        `${results.length}개의 공개 저장소를 찾았습니다.${response.coverage.complete ? '' : ' 목록이 일부입니다. 다음 페이지 또는 GitHub에서 확인하실 수 있습니다.'}`;
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      if (error instanceof WorldDataError && (error.code === 'stale' || error.code === 'cancelled'))
        return;
      html('project-status').textContent = describeError(error);
    } finally {
      if (!signal.aborted) button('project-more').disabled = false;
    }
  }

  element('project-form', HTMLFormElement).addEventListener(
    'submit',
    (event) => {
      event.preventDefault();
      action(() => search());
    },
    { signal },
  );
  click('project-more', () => search(true), signal);
  const unsubscribe = session.subscribe((change) => {
    if (change === 'scene') districtGate.cancel();
  });
  return {
    refresh: renderSelected,
    dispose(): void {
      searchGate.cancel();
      districtGate.cancel();
      client.clearCache();
      unsubscribe();
    },
  };
}
