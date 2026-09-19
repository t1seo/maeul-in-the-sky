# English interface, select spacing and activity analytics

## Scope

The user requests more space between dropdown arrows and their right border, and an English homepage. Apply this to the existing SVG demo and the Sky World explorer. Preserve the current visual style, native controls, actual contribution data, saved worlds, identifiers, URLs and all renderer behavior. User-authored names and imported content remain unchanged.

The user additionally requests an Activity menu with graphs for commits, pull requests and useful contribution data, informed by shadcn/ui and tweakcn. Compare Tremor as well, and use their metric-card, theme-color, axes, legend and tooltip patterns within the existing vanilla TypeScript/SVG stack.

## Implementation

1. Inventory built-in copy in `docs/demo/world/index.html`, `src/world/app`, and `src/world/map`; include document language, metadata, accessible labels, dates, status/error messages and export captions.
2. Translate the interface to clear English, use explicit English month/date formatting with UTC-safe calendar dates, and retain Korean architecture as a visual choice independent of interface language.
3. Style native single-select arrows consistently in `docs/demo/style.css` and `docs/demo/world/styles.css`: 16px inset and enough text padding, including compact toolbar selects. Retain native appearance in forced-colors mode.
4. Update existing assertions that reference translated copy; preserve behavior checks, fixtures containing user text, and all visual tolerances. Review and refresh only affected approved screenshots.
5. Build packaged/demo assets, run type/lint/format and relevant existing suites. Check English states, long labels, focus, dropdown selection, mobile layout, current/Classic and 2D/3D in Orca.
6. Add optional, validated monthly GitHub activity evidence to snapshots. Request at most 13 month aliases alongside the existing calendar in one authenticated server-side query. Exact UTC intervals must not overlap. Keep legacy aggregate-only snapshots valid and preserve evidence across import/export, archive, preview and world transfer. No browser credentials or inferred commit/PR counts.
7. Add an Activity menu to the world header, opening a spacious responsive dashboard. Show account, source and full imported period (independent of terrain replay), summary cards, contribution trend with daily/weekly/monthly grouping, monthly commit/PR comparison, and weekday activity. Include accessible numeric tables and unavailable/zero/missing states. A month selector filters exact recorded months; no unsupported daily slicing of monthly evidence.
8. Complete independent reviews, commit/push the branch, merge after CI, deploy Pages, and verify live assets and the actual profile world link. Regenerate the profile snapshot with the merged Action so actual commit/PR evidence is visible.

## Acceptance

- Built-in UI text on the homepage/world is English, including dialogs and errors.
- Dropdown chevrons have visible, consistent inset spacing; text does not overlap them.
- No horizontal page overflow at 390px; keyboard selection and focus remain usable.
- Source IDs, option values, imported names, dates/counts, saved-world schema and geometry are unchanged.
- Existing regression checks pass; live Pages serves the reviewed build.
- Analytics labels distinguish all contributions from contribution-attributed commits and opened pull requests. Monthly metadata never changes terrain identity or contribution counts.
- Analytics supports old and enriched snapshots, year boundaries, partial months, missing dates and zero counts; charts and accessible tables agree with their source.

## Review and evidence

Planning gap review and implementation evidence are recorded under `.orca/english-ui/`. No new dependency or localization framework is needed. The existing npm, ESLint, Prettier, Vitest and Playwright workflow remains in use. Manual browser work uses Orca only.

The Metis review identified CSS shorthand overrides, copy-sensitive visual tests, UTC year boundaries and snapshot transforms that discard unknown metadata. These are explicit implementation/verification responsibilities. Primary-source chart and GitHub findings are recorded in `plans/activity-analytics-research-2026-09-19.md`.
