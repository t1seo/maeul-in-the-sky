# Authored assets for the Calendar village tour

## Goal and constraints
Replace every procedural tour asset for which a demonstrably better, redistributable external model is available. The user chose detailed, believable forms comparable to Civilization. Preserve the original Calendar SVG, source IDs/dates/positions, Korean architectural identity, English UI, first-person turning, compass, square translucent corner map, teleportation and forest motion. Continue through commit, push, protected-main merge and GitHub Pages verification. Use Chrome. Keep previous worktrees and the dirty original checkout intact.

Base: `57590d09dff4c5079697f941d04d3d77b106e8b4`. Worktree: `tour-assets`, branch `t1seo/tour-assets`. Research artifacts are under `.orca/tour-assets/research`. Original tracked dirty-diff SHA-256: `b9c3993d2040604755ae522b8095224a1e46007560b62a6a3ef9b3679a9d24c0`.

## Decisions
- Retain the eight externally authored animals already shipped. Extend to additional animal IDs, retaining the robin after rejecting an inferior external candidate, using verified Google Poly CC BY 3.0 and Quaternius CC0 models. Keep groups such as fish schools and butterfly gardens distinct, with correct ground/water/perch/flight placement and only approved authored animation clips.
- Adopt the 18-model Quaternius Stylized Nature MegaKit Standard collection, whose downloaded archive includes CC0. Preserve mesh detail, normals, leaf cutout alpha and named roots; resize textures to 512 and encode opaque color/normal images as JPEG85/95. Measured main pack: 3.24 MiB, decoded images 14.0 MiB. Four extra willow/palm/cattail/lily models add 219 KiB. The cut-stem bamboo candidate was rejected after art review, preserving the existing leafy thicket. Recompute bounds from actual positions because one source fern has incorrect declared bounds.
- Use verified historical CC0 Quaternius village models, selected Kenney CC0 props and individually attributed landmarks. Independently assess the CC0 Korean hanok kit for recognizable, detailed buildings; its publisher discloses AI-assisted production. No purchases, account changes, remote code execution or runtime asset CDNs.
- A typed static-model placement layer uses self-contained local GLBs, named submodels, bounded downloads, shared library resources and instanced meshes. It preserves source identity, seasonal foliage, trunk-only tree collisions and pass-through structures. Composite water, fruit and fire parts remain where required.
- Publish a full 240-ID coverage ledger with authored/hybrid/retained status and explicit reasons; generated terrain, water, particles and grass remain purpose-built where a static external model would remove behavior.
- Keep loading cancellable and recoverable, dispose renderer instances before shared libraries, preserve masked leaf shadows under wind, and do not tint bark or buildings as foliage.
- Performance gates: sample and actual-profile initial model transfer <=12 MiB; decoded model texture storage <=128 MiB; real entrance draw calls <350; measure 800-day scene separately and compare frame timings on the same Chrome/hardware. If the detailed pack exceeds a gate, optimize or spatially cull it while retaining visible quality. No silent relaxation of existing checks.

## Implementation contracts
`src/tour/authored/types.ts` defines authored parts with local file, optional named node, target height, maximum horizontal span, offset/yaw, wind profile and foliage material names. A definition includes replacement parts and explicit remaining procedural parts. Nature and village mapping modules independently export functions `(placement, fallback) => definition | null`. The catalog combines them; the library loads only requested files and owns shared GPU resources. Population instances group geometry/material/season/chunk, preserve source IDs and return replacement IDs, residual parts and collider overrides. Missing libraries retain the existing procedural rendering for current public APIs/tests; app loading fails clearly on a failed requested asset rather than silently claiming replacement.

## TODOs
- [x] 1. Record licensed source selection, exact source hashes, baseline behavior and style decision; finalize coverage contracts and art candidates.
- [x] 2. Prepare new animal assets and integrate species-specific placement, authored motion, grouping and tests.
- [x] 3. Prepare detailed nature/building/prop assets, reproducible manifests and semantic mappings, including seasonal and composite behavior.
- [x] 4. Integrate bounded static libraries, instancing, alpha-aware wind shadows, app lifecycle, credits, packaged assets and the complete coverage ledger.
- [x] 5. Review every new model in a real Chrome gallery and representative walking views, verify sample/actual/mobile/night/motion/map/turning, and measure transfer, texture and rendering budgets.

## Final Verification Wave
- [x] 6. Pass focused and required full tests, formatting, lint, typecheck, build and packaged smoke. Run the review-work skill's independent goal, quality, security, hands-on QA and context reviews; fix substantiated issues.
- [x] 7. Commit/push, create and merge a normal PR after CI, verify the exact main Pages deployment and public Chrome behavior, preserve the original worktree and clean up owned QA processes.

