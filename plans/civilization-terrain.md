# Civilization-like landscape, alongside the existing calendar

## Objective and authorization

Implement the user's requested new geographic village mode in the dedicated branch `t1seo/civilization-terrain` and worktree `civilization-terrain/`. Keep the established calendar rendering usable and the default. Reuse the improved 210 ordinary assets and 30 Wonders while creating substantially better terrain, coast, roads, fields, and settlement composition. Produce actual standalone GitHub README SVG/PNG through the public API, CLI, Action, and studio; open a working preview.

The user explicitly requested execution through a worktree/workflow loop. Planning, implementation, testing, browser inspection, and correction are authorized. The original implementation scope was local; the follow-up request explicitly authorizes committing and pushing this feature branch and deploying its demo to GitHub Pages. Keep the original `main` checkout and its uncommitted gallery and terrain experiment unchanged, and do not merge the feature branch into `main`.

## Decisions

- Add `terrainMode?: 'calendar' | 'landscape'` and `landscapeLayout?: 'island' | 'archipelago' | 'valley'`. Existing `layout`, `preset`, and archived `renderer` keep their meanings.
- Canonical calendar settings omit both new fields, including explicit calendar overrides. Old settings and scene JSON hashes therefore remain unchanged. Landscape settings serialize both fields.
- Pure geography and settlement modules live in `src/themes/terrain/landscape/`. Browser DOM code never enters a production rendering import graph.
- Extend `TerrainScene` with optional serializable `geography` payload with its own `version: 1`. All actual cells, placements, Wonders, rewards, paths, and bounds use the new projected positions; metadata describes what is drawn. Full Scene JSON, not metadata alone, is the replay contract.
- Reuse the existing preparation pipeline for validated counts, normalization, daily reward facts, and earned Wonder facts. Geography does not award the demo's three forced showcase Wonders. Empty and observed-zero inputs earn none.
- Build terrain before drainage: angular connected ridges behind broad settlement plains, asymmetric bays, beaches and rocky shores, meadow/forest/wetland/dry/snow regions. Derive drainage and moisture from the final mesh; never flatten it after drainage.
- Date anchors use absolute dates and the fixed geography seed, independent of counts, density, input order, and rolling-window membership. Continuous positions inside land triangles avoid a finite vertex-slot limit and preserve the existing input size contract.
- Towns contain a plaza, roads and lanes, house parcels, farm fields, and peripheral hamlets. Roads stay in their connected land component; river crossings have explicit bridge geometry. Trees form clusters with some canopy overlap, while building and Wonder fronts stay readable.
- Normalize reused sprite sizes by their real bounds. New SVG primitives supply landform detail, farm plots, squares, paths, retaining edges, river banks, and bridges.
- Honor miniature/pixel, day/night, density, hemisphere, motion including off/reduced motion, and banner/card. Centralize default output dimensions so live preview, downloaded SVG, CLI PNG, archive, and local preview agree.
- The archived Classic renderer remains calendar-only and is safely normalized on selection/import/URL use. Landscape workflow exports reference this branch with an explicit pre-publication note; existing calendar exports keep their established references.
- Retain the existing npm/tsx, TypeScript, ESLint, Prettier, Vitest, and Playwright toolchain. No new runtime packages are required. New modules target at most 250 implementation lines.

## Planning review incorporated

Read-only architecture, artwork, test audits, and independent Metis-style review identified the JSON hash compatibility hazard, 20,000-day input boundary, rolling-date stability, drainage ordering, archived renderer schema, real earned Wonders, normalized sprite sizes, actual scene coordinates, namespace collisions, production option forwarding, dimensions, and branch workflow availability. These are acceptance criteria below, not deferred assumptions.

## Workflow and ownership

The loop for each task is: baseline characterization where existing behavior changes → failing new behavior → implementation → focused checks → actual CLI/browser/PNG use → inspect evidence → fix and rerun the failing scenario. The durable state is `.omo/boulder.json`; evidence and receipts are recorded in `.omo/start-work/ledger.jsonl`. Final visual acceptance includes full landscapes at README width and close views of a village, ridge, and river crossing.

| Task | Owner responsibility | Dependencies |
| --- | --- | --- |
| 1 | settings, schema, CLI/Action, shared dimensions | fixed names |
| 2 | geography model and sampling | shared types |
| 3 | settlement/roads/fields/scenery planning | shared types; execute against 2 |
| 4 | landscape SVG art and projection | shared types; execute against 2,3 |
| 5 | public scene preparation/render/metadata integration | 1,2,3,4 |
| 6 | studio controls, import/share/export, documentation | 1,5 |
| 7 | build artifacts, integration/visual review and correction | all |

Independent implementation streams share this one worktree and have exclusive file ownership. They must not revert another worker's changes. Integration dependencies are named; conceptual model, settlement, rendering, and boundary work can proceed from the fixed contracts in parallel.

## TODOs

- [x] 1. Add nonbreaking settings and production adapter inputs.
  References: `src/core/render-options.ts`, `src/core/settings/{schema,resolve}.ts`, `src/core/types.ts`, `src/generate/{types,options,input}.ts`, `src/generate.ts`, `src/cli/{program,action}.ts`, `action.yml`, `src/archive/comparison.ts`, `src/preview/data.ts`.
  Acceptance: absent or explicit calendar has identical old normalized settings; landscape survives settings/snapshot/archive roundtrip and explicit precedence; invalid enum rejected; actual CLI and Action forward both options. A shared display-size helper retains old dimensions and chooses readable landscape dimensions.
  QA: parse old and new fixture JSON; exercise invalid mode; invoke actual CLI/Action with a local partial snapshot; record requested mode and generated artifact. Evidence `.orca/civilization/settings-*`.

