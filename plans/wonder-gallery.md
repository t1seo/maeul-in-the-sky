# Wonder gallery

User request: understand the project, show every Wonder sample in HTML, and open it.

## Decisions

- Add `docs/demo/catalog/wonders.html` beside the existing generated catalog.
- Read `catalog.json` at runtime so the page follows the existing generation pipeline without duplicating registry metadata or artwork.
- Reuse all four existing SVG sprites. Show all 30 Wonders, grouped as Rare 14, Epic 10, Legendary 6.
- Include Korean names, original names/IDs, categories, and accurate tier requirements. Default to miniature/light; support pixel/dark.
- Use a local HTTP server and open an Orca browser tab. Do not change existing terrain renderers or the unrelated `halfbeak/` directory.
- Include the matching `dist/demo/catalog/wonders.html` runtime copy, as required by the repository's packaged-artifact drift check.

## Review

Read-only planning review confirmed the sprite IDs, tier/category totals, HTTP requirement, and mobile/artwork-boundary verification criteria.

## Tasks

- [x] Confirm project architecture, authoritative Wonder entries, and rendering assets.
- [x] Implement the dedicated HTML gallery using the existing catalog data.
- [x] Generate the packaged HTML copy with the project build and verify all 30 entries, all four rendering combinations, mobile layout, and console errors.
- [x] Leave the finished gallery open for the user at `http://127.0.0.1:4173/catalog/wonders.html`; the page includes the complete Wonder inventory.

## Verification

Check catalog freshness, HTML/JavaScript syntax, registry equality, nonempty SVG bounds, desktop/mobile layout, mode/style controls, full-page screenshots, and the application build that packages demo assets. No new dependencies are needed.

## Evidence

- `npm run check:catalog`: passed (210 ordinary assets + 30 Wonders).
- `npm run build`: passed, including pixel freshness, type declarations, demo/world bundles, and runtime copies.
- Prettier and inline JavaScript syntax: passed; source/runtime HTML files are identical.
- Orca browser: all four art-style/lighting combinations show 30 cards with nonempty, unclipped SVGs; no console errors.
- Independent Chromium: 22/22 mobile, keyboard, links, loading failure, and JavaScript-disabled checks passed.
- All five post-implementation reviews passed after the packaged HTML copy was added.
- Screenshots and detailed results: `.orca/wonder-gallery/` (ignored local evidence).
- HTML LSP could not run because the configured Biome server is not installed; parser, build, and real-browser validation were used.
- Existing unrelated issue left unchanged: `docs/demo/catalog/README.md` still states 193 ordinary assets instead of the current 210.
