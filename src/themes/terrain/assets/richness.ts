import type { IsoCell } from '../blocks.js';

export function computeRichness(cell: IsoCell, cellMap: Map<string, IsoCell>): number {
  let neighborSum = 0;
  let count = 0;
  for (let dw = -1; dw <= 1; dw++) {
    for (let dd = -1; dd <= 1; dd++) {
      if (dw === 0 && dd === 0) continue;
      const key = `${cell.week + dw},${cell.day + dd}`;
      const n = cellMap.get(key);
      if (n) {
        neighborSum += n.level100;
        count++;
      }
    }
  }
  if (count === 0) return 0;
  return neighborSum / (count * 99);
}
