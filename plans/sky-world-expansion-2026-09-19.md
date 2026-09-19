# Sky World expansion and premium atmosphere

## Objective and authorization

Implement every idea in `world-expansion-ideation-2026-09-19.ko.md`, including the eight highlighted proposals, and improve cloud, moon and sun artwork. The user authorizes implementation, commit, push and deployment; the existing conversation also authorizes main merge and actual GitHub profile application. This is a production delivery plan, not a prototype-only handoff.

Base: `05a10eff07575acf2c81adcd66a66bc501507217`. Branch: `feat/sky-world-explorer`. Orca Run: `run_61c77983f01d`. Shared current checkout with explicit file ownership; preserve the two existing research documents. Coordinator owns integration, generated artifacts, dependencies, GitHub operations and deployment.

## Product decisions

- Add a separate `/world/` experience. Keep existing SVG banner/card, CLI, Action, archive and browser APIs working. Link the current demo and actual profile into the new explorer using the same snapshot data.
- Art direction: richly detailed natural miniature, layered terrain, warm village lights, generous sky, clear seasonal identities and a small, readable explorer interface. Nature remains dominant; cities occupy coherent local districts. Calendar mode shades each month in its own season; an explicit season override applies to the whole world. Seeded coast/ridge variation keeps monthly islands from repeating one footprint.
- Provide both a self-contained 2D SVG map and genuine interactive Three.js geometry. 3D loads only when selected. A GPU failure leaves a usable map and an actionable status.
- Default layout is a monthly archipelago, with a unified island alternative. Use full year-month identity and fixed dated cells; background scenery is not a contribution day.
- Replay is a presentation cutoff over stable generated coordinates. Never regenerate the past with a different seed or show future earned props during replay.
- Public project districts use actual GitHub repository/release metadata. Do not infer per-repository contribution attribution from daily totals. World visits use portable public JSON links and local bookmarks, with explicit provenance and no account system required.
- World documents carry a frozen validated world scene, generation/model versions, source snapshots, view settings and optional public project metadata. World files are bounded to 8 MiB; existing snapshot/archive limits remain 2 MiB. No browser token fields or secret-bearing URLs.
- Use the established npm/TypeScript/ESLint/Prettier/Vitest/Playwright toolchain. Dependencies are installed by the coordinator only. No unrelated migrations.

### Accepted follow-up: seasonal motion and richer surfaces

The user added moving seasonal flowers/petals, butterflies, snow and rain, and explicitly prioritized ground quality and a softly flowing river. This is part of this same implementation and deployment, not a deferred idea.

- Add a default **seasonal** weather mode, while retaining explicit clear/rain/snow. A canonical monthly helper respects calendar seasons, season overrides and hemisphere; summer has gentle rain and winter has snow.
- Localized seasonal life appears around the relevant monthly islands: petals and butterflies, autumn leaves, and bounded precipitation. Full motion animates; reduced/off/subtle world modes keep the saved elapsed pose. Weather and motion do not alter contribution evidence.
- Both world renderers gain grass/soil/sand/stone/snow surface detail, less harsh tiling, shallow/deep water transitions, soft current streaks, shore foam and waterfall motion. Reuse bounded geometry/materials and renderer clocks, with full resource disposal and static captures.
- The original profile SVG gains compatible seasonal motion and surface polish within existing namespace, motion and size/performance contracts. Pixel artwork and date/count identity remain intact.
- Reopened Three geometry task: `task_540aa2bfd39c`, dispatch `ctx_2a84be5d1041`, existing geometry terminal. Original SVG surface task: `task_f39d818fa14d`, terminal `term_6ccc5568-53b1-47cb-890b-e0cc7767e305`. Map/Three/app/model owners extend their current tasks. The model owner additionally owns the completed data layer's weather-view schema update.
- Re-run relevant coverage, visual motion evidence, exports and release checks after these changes before commit/push/merge/deployment.

