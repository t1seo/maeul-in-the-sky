import { WorldDataError } from '../data/errors.js';
import { WorldAppError } from './errors.js';

export function element<T extends HTMLElement>(id: string, kind: { new (): T }): T {
  const found = document.getElementById(id);
  if (!(found instanceof kind))
    throw new WorldAppError('element', `화면 요소를 찾을 수 없습니다: ${id}`);
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
      return '파일 또는 공개 데이터의 형식이 올바르지 않습니다. 지금 세계는 유지됩니다.';
    case 'unsupported_version':
      return '지원하지 않는 세계 파일 버전입니다. 지금 세계는 유지됩니다.';
    case 'too_large':
      return '세계 파일은 8 MiB, 스냅샷·archive는 2 MiB 이내로 가져와 주세요.';
    case 'invalid_url':
      return 'GitHub Pages 또는 raw GitHub의 공개 JSON 주소를 입력해 주세요.';
    case 'unpublished':
      return '세계 JSON 파일을 먼저 공개하고, 공개된 탐험 페이지에서 링크를 만들어 주세요.';
    case 'network':
      return '네트워크 연결을 확인해 주세요. 불러오지 못한 동안에도 지금 세계는 유지됩니다.';
    case 'timeout':
      return '불러오는 시간이 길어져 중단했습니다. 잠시 후 다시 시도해 주세요.';
    case 'rate_limit':
      return `GitHub 공개 요청 한도에 도달했습니다.${error.retryAt ? ` ${error.retryAt} 이후 다시 시도해 주세요.` : ' 잠시 후 다시 시도해 주세요.'}`;
    case 'not_found':
      return '공개 세계 또는 저장소를 찾지 못했습니다. 주소를 확인해 주세요.';
    case 'private_repository':
      return '공개 저장소만 동네로 불러올 수 있습니다.';
    case 'storage':
      return '브라우저 보관함을 사용할 수 없습니다. 세계 파일을 내려받아 간직해 주세요.';
    case 'quota':
      return '브라우저 저장 공간이 부족합니다. 세계 파일을 내려받거나 이전 보관본을 정리해 주세요.';
    case 'replace_required':
      return '같은 세계가 이미 보관되어 있습니다. 보관함에서 이전 파일을 내려받거나 삭제하실 수 있습니다.';
    case 'library_full':
      return '보관함이 가득 찼습니다. 이전 항목을 정리한 뒤 다시 보관해 주세요.';
    case 'cancelled':
      return '불러오기를 취소했습니다.';
    case 'stale':
      return '새로운 요청으로 이동했습니다.';
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
