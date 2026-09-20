# Archived landscape terrain experiment

Archived at the user's request on 2026-09-21. The profile and [public SVG studio](https://t1seo.github.io/maeul-in-the-sky/) use the original calendar renderer again; Pages deploys from `main`. The day/night images, contribution snapshot and former profile workflow are preserved in the [landscape archive](https://github.com/t1seo/t1seo/tree/main/archive/landscape-2026-09-21). Source, HTML demos, tests and the implementation plan remain in `t1seo/civilization-terrain` and the `archive/civilization-terrain-2026-09-21` tag. The separate worktree is retained. No feature merge, npm publication or `v1` Action update was performed.

## Two terrain modes

In this branch's locally built SVG studio, choose **Terrain · 지형 → Landscape · 자연 지형**, then **Island**, **Archipelago**, or **Valley**. **Calendar · 기존 달력** returns to the original dated terrain. Culture, miniature/pixel artwork, day/night, motion, decoration density and banner/card remain separate choices. The archived **Classic · original artwork** renderer supports calendar terrain only; selecting it returns the terrain control to Calendar and explains the change.

Landscape mode uses geographic elevation, ridges, coastlines and drainage. Counts continue to determine the existing daily rewards and earned Wonders. The terrain does not invent contributions or award showcase Wonders. The date inspector, collection, source label, zero days and total contribution statistics keep their original meaning. Mountains are geographic features, not contribution-height bars.

The existing building, nature and Wonder artwork is reused. New SVG terrain, roads, plazas, fields and river crossings provide the surrounding geography and settlement composition. You do not need to redraw every building to use the new mode. Additional village homes and forest clusters are marked as background scenery, separately from the dated earned assets; they do not add contributions or rewards.

## Run this checkout

```sh
npm ci
npm run generate:landscape
npm run build
python3 -m http.server 4174 --bind 127.0.0.1 --directory docs/demo
```

Open `http://127.0.0.1:4174/?terrainMode=landscape&landscapeLayout=island&mode=light&preset=civilization`. The first preview is explicitly sample data. Import a snapshot for your actual history; changing the setup username does not fetch an account.

Generate standalone images from a snapshot with the built CLI:

```sh
node dist/index.js --input village.snapshot.json \
  --terrain-mode landscape --landscape-layout valley \
  --village-style korean --art-style miniature \
  --motion off --format both --write-snapshot --output ./landscape-output
```

Use `--terrain-mode calendar` to explicitly override a saved landscape setting. Omitted new fields preserve the previous calendar behavior. Landscape banner images use 1200×840 logical dimensions and cards use 840×840; calendar dimensions remain 840×240 and 420×360. PNG uses the selected output scale.

## GitHub README and Pages

The generated SVGs can be embedded in a GitHub README as images. They contain their own artwork and require no JavaScript. PNG is a static alternative. Interactive controls, the date inspector and downloads are browser features of the studio; they belong on a hosted HTML page, such as GitHub Pages.

The studio's landscape workflow export references `t1seo/maeul-in-the-sky@t1seo/civilization-terrain`, including its committed built Action files. Calendar workflows retain `@main`; archived Classic workflows retain their pinned commit. A downloaded workflow generates and publishes images only after you install and run it in your own repository.

If this experiment is explicitly restored, its former deployment command is:

```sh
gh workflow run pages.yml --repo t1seo/maeul-in-the-sky --ref t1seo/civilization-terrain
```

The archived branch's deployment permission has been removed from `github-pages`; only `main` remains allowed. Restoring the experiment requires explicitly allowing this exact branch again. Its workflow rebuilds the studio, generates the landscape samples and catalog, verifies the expected files, and deploys `docs/demo`. GitHub Pages serves one current deployment for this repository. Both calendar and landscape remain usable within this branch's local studio.

Settings links preserve `terrainMode=landscape` and `landscapeLayout=island|archipelago|valley`. They share settings only. Settings and snapshot JSON preserve the mode and geography choice; snapshots also contain your supplied contribution data. Full prepared Scene JSON is the exact rendering replay format; metadata is descriptive and does not contain the complete terrain mesh.

## Continue the implementation loop

The executable plan is [`plans/civilization-terrain.md`](../plans/civilization-terrain.md). Run `npm run verify:landscape` after a change to check types, the focused terrain/settings/adapter tests, the real Chromium studio scenario, and regenerate the eight comparison SVGs in `docs/demo/landscape/assets/`. Run `npm run build` to refresh the distributable browser and Action files, then inspect `/landscape/` and the studio at both desktop and mobile widths. Full release checks remain `npm run lint`, `npm run format:check`, `npm test`, and `npm run test:artifact`.

The original checkout stays on `main`. Continue development in `civilization-terrain/` on `t1seo/civilization-terrain`; switching the studio's Terrain selector does not require switching Git branches. The local execution state is kept in `.omo/boulder.json` with verification receipts in `.omo/start-work/ledger.jsonl`.
