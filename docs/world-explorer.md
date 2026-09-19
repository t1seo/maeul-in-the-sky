# Sky world explorer

[Open the explorer](https://t1seo.github.io/maeul-in-the-sky/world/) · [한국어 안내](world-explorer.ko.md)

Your contribution dates become places in a floating miniature world. Start from the sample, import a snapshot/archive, or choose **Explore your world** in the original demo to carry the currently displayed history into the explorer.

## Choose a rendering version

The explorer’s version selector opens the same source snapshot in the current SVG demo or the **Classic** pre-upgrade renderer. [Open Classic directly](https://t1seo.github.io/maeul-in-the-sky/?renderer=classic). The SVG demo keeps its selection in the share URL and uses that renderer for previews and image exports.

Classic preserves the browser bundle from commit `05a10eff07575acf2c81adcd66a66bc501507217`; it is separate from the `classic` architectural culture setting. Its generated GitHub workflow pins that exact commit, while the current workflow follows `main`. Snapshot JSON remains a portable record of data and settings; it does not pin a renderer. For a reproducible profile design, keep the generated workflow’s commit pin.

## Explore and replay

- Choose a monthly archipelago, one large connected island, or four seasonal islands. The large island joins January–December terrain while keeping each month's seasonal scenery. Seasonal islands group months by spring, summer, autumn and winter; northern winter includes December, January and February, and the southern hemisphere shifts the grouping by six months. Partial ranges show the seasons represented in that range.
- **Four-season circle** combines all four seasonal landscapes into one round floating island. Spring blossoms, summer greenery, autumn foliage and winter snow occupy distinct quarters. Coastal rivers drop into the sky as waterfalls, with flowing streaks, droplets and mist. Empty seasonal areas are scenery and do not add contribution records.
- Each supplied date keeps its own identity; scenery is separate from contribution days. A rolling year may include 13 different year-months. Switching layouts keeps the contribution history and chronological timeline intact. World files and local saves retain the selected layout; a season preview changes the scenery without regrouping the islands.
- Switch between the SVG map and genuine 3D. In 3D, drag to orbit and use the wheel or a two-finger gesture to zoom. Focus on a month, a date or a moving resident, and reset to the whole world at any time.
- Move the date cursor or start playback to reveal history. Statistics, discoveries and earned effects follow the cursor, so future activity does not unlock rewards in the past.
- Preview four seasons, daylight, sunset, night and weather. These presentation choices do not change recorded contributions. Reduce or disable motion when preferred.

The default seasonal weather follows each month's season: petals and butterflies, gentle summer rain, autumn leaves and winter snow distinguish neighboring islands. Clear, rain and snow can also be selected directly. Zoom in to see the river currents, shallows and shoreline alongside grass, soil, sand and rock surfaces.

Nature remains the main landscape, with villages and city districts in smaller regions. Daily activity grows local details; consistent activity adds seasonal gatherings, lights and life. Different tree, building and landscape shapes keep the world varied.

## Read your activity

Choose **Activity** in the explorer or the SVG demo to see the history behind the landscape. The dashboard shows contribution totals, active days, a daily/weekly/monthly trend, weekday activity, and monthly commit/PR comparison. Choose a month to narrow the period, focus or tap chart points for values, or expand **View the numbers** for the underlying tables.

Charts use the original source snapshot, independently of the replay slider. Missing dates remain missing; an observed zero is a quiet day. The source label identifies sample or imported records and their observed dates.

New snapshots fetched by the current CLI or Action include monthly GitHub contribution breakdowns. **Commits** means commits that qualify for GitHub profile contributions; **PRs opened** does not mean merged PRs. The table also includes issue, review, repository and restricted contribution counts. Categories follow GitHub visibility rules and are not a decomposition of the daily calendar total. Partial first and last months retain their actual requested ranges.

Older snapshots and the built-in sample still show contribution charts, with unavailable commit/PR counts clearly marked. Regenerate a snapshot with the current source build or merged Action commit to collect those counts. Importing an older file cannot reconstruct them. Charts render locally without a browser token, telemetry or additional network requests.

## Save, visit and make keepsakes

Save worlds in this browser or download a world JSON document. World files preserve the generated scene, source snapshot and current view, including the camera. Existing snapshots and multi-year archives are also accepted. World files allow up to 8 MiB; original snapshot/archive limits remain 2 MiB. The local collection holds up to 20 saved revisions.

One world covers at most 800 calendar dates, including missing dates and its outer month boundaries. Longer histories can be split into annual snapshots and imported as an archive of separate worlds; an oversized period is rejected explicitly rather than silently discarding dates.

The total model and landscape complexity is also bounded. If a world is too detailed, the explorer keeps the current view and asks you to shorten the period or reduce project landmarks.

A world file is portable; local bookmarks and the discovery journal stay in this browser. Browser storage can be removed by clearing site data, so export worlds you want to keep.

To share a visit, publish the JSON on GitHub Pages or a public repository, then open its HTTPS Pages or raw GitHub URL in the explorer. A share link references that public file; it does not upload local data. Visitors can bookmark the destination and return to their own world.

Public project districts use repository and release information requested from GitHub. Daily contribution totals are not attributed to individual repositories. Rate limits and incomplete pages are shown explicitly; a failed load leaves the current world open.

Photo exports include PNG and self-contained SVG for the map, plus PNG and GLB for 3D. GLB contains actual geometry and materials for compatible 3D tools; it is a still model, not a recording of the explorer's animations or a certified printable model.

## Browser and local preview

The map remains available when WebGL 2 is unavailable. The 3D engine loads when you choose 3D. A desktop-sized viewport is best for whole-world detail; mobile controls and reduced-motion preferences are supported.

Published links can add `&view=three` after their `world` parameter to open directly in 3D. Ordinary links still start with the map. The saved world preserves its geometry and camera; switching layouts is an explicit regeneration step.

From a source checkout, run `npm ci`, `npm run build`, then `node dist/index.js preview`. Open the printed local address and choose **Explore your world**. The packaged preview serves the same world application as Pages. The existing CLI, Action and browser rendering APIs still produce SVG without loading Three.js.

The current world explorer is published from `main`. npm `1.4.0` and the older floating `v1` Action tag do not contain it; follow the source-checkout or tested commit instructions in the README.

## Show a 3D island on your profile

GitHub READMEs display images, so the preview is a still frame rendered by the real Three.js engine. Clicking it opens the interactive world, where visitors can orbit, zoom and replay dates. [GitHub removes executable scripts from rendered markup](https://github.com/github/markup).

Add this optional step **after** your existing generation step with `write_snapshot: 'true'`, and **before** committing generated files:

```yaml
- name: Capture the four-season sky island
  uses: t1seo/maeul-in-the-sky/profile@main
  with:
    snapshot_path: maeul-in-the-sky.snapshot.json
    output_dir: .
```

Use the same tested commit SHA for this step and the root generator Action when pinning your workflow. This opt-in action installs Node development dependencies and headless Chromium on the runner; the ordinary SVG Action remains lightweight. Contribution data is fetched once by the original step. Capture consumes that local snapshot without a GitHub token or additional account requests.

Commit these generated files together with the snapshot and existing SVGs:

- `maeul-in-the-sky-world.json` — the exact frozen circle scene and canonical daytime view.
- `maeul-in-the-sky-world-light.png` — daytime Three preview.
- `maeul-in-the-sky-world-dark.png` — the same scene and camera in starlight.

Both images are 1600 × 1160, including their source/statistics caption. Capture fails when Three cannot render; it does not publish a fallback map. All three outputs are staged and validated before replacing the previous set. Keep the final commit step conditional on successful generation so a failed scheduled run leaves the last published world and previews together.

Use the PNGs in a theme-aware `<picture>` and link to:

```text
https://t1seo.github.io/maeul-in-the-sky/world/?world=https%3A%2F%2Fraw.githubusercontent.com%2FYOUR_USERNAME%2FYOUR_USERNAME%2Fmain%2Fmaeul-in-the-sky-world.json&view=three
```

Replace both `YOUR_USERNAME` segments with your account. The inner JSON URL must be public HTTPS with no credentials or query string. Keep the original SVG files if you also use the strip design elsewhere. Deploy the current explorer before linking a new circle document.

From a source checkout, the same pipeline is available with:

```bash
npm ci
npm run build
npx playwright install chromium
npm run render:profile -- --input /path/to/snapshot.json --output-dir /path/to/profile
```

`--evidence /path/to/capture.json` optionally records capture metrics. Input, output and evidence paths must remain distinct even when filename case is ignored, so captures are portable across filesystems. Manual reruns use the same workflow as scheduled refreshes; the displayed image reflects the last successful published run.
