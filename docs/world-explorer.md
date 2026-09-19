# Sky world explorer

[Open the explorer](https://t1seo.github.io/maeul-in-the-sky/world/) · [한국어 안내](world-explorer.ko.md)

Your contribution dates become places in a floating miniature world. Start from the sample, import a snapshot/archive, or choose **Explore your world** in the original demo to carry the currently displayed history into the explorer.

## Choose a rendering version

The explorer’s version selector opens the same source snapshot in the current SVG demo or the **Classic** pre-upgrade renderer. [Open Classic directly](https://t1seo.github.io/maeul-in-the-sky/?renderer=classic). The SVG demo keeps its selection in the share URL and uses that renderer for previews and image exports.

Classic preserves the browser bundle from commit `05a10eff07575acf2c81adcd66a66bc501507217`; it is separate from the `classic` architectural culture setting. Its generated GitHub workflow pins that exact commit, while the current workflow follows `main`. Snapshot JSON remains a portable record of data and settings; it does not pin a renderer. For a reproducible profile design, keep the generated workflow’s commit pin.

## Explore and replay

- Choose a monthly archipelago, one large connected island, or four seasonal islands. The large island joins January–December terrain while keeping each month's seasonal scenery. Seasonal islands group months by spring, summer, autumn and winter; northern winter includes December, January and February, and the southern hemisphere shifts the grouping by six months. Partial ranges show the seasons represented in that range.
- Each supplied date keeps its own identity; scenery is separate from contribution days. A rolling year may include 13 different year-months. Switching layouts keeps the contribution history and chronological timeline intact. World files and local saves retain the selected layout; a season preview changes the scenery without regrouping the islands.
- Switch between the SVG map and genuine 3D. In 3D, drag to orbit and use the wheel or a two-finger gesture to zoom. Focus on a month, a date or a moving resident, and reset to the whole world at any time.
- Move the date cursor or start playback to reveal history. Statistics, discoveries and earned effects follow the cursor, so future activity does not unlock rewards in the past.
- Preview four seasons, daylight, sunset, night and weather. These presentation choices do not change recorded contributions. Reduce or disable motion when preferred.

The default seasonal weather follows each month's season: petals and butterflies, gentle summer rain, autumn leaves and winter snow distinguish neighboring islands. Clear, rain and snow can also be selected directly. Zoom in to see the river currents, shallows and shoreline alongside grass, soil, sand and rock surfaces.

Nature remains the main landscape, with villages and city districts in smaller regions. Daily activity grows local details; consistent activity adds seasonal gatherings, lights and life. Different tree, building and landscape shapes keep the world varied.

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

From a source checkout, run `npm ci`, `npm run build`, then `node dist/index.js preview`. Open the printed local address and choose **Explore your world**. The packaged preview serves the same world application as Pages. The existing CLI, Action and browser rendering APIs still produce SVG without loading Three.js.

The current world explorer is published from `main`. npm `1.4.0` and the older floating `v1` Action tag do not contain it; follow the source-checkout or tested commit instructions in the README.
