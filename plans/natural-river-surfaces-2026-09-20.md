# Natural miniature river surfaces

Replace the road-like central stripe and repeated lane dashes with blue-green water, soft depth shading, irregular banks and scattered curved ripples. Keep the current miniature SVG village and its existing seasonal scenery.

## Scope

- Confine artwork to `effects/surface-water.ts` and a small river-art helper.
- Keep broad water surfaces still; animate one compact current path per selected liquid cell within the existing water/global budgets.
- Preserve river connections, waterfalls, frozen surfaces, dates, contributions, placements, pixel artwork and archived worlds.
- Taper bank details before all shared vertices. Never place banks across observed water neighbors or missing observations.
- Keep the existing 6.7-unit dash cycle so ponds and natural water retain their motion policy. New depth shading fades to transparent before tile boundaries to avoid gradient seams.

## Execution and evidence

1. Capture the existing demo artwork and establish the dry-bank boundary regression.
2. Add deterministic bank/ripple variations and revise the river palette locally.
3. Inspect closeups and full Day/Night SVG images in Orca; verify bends, confluences, outlets, motion and reduced/off alternatives.
4. Run focused terrain tests, typecheck, lint, build and structural budgets. Regenerate affected preview/demo SVGs and miniature static goldens.
5. Review the final change; commit and push a PR. Merge after required checks, verify Pages and regenerate the pinned `t1seo/t1seo` profile.

Read-only exploration and gap review confirmed the central stripe, dashed line, animation target contracts and the need to protect diagonal vertex connections. Runtime evidence is saved under `.orca/river-quality/`.
