import { WorldModelError } from './errors.js';

export function assertJsonBudget(input: unknown): void {
  const active = new WeakSet<object>();
  let values = 0;
  let bytes = 0;
  function visit(value: unknown, depth: number): void {
    values += 1;
    if (values > 500_000 || depth > 16 || bytes > 8 * 1024 * 1024)
      throw new WorldModelError('INVALID_WORLD', 'Scene exceeds JSON size or nesting limits');
    if (value === null || typeof value === 'boolean') {
      bytes += 5;
      return;
    }
    if (typeof value === 'string') {
      bytes += new TextEncoder().encode(value).length + 2;
      return;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      bytes += 24;
      return;
    }
    if (
      typeof value !== 'object' ||
      active.has(value) ||
      (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value))
    )
      throw new WorldModelError('INVALID_WORLD', 'Expected finite, acyclic JSON data');
    active.add(value);
    const entries = Object.entries(value);
    if (entries.length > 20_000)
      throw new WorldModelError('INVALID_WORLD', 'Scene container exceeds entry limits');
    for (const [key, nested] of entries) {
      bytes += key.length + 4;
      visit(nested, depth + 1);
    }
    active.delete(value);
  }
  visit(input, 0);
  if (bytes > 8 * 1024 * 1024)
    throw new WorldModelError('INVALID_WORLD', 'Scene exceeds JSON byte limit');
}
