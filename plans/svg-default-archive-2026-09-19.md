# Animated SVG as the default

## Outcome
Restore the current animated diagonal SVG landscape as the main product and profile output. Offer day/night preview and automatic/day/night README appearance. Preserve the 3D islands, captures and tooling as explicitly archived experiments. Publish the site and actual profile updates.

## Constraints
- Keep current SVG artwork, full/subtle/off motion, Classic, contribution records, settings schemas and existing saved worlds.
- No new GIF/video pipeline, model changes, dependency changes, npm version or release tags.
- Keep Activity useful directly in the SVG studio; it must not navigate into an archived 3D experience.
- Use Orca for manual browser work and supervised workers. Keep local GPU tests serial.
- Preserve published world URLs with frozen compatibility artifacts when creating the dated profile archive.

## Execution
1. **Root: SVG presentation and README appearance.** Edit `docs/demo/index.html`, related scoped CSS, `src/demo/setup.ts` and `setup-panel.ts`. Promote the SVG studio, name preview choices Night/Day, keep URL restoration, and add automatic/light/dark README export selection. Default exports retain automatic theme switching. Escape all generated attributes.
2. **Analytics worker: source-only chart integration.** Change `src/world/analytics/index.ts` to consume a snapshot getter, adapt `src/world/app/app.ts` and its test, add `src/demo/analytics.ts`, and wire the main Activity control through `src/demo/world-bridge.ts`. Root supplies the existing analytics dialog markup and scoped stylesheet. Preserve archived world snapshot transfer and errors. The SVG bundle must not import Three, world construction or world storage.
3. **Root: archive surfaces and docs.** Move `#explore-world` into a collapsed Archive section. Mark `docs/demo/world/index.html` and world/profile documentation as archived while keeping routes and implementations usable. Update English/Korean README primary links, feature descriptions and CHANGELOG. Keep archived capture tooling opt-in; normal profile workflow generates SVG only.
4. **Root: profile preparation.** In `.orca/asset-overhaul/profile-repo`, save the current world, themed PNGs, README and workflow in a dated `archive/sky-world-2026-09-19/` folder. Preserve root copies of old public world/capture URLs as frozen compatibility files. Replace the active README with themed SVG and direct Day/Night choices, archive link secondary. Remove active profile capture step and pin the SVG Action to the eventual merged SHA.
5. **Root and independent reviewers: verification.** Test README escaping and auto/fixed output, preview day/night reload and history, live snapshot analytics/filter/table/close behavior, no Three load on default entry, collapsed archive navigation, old world and Classic functionality. Run typecheck/lint/format, build and package checks, targeted unit/browser tests, five independent reviews, and complete PR CI. Inspect desktop/mobile and actual profile in Orca.
6. **Root: release.** Commit/push feature branch, merge only with passing checks, verify Pages for the exact merge. Push the profile archive/README/workflow together, run the SVG-only workflow, verify generated dark/light SVG and preserved archive data, and leave the SVG view visible in Orca.

## Acceptance scenarios
- Fresh home loads a banner SVG with current artwork and full motion unless reduced motion is requested; no Three canvas/network request. Night/Day changes shading without changing counts, survives reload and browser back.
- README Automatic exports both sources; fixed Day/Night exports the selected SVG without a theme override. Copy/download and live preview agree, including escaped repository/title input.
- Activity opens on the SVG route with the exact current sample/imported snapshot. Changed imports refresh account/totals; missing monthly breakdowns remain unavailable, never fabricated. Filters, table, close and keyboard behavior stay usable.
- 3D is reached only through the archive affordance. Existing /world links, all layouts and frozen world files continue to work with an archived notice and a clear SVG return link.
- Actual profile defaults to SVG, offers Day/Night, and has no scheduled 3D capture. Dated archived assets match their pre-change hashes and old public world files remain valid. No synthetic data replaces the user's history.

## Review input
Metis completed Orca task `task_f5457a5f6151`; report: `.orca/svg-default/metis.md`. Incorporated: pass the stable source snapshot getter to analytics (not the settings clone), refresh an open dialog after data changes, override the SVG dialog width and surface token, retain frozen root profile URLs, and keep actual profile SVG paths on `main` separate from exported setup's `output` branch. Analytics worker also owns the minimal `main.ts` wiring and the old demo-to-world analytics E2E expectation. Root retains ownership of corrections and publication under the user's existing authorization.
