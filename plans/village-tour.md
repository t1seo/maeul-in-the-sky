# Calendar village tour

## Goal

Click the existing GitHub profile Calendar image to enter a polished, public Three.js tour of the same village. Preserve the Calendar renderer, profile SVGs, existing archives, dirty original checkout and npm 2.0.0 release.

## Research and decisions

- GitHub sanitizes scripts from README, so wrap the existing picture in a normal link to a new GitHub Pages `/tour/` page. GitHub Pages serves its static HTML, CSS and JavaScript.
- The existing `buildWorld()` rearranges dates and chooses assets again. Do not use it. Use `parseSnapshot()` → `snapshotToContributionData()` → `prepareTerrainScene()` and retain canonical placement identity.
- Calendar cell tops are level; `SceneCell.height` is downward island depth. Invert placement coordinates with half tile width 8 and half tile height 3.5. Use world cell size 4.
- Reuse the archived world's actual mesh recipes, curved roofs and geometry resources without changing its renderer. Add tour-specific model mapping and close-view detail.
- Start near a populated spring or summer district. Offer scenic orbit, guided flight between actual seasonal stops, ground walking with safe terrain and model bounds, and overview/home controls. Do not promise walk-connected roads when the source has none.
- Use warm light, soft distance fog, detailed Korean architecture, seasonal trees, grass, water ripples, falls and night window glow. Keep the control UI small, keyboard-accessible, English and responsive. Respect reduced motion and provide a usable WebGL failure screen.
- Requested snapshot loading errors stay visible; never silently replace a requested personal village with sample data. Without a snapshot query, show an explicitly named sample.
- Bound both observed days and the full date span to 800 before scene preparation. Preserve actual paths/decks, rewards and consistency metadata; SVG projected footprints are not collision bounds. Walking stops on focus loss/Escape, and camera gestures cancel guided travel.
- Include generated tour bundles in CI/publish artifact checks. Record the feature in CHANGELOG without changing npm 2.0.0.
- Keep repository npm/tsup/Vitest/ESLint/Prettier tooling and Three 0.186.0. No dependency migration or npm version bump.

## Sources

- https://github.com/github/markup
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/jsm/controls/OrbitControls.js
- https://raw.githubusercontent.com/mrdoob/three.js/r186/src/objects/InstancedMesh.js
- https://raw.githubusercontent.com/mrdoob/three.js/r186/src/renderers/webgl/WebGLShadowMap.js
- https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/jsm/objects/Water.js
- https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion
- UI reference: https://mobbin.com/screens/cd945edb-8e33-4e04-95cd-d89a48d5dbdb (compact navigation separate from primary map)

## Scope and ownership

New worktree: `village-tour`, branch `t1seo/village-tour`, base `b404096`.
Root owns render/navigation/app/build/docs/deployment. Model worker owns `src/tour/model/` and corresponding unit tests. Art worker owns `src/tour/assets/` and corresponding unit tests. Workers share no mutable files; all are told to preserve others' work.

## TODOs

- [x] 1. Canonical model adapter and data loading.
      References: `src/core/scene-types.ts`, `src/core/settings/parse.ts`, `src/themes/terrain/scene/prepare.ts`, `src/themes/terrain/scene/season.ts`, `src/themes/terrain/effects/water-topology.ts`, `src/world/data/transport.ts`, `src/world/data/urls.ts`.
      Acceptance: dates/counts/stats/placement IDs/catalog IDs/variants/anchors/wonders/rewards are preserved; y=0 surface; missing days remain absent; natural water and seasonal ice match source rules. Bounded URL loading uses existing validation, cancellation and size/timeout policies.
      QA: real parsed profile + deterministic sample correspondence tests; partial week/year boundary, zero activity, southern hemisphere, invalid snapshot and rejected source URL. Save evidence under `.orca/tour/`.
- [x] 2. Three-dimensional asset library.
      References: `src/world/model/recipes/`, `src/world/three/geometry/primitives.ts`, `src/world/three/geometry/roof.ts`, `src/themes/terrain/assets/catalog.ts`, `src/themes/terrain/epics/catalog.ts`.
      Acceptance: all catalog IDs resolve explicitly; preserve original variant as metadata; significant buildings/nature/wonders have recognizable mesh silhouettes; model ground bounds supply colliders; no SVG billboard buildings. No changes to archived world recipes required.
      QA: catalog completeness and valid finite recipe geometry; known Korean building/nature/wonder examples visibly inspected in the actual renderer; bounded instances and repeated shared geometry.
- [x] 3. Scene rendering and movement.
      References: `src/world/three/geometry/resources.ts`, `src/world/three/geometry/placements.ts`, `tests/world/browser/three-performance.browser.test.ts`.
      Acceptance: Perspective view, instanced detailed assets, downward island cliffs, merged water/foam/falls, seasonal colors, day/golden/night lighting. Orbit, guided route, safe walking, touch movement, stop/home/overview, hidden-tab and reduced-motion behavior. Model-ground colliders, never SVG projected bounds.
      QA: actual Chrome screenshots near/overview/night; keyboard and touch movement change camera; water/edge/building collision and resume/cancel checks; WebGL disposal/context loss; report measured draw calls/triangles/frame timing.