## Coverage of the approved ideas

### Accepted follow-up: one annual island and four seasonal islands

The user explicitly requests a contiguous January–December island and four separate seasonal islands, alongside the monthly archipelago. This extends the same authorized implementation and deployment. Continue manual browser verification in Orca only.

- Preserve `archipelago` and the existing `island` option; add `seasonal` to the validated layout contract. The large island must have physically adjoining terrain, not merely one island identifier. All twelve months retain clear calendar-season artwork and weather.
- Group the seasonal layout into spring, summer, autumn and winter landmasses. Northern winter includes December/January/February; southern hemisphere uses the canonical shifted season rule. Full annual input produces exactly four connected components. Partial ranges show only seasons actually represented; never invent contribution days to fill a season. Absolute year-month slots must remain unique, deterministic and stable across replay and range expansion, including rolling 13-month inputs.
- Use the existing month-region palettes, seasonal motion and renderer-neutral terrain in both SVG and Three.js. Keep date/count identities, chronological timeline order, fixed contribution-height scale, route validity, frozen save/load, static exports and all resource budgets intact. A visual season override changes scenery, not geographic grouping.
- The selector names are `월별 군도`, `하나의 큰 섬`, `사계절 군도`, with an explanatory caption and readable seasonal/month labels. Selection survives world JSON export/import and local saves. Classic remains separately selectable.
- Preplanning gap review: the independent goal reviewer identified the terrain placement helper as the shared seam and required actual adjacency tests, hemisphere/year boundaries and backward-compatible frozen JSON checks. One island record alone is insufficient evidence.
- Implementation ownership: layout model worker owns `src/world/model/` and focused model/data roundtrip tests; layout UI worker owns world app controls/presentation, world HTML/CSS, SVG label presentation and focused UI tests; coordinator owns documentation/builds/performance harness and release. The separate regression worker owns the newly found Classic input-draft race and Three keyboard-follow release.
- Acceptance/QA: CPU adjacency analysis proves 1/4/12 components for a full year; every observed date/count is identical across layouts; north/south, leap year, rolling 13 months, partial range, replay and JSON roundtrip pass. Built desktop/mobile UI switches all three layouts, preserves counts and selected dates, and renders calendar seasons correctly in SVG and genuine 3D. Inspect Orca screenshots of the large island and four seasonal islands; run the complete release checks and five reviews after rebuilding.

### Accepted follow-up: selectable pre-upgrade classic version

- Preserve the exact browser renderer from `05a10eff07575acf2c81adcd66a66bc501507217` under `assets/versions/classic/`, with provenance, license and SHA-256 checks. Builds copy it unchanged to Pages and the packaged preview; current rendering does not load it eagerly.
- The original demo offers current/classic selection with URL persistence, identical contribution input, consistent preview/export rendering, and a classic GitHub workflow pinned to the exact old commit. Snapshot schema-v1 remains unchanged; engine selection is presentation and deployment configuration.
- The world explorer offers a version selector that transfers its source snapshot into the selected SVG demo via a validated one-shot session transfer. Failed transfers or renderer loading preserve the active result.
- Classic demo task `task_472f95bffc8f`, dispatch `ctx_91d4bf7ccfaa`; world selector follow-up `task_da81be1066f4`. Coordinator owns immutable assets, packaging, documentation and integration.
- Acceptance: current → classic → current shows the actual distinct engines with unchanged counts/dates; reload/share and generated workflow retain selection; static exports use that engine; mobile and failed/rapid load flows work. Five reviews include this scope before release.

