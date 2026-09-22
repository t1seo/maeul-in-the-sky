# Authored nature preparation

The tour uses 18 textured models from [Quaternius Stylized Nature MegaKit Standard](https://quaternius.com/packs/stylizednaturemegakit.html), plus four species selected after inspecting the integrated tour in Chrome. SVG/calendar artwork and dated placements stay unchanged.

| File | Creator and source | License | Triangles | Bytes |
| --- | --- | --- | ---: | ---: |
| nature-collection.glb | [Quaternius Standard](https://quaternius.itch.io/stylized-nature-megakit) | CC0 | 33,734 | 3,400,452 |
| willow.glb | [Willow — Quaternius](https://poly.pizza/m/mBrUbIp9Zd) | CC0 | 2,752 | 150,548 |
| cattail.glb | [Cattail — Poly by Google](https://poly.pizza/m/9uT74BMpRrl) | CC BY 3.0 | 1,146 | 29,036 |
| lilypad.glb | [Lilypad — Quaternius](https://poly.pizza/m/TI6ukUlsLh) | CC0 | 372 | 23,068 |
| palm.glb | [Nature Kit — Kenney](https://kenney.nl/assets/nature-kit), tree_palmDetailedTall | CC0 | 336 | 21,996 |

Total: **3,625,100 bytes** in five self-contained, core glTF files. The collection shares 14 embedded textures, 1,009,867 encoded image bytes and 14,651,392 decoded RGBA bytes before mipmaps. The extra species use authored solid material colors and no textures. The 18-model collection has 26 primitives / 12 materials; extras add nine primitives / eight materials. Runtime instances group matching geometry/material/wind states.

## Reproduce offline

Use the package-lock versions: glTF Transform 4.5.0 and sharp 0.35.4. Download the Standard ZIP from the creator's free itch form (upload 11055123), the Kenney ZIP linked in `extra-sources.ts`, and the three direct Poly Pizza GLBs in that same file. Extract only data; do not execute downloaded files.

Keep the input cache in this shape:

```text
nature-candidates/
  quaternius-nature.zip
  quaternius/License_Standard.txt
  quaternius/glTF/...
  kenney-nature.zip
  kenney/License.txt
  kenney/Models/GLTF format/...
  extra/mBrUbIp9Zd.glb
  extra/9uT74BMpRrl.glb
  extra/TI6ukUlsLh.glb
```

```sh
npx tsx scripts/authored/nature/prepare.ts /path/to/nature-candidates/quaternius docs/demo/tour/models/nature /path/to/nature-candidates/quaternius-nature.zip
```

The script verifies both original archive hashes, 52 selected MegaKit source files, four extra GLB hashes and both pack-specific licenses. `source-files.json` and `extra-sources.ts` pin the exact licensed inputs. The preparation step keeps geometry, normals and UVs; resizes textures to at most 512px; uses JPEG quality 85 for opaque color, quality 95 for normals, both at 4:4:4; keeps all alpha-bearing images as PNG. No decoder or external image request is required. Source MASK cutoffs are approximately **0.2**, double-sided; bark, leaf, flower and normal materials remain separate.

Accessor bounds are recomputed from actual vertex buffers. This fixes stale Fern_1 source metadata while retaining its 2.826934 × 0.840243 × 2.652320 authored geometry. The runtime centers and grounds each source from actual vertices, then uniformly fits the declared height and span. Original placement colliders remain in force.

Each output has bytes, SHA-256, per-node geometry bounds, material names, metrics and source/modification notices in `docs/demo/tour/models/nature/manifest.json`. The output includes the original Quaternius Standard and Kenney notices plus complete CC0 and CC BY 3.0 legal text. The credits generator must display **Cattail by Poly by Google**, its model/license links, and the recorded modifications.

## Semantic coverage and art rules

The nature adapter upgrades **58 catalog IDs**, including evergreen/deciduous/snow/autumn/blossom trees, orchards and fruit trees, shrubs, ferns, flowers and meadows, grass, mushrooms, rocks, cobbles, ponds, willow, palms, cattails and lilies, plus the natural components of worldTree, sakuraEternal and aurora.

Fruit count, color and source identity remain intact. Fruit spheres fit inward by 0.6 around each replacement tree's center and shrink to 0.65 of the old size; the orchard crate and its three apples retain their original transform. Rock models supply their own moss; old primitive moss discs/strata are omitted because they floated above the new silhouettes. Pond basins and water remain at the original scale/offset while stones, shore plants, lilies and willow are authored components.

Only named foliage materials receive seasons; bark and flower petals retain their own materials. Pink blossom IDs explicitly retain their blossom color. Summer TwistedTree and Bush_Common use a green hue, since the selected atlas is red; autumn/winter use the runtime season. Grass uses the summer tint shader's luminance floor because the original model has pure-black baked COLOR_0 at its roots. The source images have full opacity, so this is not an alpha loss or JPEG artifact. The renderer keeps MASK-aware shadow/depth materials and rooted wind.

The Kenney palm receives a natural summer green (`#648a3a` for `leafsGreen`), replacing its bright mint foliage in the forest. Its `woodBark` material and all non-summer season policies remain unchanged.

Distinct species remain procedural when a reviewed shape match was not selected:

- **Bamboo thickets:** the reviewed Kenney model has thick cut stems without branches or leaves. It fails the required leafy thicket silhouette, so the complete original bamboo recipe remains; no external bamboo model is requested or shipped.
- **Birch/autumnBirch:** absent from the 2024 Standard subset. The 2022 creator pack was researched, but its separate textures, BLEND foliage and inconsistent pack heading on the copied license require a separate visual/provenance review. No generic oak substitution.
- **Autumn ginkgo, tulip/tulipField, crocus, sunflower:** the selected pack's anonymous broadleaf/flower shapes do not identify those leaves or blossoms faithfully.
- **Kelp/coral:** freshwater cattails and terrestrial plants cannot represent marine species.
- **Moss, rice/crops, fallen leaves, fruit/vegetable props and cultural details:** their ground cover, harvest, terrain or cultural geometry has no approved source match in this inventory. Rice paddies/terraces preserve their stepped water semantics.
- **Other natural Wonders:** ice, crystals, water, glow, and specific landmark silhouettes remain project compositions; only species-matching components are replaced.

The 2024 free subset contains no willow, palm, bamboo, cattail or lily. Four gaps are filled by the separately credited sources above, each below 1MiB; their combined 219KiB fits the initial sample/profile download budget. Bamboo retains its existing leafy design after the external candidate failed visual review.

## Verification

```sh
npx vitest run --project=unit tests/tour/authored-nature-assets.test.ts tests/tour/authored-nature-mapping.test.ts tests/tour/authored-nature-wetland.test.ts tests/tour/authored-nature-art.test.ts
```

Artifact tests parse the real binaries, check hashes/provenance, correct fern bounds, cutout alpha, material names, decoder independence and payload. Mapping tests cover season/blossom policy, species identity, original colliders, composite water/crate preservation and art regressions. The integration owner performs Chrome close-ups from front/side, seasonal views and moving MASK shadows, and measures the complete scene rather than treating these CPU checks as visual proof.
