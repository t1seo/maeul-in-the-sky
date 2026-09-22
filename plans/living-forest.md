# Living forest and authored wildlife

## Objective

Replace awkward procedural wildlife with clearly recognizable, professionally authored models, and give the existing tour a coherent sense of life. Mandatory visual subjects are squirrel and cow. Preserve the published Calendar, all source dates/placements, English controls, stationary first-person turning, teleportation, square translucent corner map and compass.

Worktree: `/Users/cillian/Documents/Github/Projects/maeul-in-the-sky/living-forest`, branch `t1seo/living-forest`, base `8531975e36a9e12c37d24e2aaff11f16da9686fe`. Other worktrees and release tags stay intact. Existing user authorization includes GitHub deployment; no additional purchase, npm version release or approval flow is needed.

## Decisions and research

- Vendor the verified historical CC0 Quaternius Ultimate Animals for cow, deer, fox, horse and donkey; use verified CC0 Farm sheep and pig, including the lamb alias. Use the CC-BY 3.0 Poly by Google chipmunk `fQ5KzXoR2uA` for squirrels. Only these proven sources enter production. Record exact URLs, original/output hashes, creator, license and modifications. New sitewide Quaternius QAL terms are not used as permission for unrelated downloads.
- Preserve the artists' silhouettes and coloration. Normalize feet, axes and size explicitly. Keep only suitable idle/feeding clips, optimize constant animation keys and material draw calls, and produce self-contained GLB with no external URLs or runtime decoder.
- Start with natural stationary behavior: independent idle/feeding phases, subtle chipmunk breathing/sniffing. Do not translate grounded animals without a matched gait and safe ground route; no new pathfinding or arbitrary circular sliding.
- Add coherent wind to explicitly identified trees, shrubs, reeds, flowers and grass. Roots stay anchored, variation follows world position, and shadow materials use the same deformation. Buildings, rocks and water geometry remain rigid. Improve grass silhouettes/density within the existing rendering budget.
- Keep the renderer synchronous after an abortable asset-loading phase. Animal model library owns shared source resources; population owns cloned skeletons/mixers. Each owner disposes once, including failed/aborted loads and retries. Selected GLB failure is explicit and recoverable through the existing Retry/Calendar fallback UI.
- Share the existing renderer clock. Reduced motion, hidden tabs and offscreen canvas freeze the scenery without a time jump. Bound animal update work by visibility/distance while preserving independent phases.
- Use a source-ID lookup for animated child meshes, so clicks preserve dated placement identity. Preserve existing null animal colliders and immutable scene/model coordinates.
- Use existing Node/npm/TypeScript/Vitest/Playwright tooling. Real Chrome is the art and interaction QA browser. Run only one GPU test process at a time. Keep the 45-second Playwright timeout and short scenarios.

## Metis findings incorporated

Actual profile contains three squirrels and no cow; sample contains two cows and five squirrels. Test both and inspect close-ups. Existing procedural tests cannot prove GLB loading, so add real loaded-model tests. GLB MIME is missing in the npm preview allowlist and must be tested. Wind materials cannot be shared with static geometry. CC-BY requires visible credits, and partial async loads, ImageBitmaps, cloned skeletons and animation bounds need explicit lifecycle handling. Offscreen canvas pause is a new behavior, not an existing guarantee.

## Verification and budgets

- Baseline: unchanged focused model/animal tests and Chrome close-ups/frame measurements before implementation. New contracts receive failing tests before their production changes.
- Preserve model source counts/IDs/dates/positions. Existing sample real-render draw-call ceiling `<350` remains. Measure actual profile, sample and 800-day scene at Overview and close-up using fixed viewport/DPR/camera, warm-up then p50/p95 frame times; report actual measurements, never assumed FPS.
- Authored model payload target: total at most 6 MiB, each at most 1 MiB; record triangles, bones, clips, meshes and bytes. No external URI or required decoder. A material/animation optimization may improve these without changing silhouettes.
- Chrome art acceptance: squirrel and cow front/side/three-quarter views are readable at normal walking distance; eyes, muzzle, ears, hooves/paws, tail and body proportions remain recognizable; feet stay on ground throughout idle/feed; no duplicate primitive body, detached parts, visible root jumps or synchronized herd poses. View day and night in the actual village.
- Motion QA: vegetation sways visibly with anchored roots and matching shadows; static building/rock reference does not deform; animal bone/pose changes independently; reduced/hidden/offscreen states hold poses and resume smoothly.
- Runtime QA: missing/corrupt GLB, abort while loading, repeated retry, context loss/recovery, stale results, cleanup, no unexpected external requests, no page errors. Preserve walking, turning, map corners, compass, keyboard/touch teleport and date picking.
- Packaging QA: real GLB HTTP response and parsing through the packaged preview, license/credits presence, Pages subpath URLs, local/public asset hashes. Run full required CI before normal PR merge and public Chrome verification.
- Evidence: `.orca/living-forest/`; durable progress `.omo/boulder.json` and `.omo/start-work/ledger.jsonl`. Remove temporary QA scripts, servers and owned browser contexts after verification; preserve reports/images/videos.