| Idea | Deliverable | Owner task |
| --- | --- | --- |
| P1 Monthly sky archipelago | Selectable monthly islands and unified island, month/date navigation | 1, 4, 6 |
| P2 Living village and events | Habitat-aware actors, market/seasonal event scenes tied to observed activity | 1, 4, 5, 6 |
| P3 Time machine and annual worlds | Stable chronological reveal, playback, archive year navigation and saved worlds | 1, 2, 6 |
| P4 Project neighborhoods | Actual public repository districts and release memorials | 2, 4, 5, 6 |
| P5 Friend visits | Open public world/snapshot links, save/remove local visit bookmarks, return to own world | 2, 6 |
| D1 Nature/hanok/town/city regions | Coherent regional land use and diverse buildings with open natural space | 1, 4, 5 |
| D2 Seasonal living scenery | Spring flowers, summer waterside life, autumn harvest, winter snow and warm windows | 1, 4, 5 |
| D3 Explore at different scales | Whole-world/month/day focus, persistent selection details, accessible controls | 4, 5, 6 |
| D4 Photo mode and postcards | Time/season presentation controls and exported postcard PNG/SVG | 4, 5, 6 |
| D5 Discoveries and stories | Dated discoveries, explanation, filtering by current replay date and visit changes | 1, 2, 6 |
| E1 True 3D | Orbit/zoom/pan/picking/follow camera with real geometry and model export | 5, 6 |
| E2 Continuous landscape | Connected water, ridges/coast/cliffs, distinct dated plots and scenery | 1, 4, 5 |
| E3 Transit and wildlife routes | Valid train/ferry/animal paths and bounded animation | 1, 4, 5 |
| E4 Contextual asset combinations | Courtyards, piers, steps, regional modular silhouettes | 1, 4, 5 |
| E5 Portable world and keepsakes | Versioned save/load, reproducible geometry, PNG/SVG and GLB export | 2, 5, 6 |
| New sky request | Better cloud volumes, illuminated sun, cratered/crescent moon, layered stars | 3, 5 |

## Architecture and ownership

- `src/world/model/`: renderer-neutral deterministic world preparation, world types, regions, routes, discoveries and lifecycle data. Owns semantic shared contracts.
- `src/world/data/`: validated world envelopes, local collections/bookmarks, bounded public GitHub metadata and public world loading. Does not own rendering or DOM.
- `src/world/map/`: SVG world rendering and map mounting/selection/focus/export. Reuse the existing catalog artwork and motion/namespace infrastructure where useful.
- `src/world/three/`: procedural 3D asset geometry and Three.js renderer, lighting/sky, lifecycle, camera, picking and model exports. Renderer code split into cohesive modules.
- `src/world/app/` and `docs/demo/world/`: user-facing world experience and controls, navigation, imports, replay, discoveries, project/visit panels and downloads. No duplicated domain logic.
- Existing sky owner: `src/themes/terrain/effects/sky.ts` and new sky helpers plus focused sky tests. Preserve existing function signatures and motion contracts.
- Coordinator: `scripts/build-demo.ts`, other build/publication scripts, package manifests/lockfile, `.github/workflows/`, demo entry bridge, public export surfaces, README/CHANGELOG, generated `dist`/demo assets, profile integration and final verification.

Pure model APIs accept existing `SnapshotV1` with world settings and public project metadata. World coordinates use X/Z on the ground and Y for height, separate from 2D screen projection. Dated cells, entities, routes and discoveries carry source dates or explicit scenery semantics. Presentation options include lighting, weather, season override, motion, replay date, selection and focus. Shared model types live in `src/world/model/types.ts` with cohesive supporting modules; model owner publishes them before dependent renderer implementation.

The agreed APIs are `buildWorld(input)`, `frameWorld(scene, view)`, `defaultWorldSettings(snapshot)`, `defaultWorldView(scene)`, `sampleActor(...)`, and `parseWorldScene(unknown)`. The coordinator-owned `src/world/model/renderer-types.ts` specifies `mountMap` or async `mountThree`, then `update(view)`, `focus(target)`, `reset()`, `getView()`, `capture({format,width,height})` and `dispose()`, plus capabilities and real GLB `exportModel()` for 3D. `getView()` preserves the actual camera after user manipulation. Callbacks are `onSelect`, `onViewChange` and `onError`. A replacement mounts in a separate slot and disposes the previous renderer once ready; stale async mounts are disposed before activation. Common frame calculation owns all dated visibility and actor positions. No renderer may attach resources that survive disposal.

