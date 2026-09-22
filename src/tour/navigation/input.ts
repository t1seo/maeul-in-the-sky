type Movement = { readonly forward: number; readonly right: number };

export function bindTourInput(
  canvas: HTMLCanvasElement,
  handlers: {
    readonly walking: () => boolean;
    readonly look: (dx: number, dy: number) => void;
    readonly stop: () => void;
    readonly gesture: () => void;
  },
) {
  const lifetime = new AbortController();
  const signal = lifetime.signal;
  const keys = new Set<string>();
  let touch: Movement = { forward: 0, right: 0 };
  let turn = 0;
  let pointer: { readonly id: number; readonly x: number; readonly y: number } | null = null;
  const clear = (): void => {
    keys.clear();
    touch = { forward: 0, right: 0 };
    turn = 0;
    pointer = null;
  };
  const movement = new Set([
    'KeyW',
    'KeyA',
    'KeyS',
    'KeyD',
    'KeyQ',
    'KeyE',
    'ArrowUp',
    'ArrowLeft',
    'ArrowDown',
    'ArrowRight',
  ]);
  window.addEventListener(
    'keydown',
    (event) => {
      if (event.code === 'Escape') {
        clear();
        handlers.stop();
        return;
      }
      if (
        !handlers.walking() ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;
      if (movement.has(event.code)) {
        event.preventDefault();
        keys.add(event.code);
      }
    },
    { signal },
  );
  window.addEventListener(
    'keyup',
    (event) => {
      keys.delete(event.code);
    },
    { signal },
  );
  window.addEventListener(
    'blur',
    () => {
      clear();
      handlers.stop();
    },
    { signal },
  );
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) {
        clear();
        handlers.stop();
      }
    },
    { signal },
  );
  canvas.addEventListener(
    'pointerdown',
    (event) => {
      handlers.gesture();
      if (!handlers.walking()) return;
      canvas.setPointerCapture(event.pointerId);
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    },
    { signal },
  );
  canvas.addEventListener(
    'pointermove',
    (event) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      handlers.look(event.clientX - pointer.x, event.clientY - pointer.y);
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    },
    { signal },
  );
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'])
    canvas.addEventListener(
      name,
      () => {
        pointer = null;
      },
      { signal },
    );
  canvas.addEventListener('wheel', () => handlers.gesture(), { signal, passive: true });
  return {
    movement: (): Movement & { readonly turn: number } => ({
      forward:
        Number(keys.has('KeyW') || keys.has('ArrowUp')) -
        Number(keys.has('KeyS') || keys.has('ArrowDown')) +
        touch.forward,
      right: Number(keys.has('KeyD')) - Number(keys.has('KeyA')) + touch.right,
      turn:
        Number(keys.has('KeyE') || keys.has('ArrowRight')) -
        Number(keys.has('KeyQ') || keys.has('ArrowLeft')) +
        turn,
    }),
    touch: (value: Movement): void => {
      touch = value;
    },
    turn: (value: number): void => {
      turn = Number.isFinite(value) ? Math.max(-1, Math.min(1, value)) : 0;
    },
    clear,
    dispose: (): void => {
      clear();
      lifetime.abort();
    },
  };
}
