# Preparing the authored wildlife

The tour ships eight self-contained GLBs under `docs/demo/tour/models`. Normal application builds use the committed files and do not download or convert models. Runtime loading requires neither a compression decoder nor an external texture/buffer request.

Preparation uses pinned `@gltf-transform/core` and `@gltf-transform/functions` 4.5.0 dev dependencies. `sources.ts` is the acquisition inventory: original model pages, exact download URLs, file names, licenses, and expected source SHA-256 values. Download those original files into a local directory before running the converter; the default directory is ignored by Git.

```sh
npm run prepare:wildlife -- .orca/living-forest/candidates docs/demo/tour/models
npm run check:wildlife
```

The converter verifies all eight local source digests before writing anything. It does not enable network access on `NodeIO`. Both command arguments are optional. For a reproducibility check, use a separate output directory and compare the resulting eight GLBs and `manifest.json` byte for byte:

```sh
npm run prepare:wildlife -- .orca/living-forest/candidates .orca/living-forest/reproduced
```

Credits and license text files are reviewed, committed resources; preparation does not rewrite them. Copy them along with the models whenever redistributing this inventory. The full notices are in `docs/demo/tour/models/CREDITS.md` and `docs/demo/tour/models/licenses/`.

## Coordinate and animation contract

- Every file preserves its authored scale and local transforms, with +Y up and +Z forward. The chipmunk's axis was checked in a geometry side projection; the other animals' Head/Body/Tail joint positions confirm the forward direction.
- Apply placement, centering, ground offset, and desired size through a parent wrapper at runtime. Do not bake node transforms into skinned geometry. Sheep and pig have an authored 100× armature scale that must stay intact.
- `manifest.json` records bind bounds and 17 sampled poses for each retained clip. `minFootY`/`maxFootY` describe sampled lowest geometry points, not a certified collision hull. These are useful for grounding and visual checks; animation extrema between samples can differ.
- Cow and deer retain Eating, Idle, Idle_2, and Idle_Headlow. Fox, horse, and donkey retain Eating, Idle, and Idle_2. Horse and donkey omit Idle_Headlow to meet the 1 MiB per-file limit. Sheep and pig retain Armature|Idle. Names are unchanged.
- The chipmunk is a single textured mesh without bones or authored animation. Any ambient squirrel movement in the tour is a runtime effect, not an animation supplied by Google.

## Preservation and size checks

The optimizer combines base color factors with existing vertex colors in linear color space. It preserves original roughness, metallic factors, sidedness, vertex positions, normals, joints, weights, and node transforms. It merges compatible primitives directly without flattening or baking the skeleton. Source animations excluded from the inventory have their channels and samplers disposed as well, so removed clips cannot leave orphaned binary payload behind.

Redundant animation keys are removed with zero tolerance. After GLB serialization, the converter reloads each file through official glTF Transform tooling and compares bind and sampled animation bounds against the source to within 0.0001 authored units. It rejects files over 1 MiB, more than one drawable primitive/material, or a combined payload over 6 MiB. No Draco, meshopt compression, quantization, simplification, or new procedural anatomy is applied.

The asset contract tests check actual binary chunks, local resources, skin attributes, peaceful clips, licensing inventory, byte/triangle/bone counts, and checksums. Art quality, correct world size, and animation appearance still require the tour's browser review.

## Source license evidence

The original Ultimate Animated Animals `License.txt` came from:

`https://drive.google.com/uc?export=download&id=1F2uy8T2fRpdc6gZ4mnS02_C2E63WvKtn`

SHA-256: `83d8959f9fc56353ed571fbe2dc52e4bcd64508e2399501cd45ac2ce3df0bf8c`.

It is preserved as `licenses/Quaternius-ultimate-pack.txt`. The selected historical downloads are CC0. The chipmunk remains CC BY 3.0, including attribution, license link, original model identification, and a notice of changes in the visible tour credits.