- [x] 4. Tour UI and build integration.
      References: `scripts/build-world.ts`, `scripts/build-demo.ts`, `docs/demo/index.html`, `.github/workflows/pages.yml`, `tests/visual/server.ts`, `vitest.config.ts`.
      Acceptance: named live source/sample, loading/error/retry, compact responsive controls, visit-stop details with actual date/count, minimap/season progress, shareable snapshot source. Build static `/tour/` and include in Pages validation and package asset flow.
      QA: desktop 1440x900 and mobile 390x844, touch-sized controls, no overlap/overflow, reduced motion, bad URL/404/oversize/invalid JSON, script-like labels remain text, no-WebGL fallback. Relevant browser coverage included without weakening repository thresholds.
- [x] 5. Quality pass and publication.
      Acceptance: typecheck/lint/format/build and meaningful unit/browser regressions pass; untouched Calendar baseline remains identical; independent review resolves material findings. Create normal PR and honor required checks. Deploy Pages, verify public tour, then update `t1seo/t1seo` image link and add an explicit tour link while preserving image sources and archive contents.
      QA: public live snapshot loading, actual README link target, real Chrome entrance/tour, expected profile username/date/count, Calendar image/archives preserved. Do not claim public completion based only on a local build.

## Final verification

- [x] Goal and source fidelity review.
- [x] Code quality and security review.
- [x] Real Chrome desktop/mobile QA and visual review.
- [x] Public Pages + profile click-through checked; QA processes cleaned and original dirty checkout preserved.

## Evidence and completion

User review of the Chrome preview on September 22 adds three publication requirements: default English menus and guidance; clearly distinguishable higher-detail animal geometry; and turn-in-place controls plus instant travel by clicking the map. Keep the original source identities and Calendar unchanged. Root owns navigation, surface picking and renderer integration; the art worker owns animal recipes and geometry validation; the app worker owns English UI, interactive minimap/touch controls and UI tests. Re-review these changes before publication. Use Q/E or left/right arrows and touch turn buttons to rotate in place, WASD to walk/strafe, and drag to look. Minimap clicks choose a valid observed date and enter walking on nearby safe ground; sky/missing dates never create ground. Also support terrain clicks in walking mode and an explicit Walk here action from date details. The completed tour uses first-person walking and turning.

Store commands, red/green tests, screenshots, performance observations, reviews and deployment links under ignored `.orca/tour/`, and workflow ledger under `.omo/start-work/`. Keep the feature worktree for review. User has requested implementation; execute the plan without another planning-approval step. Publication is part of making the requested GitHub picture entrance usable.

The user's preview refinements pass 1,331 focused unit/HTTP tests, 15 real-browser regressions, typecheck/lint/format/full build, and eight byte-identical Calendar baseline comparisons. Independent goal, code, security, context and actual Chrome QA reviews pass. Revised Chrome QA exercised 41 checks, all passing, including English UI, 18 animal models, a complete stationary revolution and safe map/surface travel. The actual 6,025-contribution profile retains 366 dates, 297 placements and zero Wonders. Chrome on Apple M1 at DPR 1 measured 120 frames averaging 16.67 ms (p95 18.5 ms) near the village, with 40 draw calls. Desktop, portrait/landscape touch emulation, actual back/forward, graphics-context recovery and the 800-day limit were exercised. OS-level backgrounding could not be reliably induced through the automated Chrome window; the explicit hidden-document regression passes.

Full CI at `fc72e57` passed 4,757 tests across 311 files. Its combined visual tour scenario accumulated the 45-second test deadline under software WebGL: individual clicks took 4–6.7 seconds, every reduced-motion interaction assertion passed, and no console errors occurred. Presentation and walking/map journeys are now separate tests with all assertions retained and unchanged timeouts. Final commit `33ebd58` passed all 21 checks, including all nine browser projects and CodeQL; its 4,757-test coverage is 97.12% statements, 92.84% branches, 98.54% functions and 98.06% lines.

Publication completed September 22, 2026. PR #36 merged as `241c0d8`; its tree is identical to the verified feature commit. Pages run `35675632641` succeeded. Chrome loaded the public tour, verified English UI, real 6,025/271/0 statistics, stationary turning, map teleport and mobile overview. Only after this passed, profile commit `41c603d` connected the existing picture and an explicit walking link. A second real Chrome run clicked the actual GitHub profile picture and repeated the public checks successfully, with zero errors. Evidence: `.orca/tour/public-tour.json`, `public-profile.json` and their screenshots.

The original picture markup and archive tree are unchanged. Original checkout diff SHA remains `b9c3993d2040604755ae522b8095224a1e46007560b62a6a3ef9b3679a9d24c0`; v1/v2 tags, npm 2.0.0 and archived worktree are preserved. All owned QA Chrome contexts and the port 4329 server are closed, temporary probes/journal removed, and the public tour opened in the user's normal Chrome. The feature branch/worktree and review artifacts remain available. Cleanup receipts: `.orca/tour/cleanup-final.json` and `cleanup-probes.json`.