Task 1 delegates `src/world/model/recipes/**` and its tests to a model-art worker: `createModelRecipe(family, variant)` returns frozen version-1 primitive parts for 34 families with three silhouettes each. Task 5 delegates `src/world/three/geometry/**` and its tests to a geometry worker, using the port in `src/world/three/geometry-port.ts`. The parent retains camera, atmosphere, lifecycle and export. Three.js 0.186.0, its matching types and Ky 2.1.0 are exact development dependencies because their runtime is fully bundled into static explorer assets. The existing Node 20 public package entry points do not import them.

### Metis findings incorporated

- Preserve all actual dates in a rolling snapshot, including 13 distinct year-months. The snapshot label year never removes a date from the world. Reserved month/day slots use absolute identities and fixed height maximum 50 so future activity cannot move past places.
- Derive earned landmarks and events from prefix observations. Do not transplant full-year Wonder eligibility into a past replay frame.
- Persist frozen finite scene geometry/recipes and supported versions; local discovery visits are separate from places merely existing in the world. Bookmarks/journals stay out of public exports.
- Use actual public repository metadata and release publication dates, with pagination/coverage and honest rate-limit errors. Public URL loading supports GitHub raw/Pages hosts and same-origin fixtures; root scopes the local world-page CSP accordingly.
- Register a dedicated Vitest world browser project and preserve existing coverage. World bundles stay lazy and out of the existing browser/CLI/Action entry graphs. Both Pages and packaged preview must serve the same relative world resources.
- Sky has no dependency on the new world contracts and can run independently after its existing motion/render seams are confirmed.

## Execution and dependency graph

| Task | Depends on | Can run with | Blocks |
| --- | --- | --- | --- |
| 0 Architecture, test seams, official 3D API research | Existing research | Coordinator planning | 1–7 |
| 1 World model and shared contracts | 0 | 2, 3, coordinator build preparation | 4–6 |
| 2 World data, public projects and visits | 0; shared contract agreement with 1 | 1, 3 | 6 |
| 3 Premium SVG atmosphere | Existing sky seams confirmed | 1, 2, remaining research | 7, 8 |
| 4 2D map renderer | 1 contracts | 5, 6 | 7, 8 |
| 5 3D assets and explorer renderer | 1 contracts, official API research | 4, 6 | 7, 8 |
| 6 Explorer UI | 1 contracts, 2 interface; renderer ports | 4, 5 | 7, 8 |
| 7 Integration and generated artifacts | 1–6 | Documentation | 8 |
| 8 QA and repairs | 7 | Five review perspectives once evidence is available | 9 |
| 9 Commit, merge, deploy and live profile | 8, reviews | None | Completion |

Critical path: shared model contracts → world renderers and UI → integrated browser/coverage checks → review → main/Pages/profile publication. Within task 5, geometry and renderer orchestration may be dispatched independently after a concrete geometry factory interface is written.

## TODOs

- [x] 0. Finish architecture and official API research; incorporate Metis gaps.
  - References: `src/core/scene-types.ts`, `src/browser.ts`, `src/core/snapshot-types.ts`, `scripts/build-demo.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`.
  - Evidence: `.orca/world-expansion/metis.md`, `qa-architecture.md`, `three-research.md`; all worker dispatches show accepted provenance.
  - QA: confirm exact exports, test server path and public deployment path from source; list unresolved decisions and resolve them in this plan before implementation.

