# Release 2.1.0

## Scope

Publish the compatible Calendar village tour improvements accumulated since 2.0.0. Update the English, Korean, Japanese and Chinese READMEs, current setup pins, package version and release notes. Preserve the default Calendar SVG, the Classic renderer commit, archived experiments and the original dirty worktree.

## Execution

1. Describe the optional tour, navigation, authored scenery, credits and coverage in all four READMEs. Explain opt-in `write_snapshot: 'true'` and use the actual snapshot publication branch/path in tour links (`main` for Quick start, `output` for Studio-generated workflows).
2. Set package/lockfile version to 2.1.0; update current renderer metadata and both existing setup-pin assertions in `tests/demo/setup.test.ts` and `tests/visual/art-styles.spec.ts`. Promote Unreleased notes into a dated 2.1.0 changelog entry.
3. Rebuild committed artifacts. Run static checks, targeted unit tests, installed-Chrome setup verification, and inspect the packed CLI/assets. Use CI for the full coverage, browser matrix and package smoke gates without restoring deleted browser caches locally.
4. Review the documentation and release diff, commit and push a release branch, and merge its PR after required checks pass. Keep existing npm Trusted Publisher configuration.
5. Tag the tested merge as v2.1.0, verify the Publish workflow and npm registry, publish matching GitHub release notes, and advance the compatible v2 tag. Preserve v1, v2.0.0 and archive tags. Verify Pages setup exports and clean temporary release artifacts.

## Evidence

- Baseline main: `152611f0a93224ae4e090aaccdf4b692646f5264`; repository and npm latest: 2.0.0.
- Read-only documentation, release and compatibility audits found no blocker; no public API breaking changes since 2.0.0.
- Original worktree tracked binary diff SHA-256: `b9c3993d2040604755ae522b8095224a1e46007560b62a6a3ef9b3679a9d24c0`.
- Local validation passed: build, lint, typecheck, formatting, catalog, authored assets, 12 setup/version unit cases and the installed-Chrome workflow/settings/export scenario. Packed CLI reports 2.1.0; the package contains all 65 GLBs and model attribution. Generated JavaScript changes are limited to version strings.
- Pixel outputs were regenerated because the source fingerprint includes the lockfile; only the source fingerprint changed, with the rendered fingerprint and all 240 sprites unchanged.
- Independent documentation and release reviews passed after correcting the model-license link in all four READMEs.
- Validation and publication results will be recorded with the release PR and GitHub Actions runs.
