# Browser regression

Use the repository's installed Playwright version and browsers:

```sh
npm run build
npx playwright install --with-deps chromium firefox webkit
npm run test:browser
```

The suite runs each scenario in Chromium, Firefox and WebKit at 1280×900, 390×844, and 390×844 with reduced motion. It starts its own loopback server on port 4317; use `MAEUL_QA_PORT=4327 npm run test:browser` when that port belongs to another process. Two workers are used, with no retries or skipped cases. Each page gets a fixed date, UTC timezone, en-US locale and device scale 1.

Static scene checks select motion off and load the bundled Noto Sans KR font. They check actual terrain bounds, real day counts and identical consecutive screenshots. The HTML report includes each dark/light PNG for review. Linux CI runs these checks across all engines. A separate `Approved Static Images` job on `macos-15` enables comparison against the checked-in macOS Chromium goldens, so visual changes can fail CI. It does not compare macOS baselines on Linux.

To establish an explicitly reviewed pixel baseline for one OS/browser environment:

```sh
MAEUL_VISUAL_BASELINE=1 npx playwright test static.spec.ts --grep captures --project=chromium-desktop --update-snapshots
MAEUL_VISUAL_BASELINE=1 npx playwright test static.spec.ts --grep captures --project=chromium-desktop
```

Review the images before accepting them. `npm run test:browser:update` updates the current platform's Chromium static goldens. Paths include platform and browser project. Comparisons allow a 0.1 per-pixel color threshold and at most 0.2% differing pixels for small rasterization differences; geometry assertions remain exact. Browser/OS/font upgrades require a fresh review. The local macOS checks have been executed; the newly configured hosted CI job runs on the next push or pull request.

Motion tests use real browser CSS and SVG SMIL time, exercise full/subtle/off, and measure the visible reduced-motion fallback over actual animation frames. Playwright clock fixes Date only; it does not fake animation time.

Packed-adapter checks are separate: `npm run test:artifact` builds, packs, unpacks, and runs actual Node 20.19.0 CLI/ESM/CJS, Node 24 Action, Chromium browser imports and the packed local preview. The script can use preinstalled binaries through `MAEUL_SMOKE_NODE20` and `MAEUL_SMOKE_NODE24`; otherwise it obtains the required major versions through npm. The Action check runs before any node_modules installation. Every API response in this smoke is a deterministic fixture, and snapshot execution rejects any attempted network request.
