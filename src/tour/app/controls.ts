import type { TourRenderer } from '../render/renderer.js';
import type { TourModel } from '../types.js';
import { createTourAsset } from '../assets/index.js';
import { announce, buttonElement, canvasElement, element, formatDate } from './dom.js';
import { drawMinimap } from './presentation.js';

export function bindControls(renderer: TourRenderer, model: TourModel) {
  const lifetime = new AbortController();
  const signal = lifetime.signal;
  const refresh = (): void => {
    const state = renderer.inspect();
    document.body.dataset.mode = state.mode;
    document.body.dataset.light = state.lighting;
    buttonElement('walk-toggle').setAttribute('aria-pressed', String(state.mode === 'walk'));
    element('walk-pad').hidden = state.mode !== 'walk';
    element('play-label').textContent = state.touring ? '투어 멈추기' : '마을 투어';
    buttonElement('tour-play').setAttribute('aria-pressed', String(state.touring));
    element('gesture-hint').textContent =
      state.mode === 'walk'
        ? 'W A S D / 방향키로 걷기 · 드래그로 고개 돌리기 · Esc로 나가기'
        : '드래그해서 둘러보기 · 스크롤로 가까이';
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-light]'))
      button.setAttribute('aria-pressed', String(button.dataset.light === state.lighting));
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-stop]'))
      button.setAttribute('aria-current', String(Number(button.dataset.stop) === state.stopIndex));
    drawMinimap(model, state.stopIndex);
  };
  const click = (id: string, action: () => void): void => {
    buttonElement(id).addEventListener('click', action, { signal });
  };
  click('tour-play', () => {
    if (renderer.inspect().touring) renderer.navigation.stop();
    else renderer.navigation.startTour();
    refresh();
  });
  click('walk-toggle', () => {
    if (renderer.inspect().mode === 'walk') renderer.navigation.stop();
    else if (!renderer.navigation.walk())
      announce('걸을 수 있는 땅이 없는 마을입니다. 드래그나 계절 버튼으로 둘러보세요.');
    else announce('산책을 시작합니다. 방향키로 이동하고 드래그로 둘러보세요.');
    refresh();
  });
  click('overview', () => {
    renderer.navigation.overview();
    refresh();
  });
  click('home-view', () => {
    renderer.navigation.home();
    refresh();
  });
  click('help-toggle', () => {
    const panel = element('help-panel');
    panel.hidden = !panel.hidden;
    buttonElement('help-toggle').setAttribute('aria-expanded', String(!panel.hidden));
  });
  click('detail-close', () => {
    element('detail-panel').hidden = true;
  });
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-light]')) {
    button.addEventListener(
      'click',
      () => {
        const mode = button.dataset.light;
        if (mode === 'day' || mode === 'golden' || mode === 'night') renderer.setLighting(mode);
        refresh();
      },
      { signal },
    );
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-stop]'))
    button.addEventListener(
      'click',
      () => {
        renderer.navigation.goToStop(Number(button.dataset.stop));
        refresh();
      },
      { signal },
    );
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-move]')) {
    button.addEventListener(
      'pointerdown',
      (event) => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        const direction = button.dataset.move;
        renderer.navigation.move({
          forward: direction === 'forward' ? 1 : direction === 'back' ? -1 : 0,
          right: direction === 'right' ? 1 : direction === 'left' ? -1 : 0,
        });
      },
      { signal },
    );
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'])
      button.addEventListener(
        name,
        () => {
          renderer.navigation.move({ forward: 0, right: 0 });
        },
        { signal },
      );
  }
  const canvas = canvasElement('village');
  let down = { x: 0, y: 0 };
  canvas.addEventListener(
    'pointerdown',
    (event) => {
      down = { x: event.clientX, y: event.clientY };
    },
    { signal },
  );
  canvas.addEventListener(
    'pointerup',
    (event) => {
      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) return;
      const cell = renderer.pick(event.clientX, event.clientY);
      if (!cell) return;
      element('detail-date').textContent = formatDate(cell.date);
      element('detail-count').textContent = `${cell.count.toLocaleString('ko-KR')}개의 GitHub 기여`;
      const labels = model.placements
        .filter((placement) => placement.source.anchorDate === cell.date)
        .map(
          (placement) =>
            createTourAsset(placement.source.catalogId, placement.source.variant, placement.season)
              .label,
        );
      element('detail-assets').textContent = labels.length
        ? [...new Set(labels)].join(' · ')
        : '이 날의 작은 자연 풍경';
      element('detail-panel').hidden = false;
    },
    { signal },
  );
  refresh();
  return {
    refresh,
    dispose: (): void => {
      lifetime.abort();
    },
  };
}