- [x] 1. Implement the deterministic world model and coverage tests.
  - Implement monthly/unified layouts, coherent natural and built regions, real dated plot mapping, height/water/coast, varied props, neighbor details, transit routes, actors, seasonal events and discoveries.
  - References: existing calendar/settings parsers, scene preparation and catalog APIs, seeded math, consistency calculations.
  - Acceptance: repeat inputs produce identical scene; theme/replay presentation does not change geometry; complete input dates appear once; missing dates stay missing; 0 days earn no activity reward; 13-month rolling/empty/leap-year inputs work; same short range/zero/high-activity scenes remain readable and bounded.
  - QA: focused Vitest domain tests and serialized fixture metrics under `.orca/world-expansion/evidence/model/`; route endpoints and source-date invariants are asserted.
  - Completed evidence: 628 model/recipe/data checks, 99.25% statement and 97.40% branch coverage in the focused model/view scope, strict checks and 13-month JSON roundtrip. Shared seasonal-weather rules and stable repository placement are included.

- [x] 2. Implement data, collections, project metadata and visits.
  - Parse/save versioned worlds and existing snapshots/archives; store personal saved years, discoveries and visit bookmarks; fetch actual public repositories/releases with bounded timeout, cache and rate-limit feedback; validate public world URL loads.
  - Acceptance: save/load preserves date/count identity and geometry inputs; unsupported versions and oversized/malformed inputs reject; public project records display verified names/links/releases without fabricated activity; visit/back/bookmark/remove works; failed import/fetch preserves current world.
  - QA: wire-level fixtures for rate-limit/timeout/bad JSON and real import/export through the app; evidence `.orca/world-expansion/evidence/data/`. No private data or tokens in committed evidence.

- [x] 3. Upgrade clouds, moon and sun in legacy SVG output.
  - Use designed cloud silhouettes and coherent shading instead of transparent overlapping ovals; moon has an intentional illuminated shape, crater detail and gentle halo; sun has a warm layered disc and restrained rays. Keep imagery crisp at banner size.
  - Acceptance: deterministic and namespaced; both modes and layouts render; off/reduced motion retains finished art; no external resources/scripts; no increase in animation count; existing size/render budgets remain valid.
  - QA: pin existing motion contracts, add meaningful shape/namespace tests, render before/after banner/card crops in dark/light; evidence `.orca/world-expansion/evidence/sky/`.

- [x] 4. Implement a complete 2D world map and static exports.
  - Render irregular island scenery, dated plots, existing high-quality catalog art, region connections, seasonal life and premium sky. Support world/month/day focus, accessible selection and static SVG capture.
  - Acceptance: selected date matches source; complete period is present; replay hides future earned details; sun/moon/season controls visibly affect presentation; exported SVG parses and renders standalone with no external dependencies.
  - QA: browser click/keyboard/focus and SVG parse/raster checks for both layouts, all seasons, low/high activity, Korean/classic and reduced motion. Evidence `.orca/world-expansion/evidence/map/`.
  - Completed: 75 focused checks and 9 final built Chromium desktop/mobile/reduced narratives pass; independent SVG/PNG downloads and mobile month framing verified.

- [x] 5. Implement genuine 3D geometry and exploration.
  - Procedural meshes must distinguish broadleaf/conifer/bamboo/willow/grove/meadow/wetland/rocks, Korean and classic buildings, city silhouettes, transit and wildlife; variants affect geometry. Include coast/cliffs/water and layered cloud/sun/moon art.
  - Implement orthographic orbit/pan/zoom, picking/focus, actor-follow camera, seasonal/daylight changes, replay visibility, bounded animations, resource cleanup, PNG capture and actual GLB export.
  - Acceptance: 3D camera movement reveals actual depth; representative silhouettes are distinguishable; mobile controls work; off/reduced pauses movement; context failure leaves the map usable; repeated entry/exit does not leak canvases/listeners/animation frames; GLB can be parsed again.
  - QA: real Chromium WebGL browser use, camera-before/after screenshots, picked-date assertion, export reimport and disposal tests; mobile and unavailable-GPU fallback scenarios. Evidence `.orca/world-expansion/evidence/three/`.

