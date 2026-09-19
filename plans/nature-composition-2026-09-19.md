# Nature composition, variety and consistency effects

## Goal and scope

Replace visually dominant repeated boats/estates with nature-led seasonal landscapes, keeping high-quality art and honest daily rewards. Deliver eight new nature catalog IDs with three geometric variants each, deterministic diverse placement, bounded consistency effects, regenerated demo/catalog/package, and verified deployment to Pages and the owner's GitHub profile. Keep Node/npm/Vitest/Playwright and the existing self-contained SVG pipeline; add no runtime dependencies.

User authorized research, implementation, Orca workflow, commits, push, main merge, deployment and actual profile application. Latest screenshot specifically highlights repeated white sailboats. No additional approval gate is needed.

## Baseline and Metis findings

- Base: `c55a77b012e087ad0ec1e591e68983dbfcb911df`.
- Reproducible before artifacts: `.orca/nature-composition/before/`, captured before production edits.
- Seeded demo: 1,582 contributions; 268 ordinary primaries, including 26 sailboats.
- Public profile fixture reconstructed from dated reward counts: 2025-09-18 through 2026-09-18, 4,309 contributions, 268 active days. Preserve this exact input for before/after comparison; deployment can contain newer real data.
- Orca Metis inspection confirmed water tier-three and tier-five candidate pools are empty, tier five bypasses the catalog pool, and Korean mapping collapses all grand buildings to one estate. Controlled uniform inputs select 364/364 sailboats at water tier three and 364/364 estates at Korean land tier five.
- Preserve raw tiers and primary date independence. Consistency can depend on prior activity only through a separate decorative layer. Avoid stateful greedy placement that changes with traversal/window order. Metis also caught the existing Wonder ID bambooGrove; the new ordinary ID is bambooThicket. Absolute coordinate color partitions can reduce adjacent repeats without looking at real neighbor counts.

## Contracts

1. Retain raw contribution thresholds 0/1/5/10/25/50 and one primary or Wonder for every active date. Zero activity cannot earn primary rewards or consistency effects. Density, normalized level, color, motion and art style cannot change an ordinary primary identity.
2. Nature must dominate all large uniform active cohorts, including top tiers. Architecture/vessels are rare focal points selected through a date/absolute-coordinate field independent of counts on other dates. Deduplicate culturally mapped candidate IDs before selection. Prefer natural silhouettes and geographic candidates appropriate to land/water and season.
3. Use date-seeded spatial variation to reduce adjacent identical silhouettes without global traversal state. Absolute dates and fixed-size virtual neighborhoods may be used; actual neighboring contribution counts must not affect a primary. Do not promise complete adjacency exclusion where different tiers/pools intersect.
4. Add `cedarGrove`, `ancientOak`, `wildflowerMeadow`, `bambooThicket`, `lotusPond`, `reedMarsh`, `alpineRocks`, `willowPond`; 24 genuinely different geometric variants. These are classic/shared nature, available to both cultures. Tier four/five nature rewards use substantial crowns, layered groves or detailed waterscapes. Each stays within measured catalog bounds, with material-aware seasonal colors and stable SVG paths.
5. New prepared scenes use layout version 3 and seed policy username-date-v3. Previously prepared v1/v2 scenes remain renderable. Changes in regenerated placement, including biome and Wonder seeds, are intentional and documented.
6. Consistency uses supplied positive-contribution dates in the inclusive trailing 28 calendar days ending at each date. Thresholds are 5, 12 and 20 active days, independent of contribution magnitude and normalized height. Missing/unsupplied dates do not count; do not fabricate history. UTC, no clock. Expose actual active-day count/tier and observed-day count in metadata and day details, so unavailable dates are not mistaken for measured zero activity.
7. Up to 10 deterministic seasonal effect groups, only on positive-contribution dates. Spring petals, summer fireflies, autumn leaves and winter frost. Higher consistency increases visible detail with bounded paths and gentle motion. Reuse/replace the old town sparkle budget in new scenes. Static/off/reduced scenes retain the reward shape; subtle mode avoids added animated particles. Include effect extents in scene bounds. No filters, scripts, remote images/fonts, or runtime raster libraries.

## Tasks and ownership

