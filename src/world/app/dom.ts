import { WorldDataError } from '../data/errors.js';
import { WorldAppError } from './errors.js';

export function element<T extends HTMLElement>(id: string, kind: { new (): T }): T {
  const found = document.getElementById(id);
  if (!(found instanceof kind))
    throw new WorldAppError('element', `Could not find page element: ${id}`);
  return found;
}

export const html = (id: string) => element(id, HTMLElement);
export const input = (id: string) => element(id, HTMLInputElement);
export const select = (id: string) => element(id, HTMLSelectElement);
export const button = (id: string) => element(id, HTMLButtonElement);
export const dialog = (id: string) => element(id, HTMLDialogElement);
const currentDialog = () => document.querySelector<HTMLDialogElement>('dialog[open]');

export function text<K extends keyof HTMLElementTagNameMap>(tag: K, value: string, className = '') {
  const node = document.createElement(tag);
  node.textContent = value;
  node.className = className;
  return node;
}

export function status(message: string, error = false, target = currentDialog()): void {
  html('world-status').textContent = message;
  html('world-status').dataset.error = String(error);
  if (error && target?.open && target.isConnected) {
    target.querySelector('[data-dialog-status]')?.remove();
    const notice = text('p', message, 'dialog-status');
    notice.dataset.dialogStatus = '';
    notice.setAttribute('role', 'alert');
    target.prepend(notice);
    target.scrollTop = 0;
  }
}

export function describeError(error: Error): string {
  if (!(error instanceof WorldDataError)) return error.message;
  switch (error.code) {
    case 'invalid_input':
      return 'The file or public data format is invalid. Your current world is unchanged.';
    case 'unsupported_version':
      return 'This world file version is unsupported. Your current world is unchanged.';
    case 'too_large':
      return 'World files must be 8 MiB or smaller; snapshots and archives must be 2 MiB or smaller.';
    case 'invalid_url':
      return 'Enter a public JSON URL hosted on GitHub Pages or raw GitHub.';
    case 'unpublished':
      return 'Publish your world JSON file first, then create a link from the public explorer page.';
    case 'network':
      return 'Check your network connection. Your current world is unchanged.';
    case 'timeout':
      return 'Loading timed out. Please try again shortly.';
    case 'rate_limit':
      return `GitHub’s public request limit has been reached.${error.retryAt ? ` Try again after ${error.retryAt}.` : ' Try again shortly.'}`;
    case 'not_found':
      return 'The public world or repository could not be found. Check the address.';
    case 'private_repository':
      return 'Only public repositories can be added as neighborhoods.';
    case 'storage':
      return 'Browser storage is unavailable. Download your world file to keep a copy.';
    case 'quota':
      return 'Browser storage is full. Download your world file or remove older saved worlds.';
    case 'replace_required':
      return 'This world is already saved. Download or delete the earlier file in Saved worlds.';
    case 'library_full':
      return 'Your library is full. Remove older items, then save again.';
    case 'cancelled':
      return 'Loading cancelled.';
    case 'stale':
      return 'Switched to a newer request.';
    default:
      return error.code satisfies never;
  }
}

export function reportError(error: unknown, target = currentDialog()): void {
  if (!(error instanceof Error)) throw error;
  if (error instanceof WorldDataError && (error.code === 'stale' || error.code === 'cancelled'))
    return;
  status(describeError(error), true, target);
}

export function action(task: () => void | Promise<void>): void {
  currentDialog()?.querySelector('[data-dialog-status]')?.remove();
  try {
    const result = task();
    const target = currentDialog();
    if (result instanceof Promise)
      void result.catch((error: unknown) => reportError(error, target));
  } catch (error) {
    reportError(error);
  }
}

export function click(id: string, task: () => void | Promise<void>, signal: AbortSignal): void {
  button(id).addEventListener('click', () => action(task), { signal });
}

export function empty(target: HTMLElement, message: string): void {
  target.replaceChildren(text('p', message, 'collection-empty'));
}

export function card(title: string, description: string): HTMLElement {
  const node = text('article', '', 'collection-card');
  node.append(text('h3', title), text('p', description));
  return node;
}

export function cardButton(label: string, task: () => void | Promise<void>): HTMLButtonElement {
  const node = text('button', label);
  node.type = 'button';
  node.addEventListener('click', () => action(task));
  return node;
}

export function setupDialogs(
  signal: AbortSignal,
  onOpen: (id: string) => void | Promise<void>,
): void {
  for (const opener of document.querySelectorAll<HTMLButtonElement>('[data-dialog]')) {
    opener.addEventListener(
      'click',
      () =>
        action(async () => {
          const id = opener.dataset.dialog;
          if (!id) return;
          const modal = dialog(id);
          modal.querySelector('[data-dialog-status]')?.remove();
          modal.addEventListener('close', () => opener.focus(), { once: true, signal });
          modal.showModal();
          await onOpen(id);
        }),
      { signal },
    );
  }
  for (const closer of document.querySelectorAll<HTMLButtonElement>('[data-close]')) {
    closer.addEventListener('click', () => closer.closest('dialog')?.close(), { signal });
  }
}