- [x] 6. Build the complete world explorer experience.
  - Full visual map with restrained panels; controls for 2D/3D, archipelago/island, month/year/date, season/time/motion, replay, follow/photo, discovery list, world import/save, project districts and visits.
  - Show source provenance and real statistics. Preserve the currently open world on failed operations. Support keyboard controls, responsive 390px layout and reduced motion.
  - Acceptance: every approved feature has an operable user flow; no decorative dead buttons; selections remain consistent between renderers; same data transfers from the legacy demo; saved/imported worlds restore meaningful state; async requests cannot overwrite a newer selection.
  - QA: Playwright narratives for the 15-idea matrix plus reload, rapid view switches, malformed file, network error and mobile dialogs. Evidence `.orca/world-expansion/evidence/app/`.

- [x] 7. Integrate builds, package outputs, demo entry and documentation.
  - Bundle world UI and lazy 3D separately; make assets available from Pages and local preview; bridge current snapshot to world explorer; publish a real-data world link for the profile; regenerate tracked artifacts.
  - Update English/Korean user guidance, CHANGELOG and relevant package/Action outputs only where needed. Keep library/browser entry free of eager Three.js imports.
  - Acceptance: `npm run build`, package smoke, existing demo flows and world deep links work; deployed path resolves its chunks; Action still produces valid dark/light images; no secret in tracked outputs.
  - QA: package install smoke, local preview `/world/`, Pages-like subpath loading and generated artifact consistency.

- [ ] 8. Complete QA, visual iteration and five-perspective review.
  - Run typecheck, lint, format, pixel/catalog checks, coverage with existing thresholds, package smoke, renderer benchmark and cross-browser regression. Review screenshots at desktop/mobile and compare cloud/moon/sun before/after.
  - Review-work perspectives: goals, hands-on QA, code quality, security and historical context. Every blocking finding is fixed and retested before publication.
  - Acceptance: all required checks pass without weakening existing thresholds to hide regressions; each approved idea has fresh observable evidence; resources spawned for QA are cleaned up.
  - Evidence: `.orca/world-expansion/evidence/`, `.orca/world-expansion/reviews/`, tracked concise release report with representative images.

- [ ] 9. Commit, push, merge and deploy; verify actual profile application.
  - Commit only reviewed task files with Gitmoji conventions, push feature branch, create PR, wait for required CI, merge main, wait for Pages. If package version changes, publish matching GitHub release and move the documented floating major tag.
  - Update the profile workflow to the tested commit, regenerate actual contributions plus public world snapshot, link profile artwork to the explorer, run the workflow and verify remote files and browser display.
  - Acceptance: exact merged SHA, successful CI/Pages/profile runs, live 2D and 3D explorer, improved sky on actual profile image, working profile-to-world link, clean main checkout and all task-owned terminals/processes released.
  - Evidence: workflow URLs/SHAs, HTTP body checks, live screenshots and final release report. Do not claim deployment from a local build alone.

## Final verification policy

Tests support correctness; visible browser actions and exported/served artifacts prove delivery. Record commands, outputs, screenshots and cleanup for each criterion. Coordinate shared output directories and full builds so independent workers cannot corrupt one another's evidence. Preserve current work during failures and continue repair loops until the authorized outcome is complete.

Final execution-location decision: after current focused checks and builds pass, publish a reviewable feature commit and draft PR so the complete existing gates can run in CI on that exact commit. Full coverage (95/90/95/95), all nine browser projects, packed Node 20/24 smoke, renderer budgets and approved static images remain mandatory. Combine their successful CI evidence with current local focused tests, Orca manual use and the local world browser matrix. Do not describe an interrupted local coverage run as passing. All required checks and all five reviews must pass before main merge, Pages deployment and profile publication. Each of the nine browser projects runs serially on its own isolated CI runner with a 20-minute execution limit; the final Browser Regression gate requires every project to succeed. Functional assertions, rendering budgets and coverage thresholds remain unchanged.