- [x] 2. Build the geographic foundation.
  References: `src/terrain-lab/{heightfield,mesh,hydrology,placement,model}.ts`, `plans/natural-terrain-research-2026-09-21.ko.md`.
  Acceptance: continuous clipped land, coherent elevated ridges, usable plains, multiple distinguishable biomes, component-aware land graph, downhill rivers reaching the sea, actual triangle interpolation, finite geometry. All observed dates/counts survive and overlapping dates retain positions across rolling ranges/count changes. Large input uses continuous coordinates without dropping dates.
  QA: island/archipelago/valley with several seeds, zero/partial/leap/large fixtures; inspect mountain and coast images. Evidence `.orca/civilization/geography-*`.

- [x] 3. Plan coherent settlements and countryside.
  References: `src/themes/terrain/assets/{catalog,bounds,rendering}.ts`, `src/themes/terrain/epics/{bounds,rendering}.ts`, `src/themes/terrain/scene/{prepare,wonders,rewards}.ts`.
  Acceptance: visible clustered village around plazas, roads, peripheral farms, forest clusters; grounded footprints and routes; no roads crossing sea; real Wonders/rewards retained without invented earned content; asset scaling accounts for bounds and culture. Terrain geometry is immutable after drainage.
  QA: sample/classic/Korean, density endpoints, observed-zero and Wonder-rich fixtures; verify placement metadata and footprint/route invariants, inspect village/fields/bridge close-ups. Evidence `.orca/civilization/settlement-*`.

- [x] 4. Render polished standalone landscapes.
  References: `src/terrain-lab/{projection,surface,render}.ts`, catalog rendering modules, `src/core/{svg,animation}.ts`.
  Acceptance: new terrain art, varied coast edges, clear mountain silhouettes, water depth/banks, paths, farmland and plazas; true existing sprites in sensible scale; readable at 600–840px; coherent painter ordering with visible building bases; isolated namespaced SVG with no external scripts/resources; both art styles and lighting/motion modes handled.
  QA: render three forms in both modes, parse XML, rasterize with real Resvg, open standalone SVG as an img, inspect screenshots at README width and focused crops. Evidence `.orca/civilization/render-*`.

- [x] 5. Integrate public scene APIs and truthful metadata.
  References: `src/core/scene-types.ts`, `src/themes/terrain/scene/{prepare,render,metadata}.ts`, `src/themes/terrain/index.ts`.
  Acceptance: default legacy SVG hashes unchanged for partial/zero/Wonder fixtures; landscape prepare/render works; serialized Scene replays identical SVG; cells, sprites, earned Wonder facts, rewards, paths, and bounds match actual new positions/scales; empty inputs render valid artwork and no unearned rewards; dark/light namespaces independent.
  QA: old SHA fixtures, public API replay, partial/leap/empty/no-days, actual SVG+PNG generation. Evidence `.orca/civilization/integration-*`.

- [x] 6. Expose both methods in the existing studio and explain use.
  References: `src/demo/{settings,state,preview,setup,renderer-version,version-selector,date-navigation,explorer,archive-view,scene-downloads}.ts`, `docs/demo/index.html`, `docs/README.ko.md`.
  Acceptance: visible calendar/landscape and three-form selectors; default calendar; new mode works with real snapshot imports, share URLs, date inspection, dark/light, SVG/PNG/config downloads; Classic fallback is clear and safe; landscape workflow names branch and publication prerequisite honestly. Original prototype/gallery remain available.
  QA: actual Playwright import→mode→save→reload→download flow, Classic transitions, 390/320 mobile, keyboard/date targets, failed input feedback, no console or resource failures. Evidence `.orca/civilization/studio-*`.

- [x] 7. Complete compatibility, quality and delivery loop.
  References: `.github/workflows/{ci,pages}.yml`, `scripts/{build-demo,build-terrain-lab,package-runtime-assets,smoke-package}.ts`, existing test configs.
  Acceptance: typecheck/lint/format/build and relevant automated/browser/adapter checks pass; old output hashes preserved; generated docs/dist consistent; old/new same-data comparison and detailed crops visibly satisfy the requested richer geography and town composition; temporary QA resources cleaned. Keep only the requested visible preview server/tab alive for the user.
  QA: final five-way review (goal, code, defensive security, hands-on QA, project context), inspect all blocker fixes, verify original main remains untouched, open worktree studio URL. Evidence `.orca/civilization/final-*` and ledger.

## Final verification

- [x] F1. Goal and plan compliance approved.
- [x] F2. Code and compatibility approved.
- [x] F3. Actual browser/CLI/PNG use and visual quality approved.
- [x] F4. Security/context/scope review approved; worktree and evidence ready for handoff.

## Delivery

Report actual branch/worktree, local demo URL, how to select the new mode, SVG/PNG/Action readiness, verification results, and material limitations. Keep the feature in its separate branch; do not imply a locally referenced Action branch is already published on GitHub.

## Authorized public deployment

- Commit and push the verified feature branch with its built runtime files; exclude local execution state and QA evidence.
- Keep the existing `main` environment rule and add only `t1seo/civilization-terrain` as an allowed Pages deployment branch.
- Dispatch `pages.yml` from the feature branch, including landscape sample generation and artifact checks.
- Verify the successful GitHub deployment, public sample images, all three landform controls, studio rendering and the preserved calendar mode. Open the public demo in Orca and record the run URL locally.
