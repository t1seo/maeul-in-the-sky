export function computeP90Max(counts: readonly number[]): number {
  const positive = counts.filter((count) => count > 0).sort((a, b) => a - b);
  return positive[Math.min(Math.floor(positive.length * 0.9), positive.length - 1)] ?? 1;
}
export function normalizeCount100(count: number, maxCount: number): number {
  if (count === 0) return 0;
  const ratio = Math.max(0, Math.min(count / maxCount, 1));
  return Math.max(1, Math.min(Math.round(Math.sqrt(ratio) * 98) + 1, 99));
}
