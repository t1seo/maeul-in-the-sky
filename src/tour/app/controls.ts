import type { TourRenderer } from '../render/renderer.js';
import type { TourModel } from '../types.js';
import { announce, buttonElement, element } from './dom.js';
import { presentPlace } from './presentation.js';
import { bindMap } from './map-controls.js';
import { bindSceneControls } from './scene-controls.js';
import { bindWalkingPad } from './walk-controls.js';

export function bindControls(renderer: TourRenderer, model: TourModel) {
  const lifetime = new AbortController();
  const signal = lifetime.signal;
  const map = bindMap(renderer, model, signal);
  const walking = bindWalkingPad(renderer, signal);
  bindSceneControls(renderer, model, signal);
  const refresh = (): void => {
    const state = renderer.inspect();
    document.body.dataset.mode = state.mode;
    document.body.dataset.light = state.lighting;
    buttonElement('walk-toggle').setAttribute('aria-pressed', String(state.mode === 'walk'));
    element('walk-pad').hidden = state.mode !== 'walk';
    if (state.mode !== 'walk') walking.reset();
    else element('detail-panel').hidden = true;
    element('play-label').textContent = state.touring ? 'Pause tour' : 'Tour';
    buttonElement('tour-play').setAttribute('aria-pressed', String(state.touring));
    element('gesture-hint').textContent =
      state.mode === 'walk'
        ? 'WASD move · Q / E turn · Drag to look · Click to move · Esc exit'
        : 'Drag to explore · Scroll to zoom · Click a day to walk there';
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-light]'))
      button.setAttribute('aria-pressed', String(button.dataset.light === state.lighting));
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-stop]'))
      button.setAttribute('aria-current', String(Number(button.dataset.stop) === state.stopIndex));
    presentPlace(model, state.stopIndex);
    map.refresh();
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
      announce('This village has no walkable ground. Drag to explore or choose a season.');
    else announce('You are walking. Use WASD to move, Q and E to turn, or drag to look around.');
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
    if (!panel.hidden) map.close();
    buttonElement('help-toggle').setAttribute('aria-expanded', String(!panel.hidden));
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
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-stop]')) {
    button.addEventListener(
      'click',
      () => {
        renderer.navigation.goToStop(Number(button.dataset.stop));
        refresh();
      },
      { signal },
    );
  }
  refresh();
  return {
    refresh,
    refreshNavigation: map.refresh,
    dispose: (): void => lifetime.abort(),
  };
}
