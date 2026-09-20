export function element(id: string): HTMLElement {
  const value = document.getElementById(id);
  if (!(value instanceof HTMLElement)) throw new TypeError(`Missing demo element: ${id}`);
  return value;
}

export function input(id: string): HTMLInputElement {
  const value = element(id);
  if (!(value instanceof HTMLInputElement)) throw new TypeError(`Expected input: ${id}`);
  return value;
}

export function select(id: string): HTMLSelectElement {
  const value = element(id);
  if (!(value instanceof HTMLSelectElement)) throw new TypeError(`Expected select: ${id}`);
  return value;
}
