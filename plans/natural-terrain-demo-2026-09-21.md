# Natural Terrain demo

## Objective

Research why the existing calendar-shaped Terrain feels rectangular and cramped, propose geographic alternatives, and open a working comparison demo using the project's improved SVG assets.

## Decisions

- Add an isolated `src/terrain-lab/` demo and `docs/demo/terrain-lab/` page; keep production calendar/world contracts intact.
- Reuse the unmodified `sampleSnapshot()` Contribution Calendar. Preserve every absolute date and count, including observed zero days. Clearly label synthetic data and rearranged geographic positions.
- Compare a continuous irregular island, several separate islands, and a river valley between ridges. Use shared surface vertices, sea-level clipping, true surface elevation, coherent biomes, and downhill water.
- Reuse the real asset renderers and place scenery in coherent forests/settlements. Provide three separately labeled showcase Wonders with breathing room.
- UI: layout, relief, coastline detail, scenery density, seed, day/night, original-calendar comparison, zoom, date markers, and accessible date inspection.
- Generate the actual current calendar SVG from the same sample for the comparison. Bundle an independent browser entry through `build:demo`; include docs/dist artifacts.
- Research report: `plans/natural-terrain-research-2026-09-21.ko.md`, citing original authors.

## Planning review

The independent review identified depth sorting, shared terrain vertices, geographic footprint spacing, downhill outlets, conservation of all sample dates/counts, distinct landmass topology, and fit on mobile as explicit acceptance criteria. Scenery controls must not change records or their positions.

## Tasks

- [x] Investigate original-author sources and the existing calendar, world, and SVG architecture.
- [x] Implement the deterministic model, responsive demo, actual-asset SVG renderer, and comparison build.
- [x] Verify model invariants, typecheck/lint/build, browser controls and visuals across layouts, and independent reviews.
- [x] Open the finished demo at `http://127.0.0.1:4173/terrain-lab/` with the recommended island visible.

## Verification

Meaningful model tests cover date/count conservation, stable anchors when activity changes, seed determinism, valid continuous geometry, and downhill rivers reaching the coast. Browser checks cover all three layouts in both lightings, controls, zoom/date inspection, original comparison, extreme controls, mobile overflow, exceptions, and screenshots. Depth ordering and scenery spacing also require visual inspection. No new runtime dependencies or production schema changes are planned.

## Final evidence

- Full `npm run build`, TypeScript checking, scoped ESLint and Prettier: passed.
- `vitest run tests/terrain-lab`: 23 tests passed across model and renderer.
- Browser QA exposed two regressions and failing tests reproduced both: 30% island relief omitted one showcase; adjacent terrain obscured building bases. Both tests pass after relief-aware site selection and artwork-footprint depth sorting.
- Independent browser confirmation: colosseum lower arches visible in all three layouts; 30% relief preserves all three showcase Wonders; hidden record markers also hidden from the accessibility tree.
- Goal, code, defensive security, project-context, and hands-on QA reviews: PASS.
- Final independent Playwright run: **35/35 scenarios passed** (P0: 9, P1: 22, P2: 4). No console/page/resource errors, duplicate IDs, or 320px/390px horizontal overflow.
- Browser pixel confirmation: colosseum art(0,0.5) is `[122,122,122,255]` in both the full scene and isolated artwork after the fix.
- Original sample: 364 dates, 1,582 contributions, 269 active dates, 95 observed zero days preserved. Same-sample original calendar comparison loads in both lightings.
- All six generated runtime files match byte-for-byte between `docs/demo/terrain-lab/` and `dist/demo/terrain-lab/`.
- Local QA evidence: `.orca/terrain-lab/qa-report.md`, `qa-results.json`, layout/day/night/mobile screenshots, and `island-final.png`. Browser page: `f1b38af3-21c1-4542-9d5d-c7a85d946f8d`.
- Temporary debug DOM mutations were reverted and independent browser instances closed; no debugging instrumentation remains in source.