## Execution

Wave 1: asset preparation and vegetation work are independent after baseline evidence. Wave 2: root integrates the wildlife library/actors and application lifecycle, then packaging. Wave 3: art/performance QA, independent reviews, CI and deployment.

- [x] 1. Preserve baseline and vendor verified authored wildlife.
  - References: `src/tour/assets/definitions-nature.ts`, `tests/tour/assets-animals.test.ts`, `docs/demo/tour/`, research notes under `.orca/living-forest/`.
  - Deliver exact source/provenance/license manifest, normalized GLB and reproducible preparation instructions/tool; retain only appropriate idle/feeding clips. Resolve skeleton bounds and normalize with a pivot parent without breaking rigs.
  - QA: validate headers/embedded resources, geometry/bone/clip counts, checksums and payload budget; reject a changed source hash or external texture URI. Compare mandatory animal views before/after in Chrome.
  - Owner: asset worker for model directory and offline preparation; root for baseline screenshots. Blocks 3 and 4; independent of 2.

- [x] 2. Add grounded forest wind and better grass.
  - References: `src/tour/render/batches.ts`, `scenery.ts`, `populate.ts`, `src/world/three/geometry/resources.ts`.
  - Deliver a shared wind controller with explicit profiles, separate static/wind materials, matching depth deformation and bounded culling margin. Root will wire renderer/populate integration after the worker returns.
  - QA: first failing motion-profile/static-material tests, then real shader compile and time-differenced Chrome captures; roots/rocks/buildings stay fixed, foliage and shadows move, frozen time stays fixed.
  - Owner: vegetation worker for wind modules, batches, scenery and focused tests. Does not edit renderer/populate/app. Independent of 1; blocks 5.

- [x] 3. Load and animate authored wildlife with correct lifetime and identity.
  - References: `src/tour/app/main.ts`, `render/renderer.ts`, `populate.ts`, `picking.ts`, `types.ts`, `tests/tour/browser/render.browser.test.ts`.
  - Deliver a manifest-based bounded loader, independent skeletal instances, deterministic behavior phases, optional renderer integration for existing direct callers, but real authored GLB coverage in tests. Move no source anchors. Add inspect counters needed for bounded runtime QA.
  - QA: real cow/squirrel assets load, two cows have independent bones/shared geometry, pose changes without foot drift, child mesh clicks return original dates; 404/corrupt/abort/retry/context loss dispose correctly. Raw-browser tests pass explicit asset base URLs.
  - Owner: root. Requires 1; can run alongside 2.

- [x] 4. Serve, attribute and package the new assets.
  - References: `src/preview/assets.ts`, `scripts/package-runtime-assets.ts`, `scripts/smoke-package.ts`, `docs/demo/tour/index.html`, corresponding tests.
  - Deliver GLB MIME support, packed asset smoke coverage, English credits link with creator/source/license/modification notice and changelog. Rebuild docs/dist consistently.
  - QA: packed preview serves and parses a genuine model; invalid/traversal paths retain existing protections; all licensed model files and notices are present.
  - Owner: root. Requires 1 and 3.

- [x] 5. Verify art, motion, controls and performance in Chrome.
  - References: existing `tests/tour/browser/`, `tests/visual/tour.spec.ts`, this plan's budgets.
  - Execute actual profile and sample, cow/squirrel multi-angle close-ups and motion clips, day/night, desktop/mobile/reduced motion, 800-day bound, square map/compass/turning/teleport regressions and lifecycle failures. Compare same-device baseline measurements; fix actual defects before review.
  - QA evidence includes screenshot/video, frame/draw-call/triangle/actor data and cleanup receipt; no GPU test concurrency. Requires 2–4.

- [ ] 6. Complete independent verification and publish.
  - Run goal, code quality, security/license, context and hands-on QA reviews (`review-work`), address findings, run appropriate full checks and normal protected-branch CI.
  - Merge focused PR, retain old branches/worktrees, watch Pages success, verify public assets and animal motion in installed Chrome and open the public tour for the user.
  - QA: exact merged/deployed source, successful live model requests, public functionality and no errors; finish evidence ledger and cleanup. Requires 5 and all reviews.

## Commit strategy

Use gitmoji conventional commits and update CHANGELOG for the feature. Keep production modifications bounded to tour rendering, static model delivery and necessary preview/package support. No release tag or version change for this Pages-focused update.