## Evidence and adversarial checks
Write `.omo/start-work/ledger.jsonl` and `.orca/tour-assets/` artifacts. Baseline pins unchanged Calendar model/source mappings and prior animal behavior before new red tests. Exercise malformed/truncated/external-URI GLBs, cancellation, stale loads, retry, disposal, dirty-worktree preservation, bounded commands and failed-check detection. Treat downloaded text as data. Re-run only failed/changed checks until final required gates. Root exclusively owns GPU/Chrome QA; agents may run isolated CPU checks. Register local servers, browser contexts and temporary QA scripts when created, and close/remove each owned resource. Public user Chrome tabs may remain open deliberately.

Manual QA uses a local HTTP server plus Playwright `chromium.launch({channel:'chrome'})`, actual DOM clicks for Enter village/Walk/Map/lighting/credits, arrow/Q/E input and minimap clicks. Capture screenshots, errors, scene identity, draw calls and motion across two frames. Use a temporary all-model gallery for front/side/back close views and remove its runner after evidence. After deploy, compare public JS/manifests/GLB SHA-256 against the merged build and open the actual-profile URL in the user's Chrome.

## Implementation verification
- Distributed inventory: 65 GLBs (24 animal species, a collection with 18 named nature models plus four extras, 36 village/prop/landmark files). Coverage: 95 authored + 31 hybrid + 114 retained = 240 IDs. Retained species, cultural and effect exceptions have explicit reasons.
- CPU preparation runs reproduce distributed files byte-for-byte; the previous eight animal files are unchanged. The sample requests 11.583 MiB; the actual profile requests 9.926 MiB. Estimated decoded textures with mipmaps use 31.98/26.65 MiB respectively.
- Chrome gallery: 81 initial targets across 243 angles plus 21 corrected targets across 63 angles, with zero console/page errors. Full-size gate/fruit side and back views were inspected. The 22 new browser tests and the full 5,241-test suite passed (352 files; coverage: 97.17% statements, 93% branches, 98.57% functions, 98.12% lines). Final art and collision corrections passed focused regression suites; CI will run the full suite again on the final commit.
- Final installed-Chrome QA passed 32 scenarios (11 P0, 17 P1, four P2), including real wall collisions, pass-through gates, mobile controls, model-load retry and 800-day stress input. Entrance draw calls at 1440/390 CSS pixels: sample 262/188, actual profile 222/159, stress 304/203. These are entrance measurements, not an all-view draw-call guarantee or a physical low-end phone benchmark.
- The final npm archive smoke passed every public adapter, including all 65 verified local model records, walking and credits. Before/after screenshots from the same public profile are included under `.github/screenshots/tour-assets/`.
- Building with the two direct dev dependencies required normal pixel regeneration because the pixel source fingerprint includes package-lock.json. All 240 rendered pixel assets and their output hashes remained identical; only the manifest source fingerprint changed.

## Independent review corrections
- Retained the original leafy bamboo thicket after rejecting an external model with cut stems and no branches/leaves. The inventory, credits and documented reason agree. Nature regressions: 114 tests passed.
- Measured actual GLB body walls for 19 closed village models and replaced inherited collision extents. Four demonstrated wall crossings are now blocked, and 76 exterior approach positions remain walkable. Code reviewer independently passed 110 focused tests and verified the original reproduction.
- Source builds, complete type/lint/format checks and generated asset checks pass after these corrections. No runtime dependency or Calendar SVG changes were required.
- CI passed all nine Playwright environments but exposed an existing annual-world SVG export test's 1-second polling assumption. The same 366-day export reproduced the deadline failure at 8x CPU speed reduction, then completed with valid data and no app error. Only this functional test now waits up to 10 seconds for completion or an explicit error, retains all data assertions, and has a 15-second outer limit. The corrected case under 8x CPU reduction and the seven existing file scenarios passed. Product code and rendering performance budgets are unchanged.

## Verified publication
- PR #39 merged normally after all 21 checks passed on `81ef4409bf5a81609c62852bbfcb216dde3ed8c5`. Final coverage run: 353 files, 5,264 tests; 97.17% statements, 92.98% branches, 98.57% functions, 98.12% lines.
- Main merge `cd291c63a4bf5089e9d6b4f4e2147b520aa17366` has the same tree as the reviewed source. Pages run `35709769083` successfully deployed this exact merge.
- All 94 public tour files checked, including all 65 GLBs, matched the local build by SHA-256. Installed Chrome passed sample and actual-profile flows at 1440 and 390 CSS pixels: models, keyboard/touch turning, square translucent corner map, teleportation, lighting, Escape and credits; no console/page/resource errors. CSS cell equality uses the browser's 1/64-pixel layout precision.
- Opened the actual profile in the user's Chrome. Removed owned local servers, browser contexts and temporary test/gallery runners; retained verification reports and images. Original checkout changes, version tags and archived worktrees remain intact.
