# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Four-season circle** — one connected round sky island groups absolute contribution dates into spring, summer, autumn and winter quadrants, with stable positions across rolling ranges and scenery for unrecorded seasons
- **Sky waterfalls** — coastal rivers fall below the floating island with flowing streaks, droplets, mist and seasonal frost, using the existing motion and reduced-motion controls
- **3D profile previews** — an optional composite Action captures the actual Three.js world into light/dark PNGs alongside its matching saved world, with validated publication and portable path collision protection; explicit `view=three` links open the same interactive landscape with map fallback when needed
- **Activity dashboard** — contribution trends, monthly commit/PR comparisons, weekday totals, exact data tables, period filters and keyboard-accessible chart values are available from both demo menus
- **Recorded monthly activity** — GitHub fetching now preserves optional monthly commit, PR, issue, review, repository and restricted contribution counts through snapshots, archives and saved worlds; older files clearly show unavailable breakdowns
- **Selectable classic renderer** — preserve the exact pre-world browser renderer with provenance and integrity checks; switch versions with the same contribution history, share the selection, export with the selected engine, and generate a profile workflow pinned to the original commit
- **Living seasons and surfaces** — seasonal petals, butterflies, precipitation and flowing-water motion accompany richer ground and shoreline detail in the explorer and profile SVG
- **Sky world explorer** — a separate island map and lazy-loaded Three.js view add monthly archipelagos, one connected annual island and four seasonal islands, nature-led districts, route-following life, date replay, discoveries and seasonal photo controls
- **Portable worlds and visits** — versioned world documents preserve generated geometry and camera state; browser collections, public world links, GitHub repository districts and release memorials connect exploration to actual source data
- **World keepsakes** — standalone SVG and PNG captures and genuine GLB model export complement the existing profile images
- **Premium atmosphere** — shaped, shaded clouds, a cratered crescent moon and a layered sun replace the earlier simple sky artwork in profile SVGs

- **Nature scenery expansion** — eight shared nature IDs with three geometric variants each add cedar groves, ancient oaks, wildflower meadows, bamboo thickets, lotus ponds, reed marshes, alpine rocks and willow ponds
- **Consistency effects** — 5, 12 and 20 active days in a trailing 28-day calendar window earn increasingly detailed seasonal effects, with observed-day metadata, a 10-group cap and static reduced-motion fallback

