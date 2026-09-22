export function element(id: string): HTMLElement {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing tour element: ${id}`);
  return node;
}

export function canvasElement(id: string): HTMLCanvasElement {
  const node = element(id);
  if (!(node instanceof HTMLCanvasElement)) throw new Error(`Expected canvas: ${id}`);
  return node;
}

export function buttonElement(id: string): HTMLButtonElement {
  const node = element(id);
  if (!(node instanceof HTMLButtonElement)) throw new Error(`Expected button: ${id}`);
  return node;
}

export function announce(message: string): void {
  element('announcement').textContent = message;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}
