import type { TourRenderer } from '../render/renderer.js';

function bindHold(
  button: HTMLButtonElement,
  press: () => void,
  release: () => void,
  signal: AbortSignal,
): () => void {
  let held = false;
  const start = (): void => {
    held = true;
    button.setAttribute('aria-pressed', 'true');
    press();
  };
  const stop = (): void => {
    if (!held) return;
    held = false;
    button.setAttribute('aria-pressed', 'false');
    release();
  };
  button.addEventListener(
    'pointerdown',
    (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      start();
    },
    { signal },
  );
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture', 'blur'])
    button.addEventListener(name, stop, { signal });
  button.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      event.preventDefault();
      if (!event.repeat) start();
    },
    { signal },
  );
  button.addEventListener(
    'keyup',
    (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        stop();
      }
    },
    { signal },
  );
  signal.addEventListener('abort', stop, { once: true });
  return stop;
}

export function bindWalkingPad(renderer: TourRenderer, signal: AbortSignal) {
  const releases: (() => void)[] = [];
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-move]')) {
    const direction = button.dataset.move;
    releases.push(
      bindHold(
        button,
        () =>
          renderer.navigation.move({
            forward: direction === 'forward' ? 1 : direction === 'back' ? -1 : 0,
            right: direction === 'right' ? 1 : direction === 'left' ? -1 : 0,
          }),
        () => renderer.navigation.move({ forward: 0, right: 0 }),
        signal,
      ),
    );
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-turn]')) {
    releases.push(
      bindHold(
        button,
        () => renderer.navigation.turn(button.dataset.turn === 'left' ? -1 : 1),
        () => renderer.navigation.turn(0),
        signal,
      ),
    );
  }
  const reset = (): void => releases.forEach((release) => release());
  window.addEventListener('blur', reset, { signal });
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) reset();
    },
    { signal },
  );
  return { reset };
}
