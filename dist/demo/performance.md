# Measured rendering and SVG size

These measurements describe the 2026-09-13 implementation on a shared Apple M1 host with Node 26.8.1. They are observations, not a guarantee of speed on other devices. The source revision before the changes was `c6d60487e50347fd84b770b57618d181acd874de`.

## Renderer

Each fixture received 20 warmups and 100 measured calls. Each call produces the dark/light pair; timings exclude imports, networking, file writes, metrics and PNG rasterization. Old and new captures used identical fixture hashes and runtime/hardware identity. Source hashes did not change during capture.

| Fixture | Old median / p95 | New median / p95 |
| ------- | ---------------: | ---------------: |
| Empty   |   16.58 /22.85ms |   14.14 /16.04ms |
| Mixed   |   18.16 /28.07ms |   18.29 /19.77ms |
| Full    |   18.97 /24.10ms |   22.40 /24.25ms |

The dense fixture is slower after adding features. Shared scene preparation and palette caching do not imply a universal end-to-end speedup. Default full-motion SVGs also contain a dependable static fallback and date metadata: the dense dark output is 1,078,607 raw bytes / 143,177 gzip bytes, versus 387,739 / 57,057 previously. Use `motion: off` when animation is unnecessary.

The checked-in [feature baseline](https://github.com/t1seo/maeul-in-the-sky/blob/main/tests/fixtures/benchmark-baseline.json) contains all samples, environment, source identity, byte counts and relative artifact paths. The final corrected renderer passed a matching-environment check against this earlier feature baseline with +5% raw/gzip/element, +20% median and +30% p95 budgets. These budgets compare against the approved feature baseline, not against the old renderer with fewer features.

```sh
npm run benchmark -- --warmup 20 --iterations 100 \
  --output test-results/benchmark/current.json \
  --baseline tests/fixtures/benchmark-baseline.json --check
```

Timing gates only apply to matching environments. Other environments still check size and structure and explicitly report that timing is not comparable.

## Palette and offline SVG optimization

A separate palette experiment preserved the existing color checksum and made repeated palette construction approximately 5× faster. Fractional-week computation was 12% slower in that microbenchmark. The cache is bounded and callers receive isolated color objects.

For six captured full/subtle/off × dark/light SVGs, the guarded geometry/path recipe reduced gzip size by 16.54–17.06%. Text, IDs, references and animation contracts were preserved. Static resvg and controlled Chromium comparisons found small subpixel raster differences, not pixel-identical output. The full guarded recipe added 77–235ms per SVG in that experiment, so it is used only by offline preview/example generators. It is not imported into the browser or runtime renderer.

The `defs/use` experiment saved only about 0.23–0.25% gzip on actual animated scenes and added processing/reference complexity; it was rejected. Live 10-second browser traces did not establish a practical frame-rate improvement. Byte savings are not an FPS or energy claim, and the six-input percentage is not a measurement of every subsequently generated example.

Reproduction tools are in `scripts/optimization/`; detailed local captures are written to the ignored `evidence/svg-optimization/` directory. Review changed previews and protected-content checks whenever the recipe or renderers change.

## Water brightness experiment

Replacing the water-surface `brightness(1.3)` filter with precomputed solid sRGB colors was rejected. Across six static dark/light empty/mixed/full outputs, the closer integer-color candidate reduced raw bytes by 0.64% but increased gzip by 0.40%. An animated mixed-dark output had the same tradeoff: raw −0.73%, gzip +0.60%.

Both Resvg and Chromium changed pixels beyond repeat-capture noise. Fractional RGB channels did not restore equality and produced larger differences in Resvg. Bounded browser observations also did not demonstrate a frame or paint improvement. The runtime keeps the existing filter; a smaller uncompressed SVG alone did not justify changing its rendering behavior.

Reproduce with `node --import tsx scripts/optimization/brightness.ts` followed by `node --import tsx scripts/optimization/brightness-browser.ts`. The scripts write their scoped measurements and images under `.orca/maeul-improvements/evidence/brightness/`.
