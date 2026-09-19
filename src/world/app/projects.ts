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
      status('You can add up to 12 project neighborhoods.', true);
      return;
    }
    html('project-status').textContent = `Loading public releases for ${repository.fullName}.`;
    const complete = await districtGate.run((signal) =>
      client.getRepository(repository.fullName, { signal }),
    );
    if (signal.aborted || session.epoch() !== epoch) return;
    await session.rebuild({}, [...before.repositoryData, complete]);
    renderSelected();
    renderResults();
    html('project-status').textContent =
      `Added the ${complete.fullName} neighborhood. Public releases: ${complete.releases.length}${complete.coverage.complete ? '' : ' · partial data'}.`;
  }

  function renderResults(): void {
    const target = html('project-results');
    const selected = new Set(session.current().repositoryData.map((item) => item.id));
    target.replaceChildren(
      ...results.map((repository) => {
        const node = card(
          repository.fullName,
          repository.description ?? 'This public repository has no description.',
        );
        const actions = text('div', '', 'card-actions');
        const choose = cardButton(
          selected.has(repository.id) ? 'Already added' : 'Add to my world',
          () => add(repository),
        );
        choose.disabled = selected.has(repository.id);
        actions.append(choose, link('View on GitHub', repository.url));
        node.append(
          text(
            'small',
            `${repository.primaryLanguage ?? 'Language not listed'} · Public data retrieved ${repository.retrievedAt.slice(0, 10)}`,
          ),
          actions,
        );
        return node;
      }),
    );
    if (!results.length)
      empty(target, 'No public repositories found. Check the username or repository URL.');
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
          `${releases.length} public release${releases.length === 1 ? '' : 's'} published by the replay date.`,
        );
        const place = current.scene.entities.find(
          (entity) => entity.repoId === repository.id && entity.kind === 'repository',
        );
        const actions = text('div', '', 'card-actions');
        if (place) {
          const go = cardButton('Visit neighborhood', () => {
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
                'This repository was created after this world’s date range. Its neighborhood appears in a later year.',
              ),
            );
        }
        actions.append(
          cardButton('Remove neighborhood', async () => {
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
          node.append(text('small', 'Partial public data. View the full history on GitHub.'));
        return node;
      }),
    );
    if (!current.repositoryData.length)
      empty(target, 'No project neighborhoods yet. Find a public repository to add.');
  }

  async function search(append = false): Promise<void> {
    const query = input('project-query').value.trim();
    html('project-status').textContent = 'Searching public GitHub repositories.';
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
        `Found ${results.length} public ${results.length === 1 ? 'repository' : 'repositories'}.${response.coverage.complete ? '' : ' This is a partial list. Load the next page or view it on GitHub.'}`;
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