- [x] 1. Primary-source research and Metis review. Research owns `plans/nature-composition-research-2026-09-19.ko.md`; Metis owns ignored architecture report. Cite sources; distinguish recommendations from facts. QA: confirm primary links and trace bottlenecks to source/tests, including sparse/zero/missing-date constraints.
- [x] 2. Nature artwork. Worker owns new nature renderers, catalog/type/renderer/bounds/classification registration and nature-specific tests. References: `assets/renderers/grassland-pine.ts`, `assets/catalog.ts`, `assets/bounds.ts`. QA: 8 IDs × 3 distinct raster silhouettes in dark/light and all seasons, raster bounds; no external resources. Root regenerates pixel/catalog artifacts after artwork settles. Research also found sailboat ignored its variant argument; root owns water-turtle.ts and the existing water-art raster test to add three real rig/sail silhouettes within unchanged bounds.
- [x] 3. Composition selection. Worker owns `assets/progression-primary.ts`, `progression-pool.ts`, new composition helpers, `selection.ts` as needed, and primary/composition tests. References: `assets/date-seed.ts`, `style-pool.ts`, `tests/themes/progression-primary.test.ts`. QA: all tiers/seasons/biomes/cultures, density and normalization independence, reversed input and rolling dates, absent-count legacy behavior, catalog reachability. Large cohorts target nature >=70%, buildings/vessels <=20%, no single primary ID >20%, water tier-three >=6 natural IDs. Real demo sailboats <=8; actual fixture high-tier primaries must have nature and architecture variety. Verify reductions in dominant silhouettes visually and quantitatively.
- [x] 4. Consistency effects and layout contract. Worker owns new consistency types/calculation/renderers, `core/scene-types.ts`, scene preparation/metadata/rendering/bounds integration, effects CSS/overlays, day details and dedicated tests. References: `core/animation.ts`, `terrain/motion/index.ts`, `scene/rewards.ts`. QA: threshold boundaries 4/5/11/12/19/20, equal total with different active-day patterns, missing dates, zero/empty, UTC/leap-year/hemisphere, deterministic cap, off/subtle/full and reduced-motion fallback, legacy prepared scenes. Preserve existing water/sky motion budgets.
- [x] 5. Root integration, documentation and generated outputs. Update README/CLAUDE/CHANGELOG, exact count assertions to 210 ordinary (197 classic +13 Korean), 240 total and 660 pixel slots. Regenerate pixel, demo, catalog, previews, dist and approved visual snapshots after inspecting diffs. Add browser coverage for real user-facing variety and consistency explanations.
- [x] 6. Root verification and visual refinement. Same-fixture demo/profile before-after images, four seasons, both styles/cultures/color modes; empty/sparse/full. Run typecheck, lint, formatting, pixel/catalog checks, full Vitest coverage, browser suite, approved static images, package smoke and renderer budgets. Retain existing size/timing thresholds and baseline; optimize new composition first if limits fail. Report measured before/after costs, never silently loosen budgets.
- [x] 7. Five independent Orca reviews of the stable implementation and targeted QA: goals/contracts, hands-on QA, quality, security, historical context. All five returned PASS; wording and page-legend findings were corrected and rechecked. Read-only reviews overlapped final full regression; publication still requires the remaining root gates to pass. No other-service messaging or secret disclosure.
- [ ] 8. Publish and verify. Gitmoji commit; push feature, PR, all CI, squash merge to main, successful Pages run. Update `t1seo/t1seo` workflow to exact verified merge SHA; commit/push and dispatch generation. Verify actual served profile dark/light SVG and live demo/catalog in browser, including screenshot evidence. Keep npm/floating v1 unchanged unless version release becomes necessary and explicitly handled.

## Related user follow-up

A separate user-owned Orca thread relayed a request to make the height legend season-neutral and remove misleading scenery prose. Its existing coordinator owns only `scene/legend.ts`, `scene/presentation.ts`, and `tests/themes/terrain/scene/legend.test.ts`, with no commits or generation. This run integrates the reviewed result and owns any further regression adjustments. Do not close or take over that user-owned terminal. Seasonal readability remains part of tasks 2–4.

## Execution and loop

Orca run `run_d9a097c7667c`; disjoint workers share the feature checkout. Root owns integration and fixes. Research/Metis precede contracts; artwork/selection/effects run in parallel; generated assets and full QA follow stable production sources. Independent review overlaps the final regression after targeted QA; publication follows all local gates and passing CI. Receive every worker result, resolve questions, release settled workers, and retain receipts under `.orca/nature-composition/`. Red-green tests for behavior changes; do not weaken checks or snapshot uninspected regressions.

## Success evidence

Tracked release report plus before/after PNGs and metrics explain the observable reduction in repeated silhouettes, nature/architecture balance, eight new IDs, sustained-activity progression and any remaining limits. Final report links merged PR, live demo and actual profile. Completion requires deployed behavior, not merely a local implementation or a proposed plan.

## Prepublication approval

All local implementation, generated-output, regression, visual, package and performance gates and all five independent reviews passed on 2026-09-19. Task 8 is the remaining publication operation at this commit checkpoint; its actual merge SHA and live verification receipts will be recorded in the PR after deployment.
