# Terrain benchmark

Run from the repository root using the existing npm installation:

```sh
npx tsx scripts/benchmark/write-fixtures.ts
npx tsx scripts/benchmark/capture-baseline.ts --warmup 20 --iterations 100 --output .orca/maeul-improvements/evidence/T02/before.json
npx tsx scripts/benchmark/screenshot.ts .orca/maeul-improvements/evidence/T02/before.json
npx tsx scripts/benchmark/render.ts --warmup 20 --iterations 100 --output .orca/maeul-improvements/evidence/T02/current.json
npx tsx scripts/benchmark/render.ts --warmup 20 --iterations 100 --output .orca/maeul-improvements/evidence/T02/checked.json --baseline tests/fixtures/benchmark-baseline.json --check
npx vitest run tests/benchmark
```

The final command that uses `approved.json` requires a coordinator-approved **current feature** baseline first. No approved baseline is supplied by T02. Historical output is an original-renderer reference, not the approved feature budget. Never promote the changing workspace's smoke report as a baseline.

`render.ts` defaults to 20 warmups and 100 measured dark/light pairs for each fixture in empty/mixed/full order. `--warmup` accepts 0–10,000 and `--iterations` accepts 1–10,000. `--output` selects the report JSON. `--baseline` writes `<output>.check.json` with comparison findings; adding `--check` makes failures exit 1. `--check` without a baseline, malformed baseline JSON, unknown options and invalid sample counts exit nonzero. Output cannot overwrite its baseline.

Each capture records all elapsed-ms/heap/RSS samples, nearest-rank median/p95, starting/ending/peak-observed heap, runtime/OS/CPU/dependency versions, source/harness hashes, effective options, input hashes, and raw data/SVG/PNG paths. Byte counts refer to UTF-8 source and gzip level 9. XML elements are parsed with an SVGO visitor that does not modify the measured input. IDs, local href/url/accessibility/SMIL references, scripts/event handlers, accessible text and viewBox are checked separately. CSS targets count unique elements matched by animation-bearing stylesheet rules or inline animation declarations; CSS keyframe declarations and SMIL elements are separate fields. This is structural accounting, not computed CSS cascade, concurrently active animation count or browser frame/paint cost. Unsupported selectors are reported and fail budget checks.

Size and element growth above 5% fails on matching fixture/configuration reports. Median growth above 20% and p95 above 30% fail only when Node/V8, architecture, OS release, CPU model/core count and total memory match. Other environments produce an explicit timing warning while size/semantic gates still run. Matching hardware cannot ensure equal system load. Timing excludes module startup, metrics, PNG, network and disk; there is no forced GC and all fixtures share one process. Memory peaks are observations between render calls, not true in-render maxima.

Historical capture uses `git show c6d60487e50347fd84b770b57618d181acd874de:<path>` and follows historical relative imports, copying only renderer and fixture source dependencies into an owned temporary directory. It links the existing node_modules; dependency versions are recorded and are **not** the historical lockfile installation. Current benchmark code is copied as the measuring harness, while production code and the seed-42 data generator always come from that commit. The original working tree is never checked out or reset. A `.source.json` manifest records every historical source file/hash. Temporary files are removed in `finally`.

The CPU profile is a separate 2-warmup/3-iteration run under `<output-name>-profile/`; its timing must not be substituted for the unprofiled primary run. Resvg produces 1680×480 PNGs of the historical SVG's static base with explicit dark/light backgrounds; it does not simulate CSS or SMIL animation. Browser gallery screenshots use the actual saved historical SVGs at 390 and 840 CSS pixels, with an owned loopback server and Chromium, and close both resources even on failure. They are a renderer gallery, not the historical demo HTML or a cross-platform pixel baseline.

`scripts/qa/server.ts` exports `startQaServer({root, port?})`, returning `{url, close(): Promise<void>}`. It binds 127.0.0.1, defaults to port 4317, allows port 0 for tests, serves GET/HEAD with MIME and no-store headers, and blocks path/symlink escape. Call `close()` from your scenario's `finally` block.

For CLI-driven Playwright `webServer` setup, run `npx tsx scripts/qa/server.ts --root . --port 4317`. The demo is `/docs/demo/index.html`; fixture URLs are `/tests/fixtures/improvements/<name>.json` (including `two-year-archive.json`). SIGINT/SIGTERM close the owned listener. Programmatic imports do not start a listener automatically.
