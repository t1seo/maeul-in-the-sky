# Release 2.0.0

## Objective and scope

Publish the current calendar village improvements to the repository, GitHub Releases and npm. Preserve the original calendar as the default, the archived landscape branch/tag, the profile archive, and existing local edits.

The release starts from `8098817bb16e422147311ec1b6f2bbe2033f887b`. Port only the rolling-calendar fix and regression cases from `47df5c54b1d644f9447e1cb2c2e0fb306e8f7d9d`; rebuild artifacts from this release's source. Do not merge the geographic landscape experiment.

## Gap review decisions

- Use **2.0.0**: the public `ContributionData.stats` type gained four required fields since 1.4.0. Existing callers can migrate to `computeStats(weeks)`. Preserve the old `v1` tag and publish `v2` for this major.
- Restrict npm publishing to versioned release tags, verify tag/package equality and keep publication dependent on CI. Floating major tags must not republish an existing npm version.
- Update installed CLI, four translated READMEs, browser setup exports and release notes together. The static calendar remains 840 × 240 by default.
- Keep new geographic terrain code, generated previews, and configuration archived. Existing `/world/` experiments already on main remain archived.

## Execution and acceptance

1. Prepare a clean Orca worktree; save the original checkout's diff/status as local evidence. Acceptance: only the new worktree changes.
2. Update package/lock to 2.0.0, consolidate the changelog, document migration and pin setup exports to v2.0.0. Acceptance: metadata agrees and active docs no longer claim the features are npm-unreleased.
3. Port the calendar boundary fix with its tests. Acceptance: three previously failing rolling/leap-year cases pass; unchanged ordinary rolling cases pass too. Setup export tests must fail on main and pass on the release pin.
4. Build and run lint, typecheck, format, catalog, API/setup tests and packaged adapter smoke. Acceptance: CLI reports 2.0.0; actual packed Node 20/24, ESM/CJS, browser, PNG and Action adapters run; no geographic terrain option leaks in. Remote CI supplies the full browser/coverage gates. Save command output under ignored `.orca/release/`.
5. Review goal, quality, security, executable QA and history independently. Push a release PR; merge only after required checks pass. Verify committed generated assets reproduce.
6. Push v2.0.0; await the Publish workflow; create the matching GitHub Release and floating v2. Acceptance: registry `latest` is 2.0.0, GitHub latest release is v2.0.0, an npm-downloaded CLI reports 2.0.0, v1 remains unchanged, and the public profile/studio retain calendar output.

## Failure handling

Do not publish if build/tests fail or the tag differs from package metadata. Do not expose or copy npm/GitHub credentials. If authentication blocks the actual publish, retain the verified release commit and report the exact remaining access requirement. Never claim npm publication based only on a successful build or tag push.

## Commit and delivery

Use gitmoji commit style. Create release notes from the 2.0.0 changelog and migration guidance. Record final commit, PR, workflow, registry, and preservation checks in ignored local evidence. User explicitly authorized the release; no further approval step is needed.
