# Circular four-season sky island

## Outcome and scope

Add `seasonal-circle` (Four-season circle): one connected round floating island with spring, summer, autumn and winter quadrants, rivers spilling off its coast as animated sky waterfalls, and a genuine Three.js PNG preview on the owner's GitHub profile. The preview links to its exact frozen interactive world in 3D. Existing layouts, saved geometry, Classic and the lightweight SVG Action remain supported.

GitHub sanitizes executable README content, so the profile uses a real WebGL capture with an interactive link, not embedded WebGL. Sources: [GitHub Markup](https://github.com/github/markup), [README images](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#images). Local investigations and Metis review are recorded in `.orca/circular-seasons/`.

## Decisions

- A fixed radius-32 Cartesian disk uses half-integer tile centers and a shared island ID. No polar deformation of square tiles. Both all-terrain and non-water terrain must be connected.
- Seasonal quadrants contain fixed month slots and three absolute year bands (`year % 3`). Two colliding month/day slots would be at least 1,095 days apart, outside the 800-day scene limit. Full date identities and month expansion rules remain unchanged.
- Dated placements are independent of source range, count and snapshot year. Unobserved seasonal land is scenery, never invented contribution evidence. Navigation comes from `scene.days`.
- New circle-specific placement lookup and bounded shared routes preserve settlement/event contracts without duplicating rectangular monthly transport. Existing generation paths are unchanged.
- Rivers terminate at the coastline; waterfall polylines descend below the floating terrain. Reuse the renderer clock for falling streaks, droplets and mist, with frozen off/reduced-motion poses. Winter color/ice details derive from the existing hemisphere/season rules.
- Add `view=three` for intentional 3D entry; ordinary links retain map defaults and graceful fallback. Do not overload the existing `renderer` version parameter.
- Add an optional checkout-based `profile/action.yml` and `scripts/render-profile.ts`. Use the shipped local app, a token-free loopback server and headless browser. Assert actual Three/WebGL geometry, freeze the capture pose and fit at the final aspect ratio.
- Stage the exact saved world and both themed PNGs; validate all before publishing. The profile workflow commits snapshot, world and previews together. Canonical saved view is daytime; nighttime PNG changes lighting only.
- Preserve normal runtime dependencies and npm version. Manual browser inspection uses Orca. Run WebGL suites serially.

## Ownership and execution

1. Model worker: `src/world/model/**`, focused model tests. Implement fixed topology, reservations, date slots, seasonal scenery, common routes and coastline waterfalls. Validate partial/13-month/max-range inputs and replay.
2. Capture worker: `scripts/render-profile.ts`, `scripts/profile/**`, `profile/action.yml`, optional app postcard composition/exports, focused capture tests. Implement staged local real-3D capture and document its CLI contract to root.
3. Water worker: `src/world/three/geometry/water*`, optional adjacent dedicated waterfall modules, focused geometry tests. Add bounded motion/mist and seasonal treatment, with complete resource disposal.
4. Root: layout UI/map labels, 3D link integration and browser regressions, docs/changelog, generated bundles, integration QA, independent review and release.

## Acceptance evidence

- Model: unique unit grid cells/date IDs; circular silhouette; one terrain and land component; four season zones for short ranges; zero versus missing preserved; north/south; leap years and years 0001/0099/9999; 13-month rolling source and 793-day maximum expanded source; deterministic positions and asset placement when ranges expand; valid routes and document roundtrip within existing complexity/file limits.
- Compatibility: unchanged existing layout generation and frozen-document loading; original map/Classic flows; default Action packaging smoke.
- Motion/render: actual waterfall river mouth alignment and downward extent; elapsed clock changes flow; off/reduced motion stays still; camera bounds include falling water; annual performance thresholds retained.
- Capture: valid nonblank light/dark PNGs from actual Three, correct sizes, matching source digest/geometry/camera, malformed input rejected before browser, map fallback rejected, unsuccessful capture publishes no partial set, external browser requests blocked and all owned resources cleaned up.
- Browser: all four layout choices, exact date/analytics preservation, save/import/replay, 3D deep link and graceful unsupported-WebGL fallback. Orca desktop/mobile visual checks of the circular shoreline, seasonal distinction, waterfalls and both profile cards.
- Release: format/lint/typecheck, full unit/browser suite, build and package checks; five independent post-implementation reviews. Commit/push PR, passing required checks, merge main, successful Pages deployment, update profile workflow to exact merged SHA, manually run profile generation, inspect actual public PNG/world/README and matching interactive link.

## Release constraints

Do not publish a new npm version or move release tags. Do not change existing contribution semantics, increase scene limits, silently truncate source months, rebuild imported frozen geometry, or publish a map/error screenshot as a successful 3D preview.
