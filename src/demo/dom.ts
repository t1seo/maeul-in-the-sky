export class DemoElementError extends Error {
  constructor(selector: string) {
    super(
      `The village interface is missing ${selector}. Reload this page to use the latest version.`,
    );
  }
}

export function element<T extends Element>(selector: string, type: { new (): T }): T {
  const found = document.querySelector(selector);
  if (!(found instanceof type)) throw new DemoElementError(selector);
  return found;
}

export const html = (id: string): HTMLElement => element(`#${id}`, HTMLElement);
export const input = (id: string): HTMLInputElement => element(`#${id}`, HTMLInputElement);
export const select = (id: string): HTMLSelectElement => element(`#${id}`, HTMLSelectElement);
export const button = (id: string): HTMLButtonElement => element(`#${id}`, HTMLButtonElement);
export const dialog = (id: string): HTMLDialogElement => element(`#${id}`, HTMLDialogElement);

export function status(message: string, error = false): void {
  const node = html('app-status');
  node.textContent = message;
  node.dataset.error = String(error);
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
}

export function safeAction(action: () => void | Promise<void>): void {
  Promise.resolve()
    .then(action)
    .catch((error: unknown) => status(errorMessage(error), true));
}

export function click(id: string, action: () => void | Promise<void>): void {
  button(id).addEventListener('click', () => safeAction(action));
}

export function textNode<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text: string,
  className?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}
