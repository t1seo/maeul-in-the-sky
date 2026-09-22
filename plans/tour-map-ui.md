# Tour map and compass

Improve the existing tour overlay; preserve Calendar, archived experiments, source dates, placements, navigation, English defaults and all release tags.

## Decisions

- A north-up map and compass: fixed N, an arrow showing the camera's viewing direction, and a readable cardinal bearing. Refresh through the existing navigation callback, including when the map is closed.
- One uniform map scale with centered letterboxing, reversible pointer coordinates and no CSS stretching. Empty letterbox space does not teleport. Preserve full calendar bounds, including short and long histories.
- A compact frosted map at bottom right with a left/right dock control. Apply translucency only to the background, keeping tiles and labels opaque. Retain map keyboard travel and safe-ground teleportation.
- Responsive spacing above the main toolbar; small/short screens show only one contextual panel at a time. Release held walking input before hiding the pad. Keep controls reachable, touch targets at least 44px and close-button focus restoration.
- Use Chrome for actual visual and interaction QA. Do not overlap GPU test processes. Reuse the current Pages URL; no npm release or version change.

## Work and acceptance

- [x] Capture original runtime defect and failing regression tests (uniform cells, live compass).
- [x] Implement map projection, bearing, translucent corner layout and panel interactions.
- [x] Verify real Chrome: 1440×900, 1024×768, 390×844, 320×568, 844×390, 667×375; both docks, day/night, walking, pointer and keyboard travel, help/details, no overlap or console errors.
- [x] Pass unit/browser tests, type checking, lint, formatting and reproducible build. Preserve source identity and archive assets.
- [x] Complete independent goal, code, security, context and hands-on QA reviews.
- [ ] Publish through a focused PR and required CI, verify Pages and the existing actual-snapshot tour, leave Chrome open for the user.

## Design reference

[Sweatpals map navigation](https://mobbin.com/screens/9b710af5-456b-4ee9-9b83-605ebace769f): compact corner controls and a clear floating-panel hierarchy. Retain this project's existing typeface and woodland colors.

## Investigation

Three hypotheses checked independently: compass lacks a heading binding; camera heading itself is stale or reversed; built CSS/bundle differs from source. Source shows a fixed -27° compass transform and no heading update. The map has two sources of distortion: different X/Z projection scales and a CSS height unrelated to its backing dimensions. Runtime and regression evidence will establish the fix.

Evidence and disposable QA assets: `.orca/tour-map/`. Owned QA server: port 4330. Close owned browser/server and remove scripts/journal after verification; preserve screenshots and test receipts.

## Evidence collected

- Real installed Chrome reproduced static -27° compass during camera rotation and 4.55×9.86px rectangular cells. Regression tests failed before the fix: two unit and two browser assertions.
- After the fix, focused unit tests: 1,341 passed. Real-browser tour suite: 17 passed. Type check, changed-file lint and full production build passed.
- Initial actual-snapshot Chrome sweep passed at six viewport sizes and both docks; measured square cells, identical map/compass headings, stationary turning, keyboard travel and restored close-button focus. Visual review found a short-screen clipping issue and code review found closed-map pad overlap; both were corrected before the final independent sweep.
- Source changes remain limited to the tour overlay. Original checkout diff hash remains `b9c3993d2040604755ae522b8095224a1e46007560b62a6a3ef9b3679a9d24c0`; archived worktree and v1/v2 tags are unchanged.
- Final Chrome QA: 38 scenarios passed, no page/console errors. Verified 7-day and 800-day maps, DPR 2, actual touch, compass during orbit/guided/walking modes, both corner layouts and contextual-panel transitions. Introduction yields space on constrained screens, and compass yields space to Help/Details then returns live.
- Final checks: full lint/type/format pass, changed browser regressions including retry pass, and all 9 Playwright tour cases pass across desktop, mobile and reduced motion (2.5 minutes). The production docs/dist tour trees are identical.
- The first PR run passed 4,770 coverage tests and eight browser projects. Its combined desktop walking/map scenario exhausted the 45-second total budget: trace shows map focus starting at 46,694ms after successful layout assertions. Split the two long scenarios into four independent user flows, preserving every action/assertion and the existing timeout/project matrix; production code is unchanged. Independent review passed the test-only adjustment.