- **Independent art styles** — `miniature` and compiled SVG `pixel` artwork are available across the scene API, CLI, Action, demo, sharing, imports, exports, and catalog; existing settings default to miniature
- **Korean countryside expansion** — nine new assets add thatched homes, village guardians, rice terraces, a watermill, a hanok gate, a kimchi garden, a stone bridge, and a hanok estate
- **Daily contribution rewards** — raw daily contribution thresholds at 0, 1, 5, 10, 25, and 50 guarantee a primary asset or Wonder plus a tier marker on positive dates, independently of height normalization and decoration density; zero dates receive no activity reward
- **Art generation checks** — all 240 catalog IDs have compiled pixel artwork, with source/output drift checks in builds and CI and reproducible visual comparisons in the release report
- **Portable scene API** — browser-safe rendering now prepares one deterministic scene and shades matching dark/light SVGs with structured date, normalization, asset, and Wonder metadata
- **Versioned settings and snapshots** — schema-versioned JSON import/export supports reproducible offline rendering, strict validation, bounded imports, and source provenance
- **Multi-year archives** — CLI, Action, and JavaScript APIs compare two to five annual snapshots with a shared or explicit fixed height scale and stacked comparison SVGs
- **Card layout and static PNG** — banner/card outputs, static dark/light PNG generation, and scale controls are available across supported adapters
- **Motion modes** — `full`, `subtle`, and `off` policies share a complete reduced-motion fallback, with PNG always rendered from a motion-free scene
- **Browser explorer and setup wizard** — the enhanced demo supports snapshot/archive import, per-date details, zoom, saved annual data, comparisons, workflow/README downloads, and a Wonder encyclopedia
- **Authenticated local preview** — `maeul-sky preview` binds to loopback and fetches actual account data with `GITHUB_TOKEN` kept only in the server environment
- **Korean village style** — 13 catalog assets, including the four originals (`hanok`, `pavilion`, `stoneWall`, and `onggi`), and truthful neighborhood paths complement the classic style
- **Generated asset catalog** — a searchable, filterable gallery and registry-driven dark/light SVG and PNG sheets document 210 ordinary IDs (197 classic and 13 Korean) separately from 30 Wonders, with both art styles and regeneration checks
- **Village presets** — Nature, Balanced, and Civilization provide decoration-mix choices across the Action, CLI, and JavaScript API
- **Repository-owner targeting** — the Action accepts an explicit `username` and otherwise uses the repository owner, including scheduled runs
- **Terrain insight bar** — generated SVGs now show their covered dates, active days, busiest month, and discovered Wonder count
- **Accessible SVG output** — generated Terrain includes an accessible name and description plus reduced-motion behavior
- **Interactive preset demo** — a responsive GitHub Pages demo compares all presets in dark and light modes using real renderer output
- **Community health files** — contribution, security, support, conduct, issue, pull-request, and showcase guidance
- **npm package published** — `maeul-in-the-sky` is now available on [npm](https://www.npmjs.com/package/maeul-in-the-sky)
- **npm badges** — version and download count badges added to all READMEs (EN, KO, JA, ZH)
- **CD workflow** — automatic npm publish via GitHub Actions on tag push (`v*`)
- **Deep Terrain Generation module** — one programmatic interface now validates input, fetches contribution data, renders both modes, creates output directories, and writes SVG files
- **Package smoke gate** — CI installs and executes the packed CLI, ESM library, CJS library, and GitHub Action artifact before release
- **Contribution Calendar context** — canonical project language and date-based calendar normalization for partial and 53-week ranges

### Changed

- **Shared SVG artwork** — static ordinary artwork is defined once and reused across placements and motion branches, preserving dated hit targets and reducing exported SVG size
- **Readable height legend** — neutral gray bars share a baseline and rise with contribution height; season colors no longer imply contribution levels
- **Calendar-aligned rewards** — dated primary assets and consistency effects follow calendar seasons and hemisphere, avoiding premature next-season choices during terrain color transitions
- **Sailboat silhouettes** — three distinct sail plans replace the previously identical sailboat variants, with unchanged catalog bounds
- **Nature-led composition** — varied natural rewards at every daily tier, sparse buildings and boats, culture-mapped candidate deduplication and absolute-date spatial variation replace repeated sailboat and estate rows
- **Layout version 3** — newly prepared scenes use new deterministic selection seeds; previously prepared version-1 and version-2 scenes remain renderable

- **Complete artwork redesign** — all 223 existing asset IDs retain their identity with rebuilt silhouettes, materials, lighting, and details; spring flowers, summer foliage, autumn harvests, and winter snow distinguish the four seasons while preserving wood, animal, and evergreen colors
- **Layout version 2** — date-based primary rewards and bounded surrounding decorations use a new declared layout identity; legacy settings and prepared scenes remain accepted, but regenerating a scene can change its arrangement
- **Decoration density** — density now adjusts surrounding decoration choices within available space and growth stages; it does not lower a daily reward tier or change its guaranteed primary asset
- **Renderer cost baseline** — increased art detail and daily rewards require a documented new feature baseline after simplification; prior/current size and timing measurements remain public, and future +5% size, +20% median, and +30% p95 regression limits are unchanged
- **Current-source setup** — new-feature workflow examples use the main Action bundle; npm 1.4.0 and the existing v1 tag do not include these unreleased features
- **Contribution calendar rendering** — supplied UTC dates now determine Sunday-based positions, including partial weeks, gaps, leap days, and ranges longer than 53 weeks without inventing missing dates
- **Deterministic layout identity** — versioned date-based seeds keep dark/light scene geometry aligned and allow an explicit `layoutSeed` override, with documented stability limits around neighbors, normalization, and Wonder budgets
- **Output adapters** — CLI and Action accept settings/snapshot input, layout, style, normalization, archive, PNG, and snapshot-output controls while preserving the default two-SVG workflow
- **Asset architecture** — the compatibility facades now expose typed, modular renderer catalogs containing 210 ordinary IDs and 30 separately counted Wonders
- **Generated documentation assets** — README previews, six demo presets, examples, cases, and catalog sheets now declare their seeded synthetic source and exact supplied range
- **Project documentation** — added a task-based quick start, accurate rolling-range defaults, CLI and API examples, privacy notes, troubleshooting, presets, and Epic Wonders across all supported languages
- **Package metadata** — now describes the village experience and includes Action and profile README discovery terms
- **CLI and Action adapters** — both now delegate shared behavior to the Terrain Generation module
- **Theme registration** — built-in Terrain registration is explicit and no longer depends on import side effects
- **Quality scope** — scripts are covered by lint, formatting, and TypeScript checks
- **Dependencies** — updated the test and Action toolchains; `npm audit` now reports zero vulnerabilities

### Fixed

- **Explorer language and controls** — the homepage and world interface use English labels and UTC date formatting, while shared native dropdowns have consistent inset arrows and readable text spacing
- **Explicit input boundaries** — restrict palette caches to supported color modes, retain canonical containment for preview assets, and pin browser-test proxy requests to the local QA server

- Preserve eligible lower-tier Wonder draws when an upper-tier draw fails, retain the daily reward marker at Wonder positions, and keep animated portal geometry within its declared bounds.

- Restrict local archive CSS rules to their annual row so generic selectors resolve the correct year’s paint server; preserve selector specificity and document the existing imported/global CSS boundary.

- Preserve wildcard, partial-match, and case-flag CSS attribute selectors when archive references are namespaced; reject indistinguishable selector-value collisions before writing output.

- **Custom Theme archive composition** — parse CSS and XML to support standalone documents, namespace prefixes and escaped/Unicode references while preserving independent annual rows; invalid input fails before archive output is written
- **Zoom positioning** — opening/resetting the explorer centers visible Terrain, and button/keyboard zoom preserves the viewport focal point

- **Archive replay and comparison** — preserve unselected stored snapshots, retain the selected user's identity across browser reloads, and compose custom-theme SVGs independently of XML quote and whitespace style
- **Input compatibility** — accept `style` and `villageStyle` across public inputs, preserve canonical v1 settings, honor explicit CLI tokens, infer Action input identities, and validate Action snapshot booleans
- **Calendar and scale boundaries** — absolute-date seasons support years 1–9999, fractional scale labels remain accurate, and SVG legends explain terrain heights with date-derived calendar cues
- **Generated workflow permissions** — village generation uses read-only permissions and a separate dependent publication job receives write access
- **XML text validity** — reject forbidden XML scalars before SVG/PNG generation while preserving valid Unicode and escaped text
- **Static output semantics** — motion-free SVG and PNG retain complete terrain, water, effects, and accessibility content without CSS keyframes or SMIL animation
- **Snapshot trust boundary** — imported statistics are recomputed from validated dates/counts, and malformed, duplicate, oversized, or unsupported-version data fails without replacing saved browser state
- **Local preview privacy** — browser forms, links, storage, responses, and logs no longer carry the GitHub token; upstream failures are sanitized at the loopback boundary
- **npm publish warnings** — corrected bin path and repository URL format in package.json
- **Packaged CLI startup** — removed the duplicate shebang and sourced the CLI version from package metadata
- **Contribution weekdays and streaks** — statistics now use calendar dates and break streaks across missing dates
- **53-week terrain** — seasonal palettes and biomes now cover every returned calendar week
- **Package metadata** — repository, homepage, and issue links now point to `t1seo/maeul-in-the-sky`

## [1.4.0] - 2026-02-19

### Added

- **Epic Wonders** — 30 Civilization-style rare landmarks (14 Rare, 10 Epic, 6 Legendary) that appear on high-activity cells. 70% natural wonders (Mount Fuji, giant sequoia, coral reef, aurora, glacier peak, etc.) and 30% iconic structures (Colosseum, Taj Mahal, Eiffel Tower, etc.). Uses a 3-gate system (cell level, neighborhood richness, global stats) with anti-clustering and budget caps. Includes gold/purple/cyan glow effects and animated wonders (windmill, world tree, ancient portal).

## [1.3.0] - 2026-02-19

### Added

- **Density parameter** (`density`, 1-10, default 5) — controls when buildings appear in the terrain. Higher values make buildings show up at lower activity levels, useful when commit patterns are uneven or sparse.

### Fixed

- **Security audit** — upgraded eslint to v10 and added npm override for minimatch ReDoS vulnerability (high severity)

## [1.2.0] - 2026-02-05

### Added

- **Detailed livestock assets** — sheep, cow, horse, chicken, donkey, and goat with recognizable body shapes and features
- **Enhanced basic assets** — improved rock, bush, fence, barrel, well, pine, and deciduous tree SVGs with better detail
- **New palette colors** — added shadow, bushDark, leafLight, and flowerAlt for richer terrain rendering

### Changed

- **Natural autumn colors** — adjusted autumn tint from heavy red to balanced yellow-gold mix (colorShift 0.12, warmth 15)
- **Smoother season transitions** — extended transition zones for gradual seasonal gradients
- **Relaxed asset generation** — increased spawn chances by ~30% and raised animation budgets for livelier terrain
- **README previews** — "More Previews" section now always visible instead of collapsible

### Fixed

- **Christmas tree SVG bug** — removed duplicate `points` attribute that caused SVG parsing errors in some browsers

## [1.1.0] - 2026-02-05

### Changed

- **Renamed to Maeul in the Sky** (천공의 마을) — package `maeul-in-the-sky`, CLI `maeul-sky`, SVG output `maeul-in-the-sky-{dark,light}.svg`.
- **Larger terrain tiles** — THW 7→8, THH 3→3.5, origin shifted left. ~14% bigger terrain with less empty space on the left.
- **Preview assets** — replaced GIFs with generated SVGs using rich sample data.
- **Level distribution** — switched from log curve to sqrt curve with P90 normalization. Moderate activity now reaches village/city levels instead of being compressed by outlier days.
- **README** — added "How Does the Terrain Work?" section explaining terrain mechanics with examples. Removed CLI and Development sections (not intended for local use).
- **Customization examples** — added hemisphere, custom title, and specific year examples to README.
- **Multilingual docs** — added Japanese (日本語) and Chinese (中文) READMEs with language badges across all versions.
- **GitHub Marketplace** — published as a GitHub Action on the Marketplace.

## [1.0.1] - 2026-02-05

### Changed

- **Calendar-aligned rolling seasons** — seasons now match actual calendar months instead of using a fixed week-51 = winter mapping. A rotation offset is computed from the oldest contribution week's date relative to December 1, so the terrain always shows the correct season regardless of when data starts.
- **Season API signature** — all season functions (`getSeasonZone`, `getTransitionBlend`, `getSeasonalTint`, `getSeasonalPoolOverrides`) now accept a numeric `rotation` parameter instead of `hemisphere` string. Hemisphere is folded into the rotation via `computeSeasonRotation()`.
- **Preview GIFs** — regenerated at 2x resolution (1680×480) with calendar-aligned seasons.

## [1.0.0] - 2026-02-04

### Added

- **Isometric terrain theme** with 100-level elevation system mapped to GitHub contribution data
- **4-season cycle** (Winter, Spring, Summer, Autumn) with 8 transition zones and smooth color tinting
- **48 seasonal assets in the v1.0.0 registry** — snowmen, cherry blossoms, sunflowers, autumn maples, and more
- **118 terrain asset types in the v1.0.0 registry** — trees, buildings, windmills, scarecrows, flags, benches, and more
- **Biome generation** — procedural rivers, ponds, and forest clusters via seeded simplex noise
- **Animated SVG effects** — drifting clouds (SMIL), water shimmer, town sparkle, flag wave (CSS)
- **Celestial bodies** — stars and crescent moon (dark mode), sun with rays (light mode)
- **Seasonal particles** — falling snow, cherry blossom petals, autumn leaves
- **Dark & Light mode** — generates both variants with theme-aware palettes
- **Hemisphere support** — northern and southern hemisphere seasonal mapping
- **Right-aligned terrain** — grid positioned like GitHub's 3D contribution view
- **Season direction** — rightmost (most recent) weeks display current season
- **GitHub Action** — drop-in workflow with configurable inputs (theme, year, hemisphere, title)
- **CLI** — `maeul-sky -u <username>` with full option support
- **Stats bar** — total contributions, current streak, longest streak, most active day
- **Water system** — two-tone water overlays, ripple lines, river shimmer animations
- **Contribution statistics** — streak calculation, day-of-week analysis

[1.4.0]: https://github.com/t1seo/maeul-in-the-sky/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/t1seo/maeul-in-the-sky/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/t1seo/maeul-in-the-sky/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/t1seo/maeul-in-the-sky/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/t1seo/maeul-in-the-sky/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/t1seo/maeul-in-the-sky/releases/tag/v1.0.0
