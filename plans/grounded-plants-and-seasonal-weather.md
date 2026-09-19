# Grounded plants, seasonal weather and village collection

## Objective
Fix floating grass/cattails in the animated SVG, make snow/rain/falling leaves/cherry petals visibly seasonal, and replace the height legend with collectible badges for discovered Wonders and seasonal effects. Keep SVG Day/Night default and archived 3D. User authorized the ongoing commit/push/merge/deployment workflow; visible browser work stays inside Orca.

## Decisions and ownership
- Root: plant anchoring, integration, serial browser QA, docs/generated assets, publication. Confirmed live cause: CSS transform replaces placement translate and resolves pivot against viewport. Separate outer placement from inner sway with a local zero pivot. Retain exact artwork geometry and motion/off policy.
- Weather worker: existing miniature seasonal-weather module and dedicated Node tests only. Increase visibility through larger varied shapes, more particles in the same two compound paths per kind, clearer differentiated paths/speeds. Keep five kinds, northern/southern date mapping, <=10 weather targets, overall<=50, existing water quota and off/subtle/reduced still geometry. No new setting, dependency, broad opacity flashing, or archived 3D edits.
- Collection worker: presentation panel, pure collection helper/static icons and tests. User explicitly chose collection badges. Use recognized scene.wonders deduplicated by catalog ID and actual consistencyEffects. Display unique discoveries out of the catalog, static artwork badges, undiscovered marker and separate seasonal effect tokens. Clearly scope to the displayed landscape; no lifetime inventory claim, new persistence, altered gates or random rerolls. Banner replaces old left legend in existing footprint; card uses compact footer. Keep terrain, normalization, height semantics and bottom all-history stats intact.

## Tasks and verification
1. Reproduce plants on real published profile and lock failing browser test at multiple nonzero anchors under scaled parent transform. Require fixed roots at0/750/1500/2250ms while leaves rotate; full/subtle/off/reduced preserve placement.
2. Enhance seasonal paths and add tests for dated north/south seasons, short/empty calendars, full animation and restricted still modes. Inspect actual daytime/nighttime precipitation and clipped edges in banner/card at full-year and partial windows. Same scene/data must not mutate.
3. Replace visible height legend with village collection. Test actual recognized discoveries, duplicate IDs, unknown IDs, empty/old scenes, all 30 kinds, deterministic Day/Night identity and immutable inputs. Static badges add no animation or duplicate IDs. Accessible descriptions name every discovery and distinguish seasonal earned effects from ambient weather. Update assertions targeting retired legend without weakening timeline/data/fit contracts.
4. Build and regenerate current SVG previews/presets/catalog as required; copy runtime assets after generation. Do not regenerate Classic archived bundle, archived 3D captures/goldens, frozen profile artifacts, release tags or npm version. Verify pixel sprites unchanged by static-equivalent plant wrapper; update only if checker proves byte generation legitimately changes.
5. Serial headless browser suites and Orca manual inspection. Approve current SVG static goldens after visual inspection; preserve world goldens. Type/lint/format, complete tests, structural/animation budgets, package and CI. Use five independent review roles with bounded ownership; QA owns exclusive GPU slot.
6. Commit/push PR, require full final CI, merge main, wait exact-SHA Pages deployment. Pin real t1seo profile Action to merged SHA, trigger SVG update, verify fresh data and public motion/panel. Preserve archive hashes. Cleanup owned processes and temporary debug artifacts.

## Acceptance
No plant displacement in active motion. Four requested weather types visible in their date regions; reduced/off remain still. Height legend removed from current SVG in favor of truthful collection badges, with accessible text and no overlap. Existing data/settings schemas, Classic archived renderer, pixel terrain content and 3D archive remain compatible. Final public site/profile reflect exact tested implementation.

## Metis
Initial review accepted: separate placement and local motion pivot; test active plants; weather-only clip, dates and global motion budget; preserve Classic/Pixel/archive semantics. Collection follow-up reviews the user's explicit choice. Evidence is in .orca/seasonal-fix/metis.md and metis-collection.md.
