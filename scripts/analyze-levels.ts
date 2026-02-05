import { fetchContributions } from '../src/api/client.js';
import { computeLevel100 } from '../src/themes/shared.js';

async function main() {
  const data = await fetchContributions('t1seo', undefined, process.env.GITHUB_TOKEN);
  const nonZeroCounts: number[] = [];
  let maxCount = 0;
  for (const w of data.weeks) {
    for (const d of w.days) {
      if (d.count > maxCount) maxCount = d.count;
      if (d.count > 0) nonZeroCounts.push(d.count);
    }
  }
  nonZeroCounts.sort((a, b) => a - b);
  const p90Index = Math.floor(nonZeroCounts.length * 0.9);
  const effectiveMax = nonZeroCounts[Math.min(p90Index, nonZeroCounts.length - 1)];

  console.log(`maxCount: ${maxCount}, effectiveMax (p90): ${effectiveMax}`);
  console.log(`nonzero days: ${nonZeroCounts.length} / ${data.weeks.length * 7}`);

  const buckets: Record<string, number> = {
    '0 (water)': 0, '1-30 (sand/grass)': 0, '31-60 (forest)': 0,
    '61-78 (farm)': 0, '79-90 (village)': 0, '91-99 (city)': 0,
  };
  for (const w of data.weeks) {
    for (const d of w.days) {
      const l = computeLevel100(d.count, effectiveMax);
      if (l === 0) buckets['0 (water)']++;
      else if (l <= 30) buckets['1-30 (sand/grass)']++;
      else if (l <= 60) buckets['31-60 (forest)']++;
      else if (l <= 78) buckets['61-78 (farm)']++;
      else if (l <= 90) buckets['79-90 (village)']++;
      else buckets['91-99 (city)']++;
    }
  }
  console.log('\nLevel distribution (sqrt + p90):');
  for (const [k, v] of Object.entries(buckets)) console.log(`  ${k}: ${v} days`);

  console.log('\nSample mappings (count → level):');
  for (const c of [1, 2, 3, 5, 8, 10, 15, 20, effectiveMax, maxCount]) {
    console.log(`  ${c} commits → level ${computeLevel100(c, effectiveMax)}`);
  }
}

main();
