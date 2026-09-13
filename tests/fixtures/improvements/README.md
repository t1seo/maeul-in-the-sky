# Improvement fixtures

All valid JSON snapshots use the T01 version-1 contract, username `benchmark`, source `sample`, fixed UTC dates and no trusted precomputed statistics. Reproduce with `npx tsx scripts/benchmark/write-fixtures.ts`.

| File | Fixed meaning |
| --- | --- |
| `empty-2025.json`, `mixed-2025.json`, `full-2025.json` | Existing 52-week research fixtures, 2024-12-29 through 2025-12-27; totals 0/803/7280; mixed Mulberry32 seed 42. Empty means 364 known zero-count dates. |
| `no-days-2025.json` | No supplied dates; distinct from known zero-count dates. |
| `partial-2025.json` | 2025-01-01 through 2025-01-11; first cell week 0/day 3, Jan 5 week 1/day 0. |
| `partial-weekday-0.json` … `partial-weekday-6.json` | Eleven supplied dates starting on each UTC weekday; no invented prefix days. |
| `leap-2000.json` | Calendar year 2000: 366 days, February 29, 54 Sunday-based weeks and one supplied date in each edge week. |
| `gaps-2025.json` | January 8 absent; January 12–18 missing with explicit empty week; January 9 is known zero. |
| `sparse-2025.json` | Calendar year 2025; one contribution every 61st day. |
| `full-2024.json`, `year-2025.json` | Full calendar years, count 20 every date; 366 and 365 days. |
| `wonders-2025.json` | Long active history with mostly count 80, interspersed count 12, for Wonder/foreground placement scenarios. Specific placement/occlusion assertions belong to the renderer scenario. |
| `fixed-max-2025.json` | Research mixed fixture with explicit maxCount 20. |
| `malicious-title.json` | Safe text-rendering/import fixture containing markup-like text, quotes, ampersand and a literal Actions expression. Workflow exporter should reject the expression independently. |
| `two-year-archive.json` | Same-username 2024/2025 calendar-year snapshots, comparison maxCount 20. |
| `malformed.json` | Valid JSON with unknown schemaVersion 999 and missing required fields; import must reject. |

Programmatic callers use `benchmarkFixtures()`, `improvementFixtures()` and `fixtureSnapshot(data, settings?)` from `scripts/qa/fixtures.ts`. Every call returns fresh data. `fixtureSnapshot` copies dates/counts/levels and settings; statistics are recomputed by the actual portable importer. Dates and data do not depend on today's date.
