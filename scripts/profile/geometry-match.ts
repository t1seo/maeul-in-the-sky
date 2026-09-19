export function matchesGeneratedGeometry(actual: unknown, expected: unknown): boolean {
  if (typeof actual === 'number' && typeof expected === 'number')
    return (
      Number.isFinite(actual) &&
      Number.isFinite(expected) &&
      (Object.is(actual, expected) ||
        (!Number.isInteger(actual) &&
          !Number.isInteger(expected) &&
          Math.abs(actual - expected) <= 1e-12))
    );
  if (Object.is(actual, expected)) return true;
  if (Array.isArray(actual)) {
    if (!Array.isArray(expected) || actual.length !== expected.length) return false;
    const values: readonly unknown[] = expected;
    return actual.every((value: unknown, index: number) =>
      matchesGeneratedGeometry(value, values[index]),
    );
  }
  if (
    typeof actual !== 'object' ||
    actual === null ||
    typeof expected !== 'object' ||
    expected === null ||
    Array.isArray(expected)
  )
    return false;
  const fields = new Map<string, unknown>(Object.entries(actual));
  const entries: readonly (readonly [string, unknown])[] = Object.entries(expected);
  return (
    fields.size === entries.length &&
    entries.every(
      ([key, value]) => fields.has(key) && matchesGeneratedGeometry(fields.get(key), value),
    )
  );
}
