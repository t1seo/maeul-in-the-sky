# Preparing the authored wildlife

The tour ships 24 self-contained GLBs under `docs/demo/tour/models`, covering 29 animal catalog IDs including aliases and compositions. The original squirrel, cow, deer, fox, horse, donkey, sheep, and pig artifacts are unchanged. The additional 16 models replace rabbit, goat, sparrow, chicken, owl, gull, heron, whale, frog, clam, fish, turtle, crab, jellyfish, butterfly, and spider geometry. Normal application builds use the committed files and do not download or convert models. Runtime loading requires neither a compression decoder nor an external texture/buffer request.

`robinBird` retains the original procedural recipe after visual review rejected the available external Robin's abstract silhouette. A more natural exact robin was identified, but a verified public direct download was unavailable under the acquisition constraints. No different bird species is substituted. The rejected model is absent from the download catalog, preparation sources, shipped files, and manifest.

Preparation uses pinned `@gltf-transform/core` and `@gltf-transform/functions` 4.5.0 and `sharp` 0.35.4 dev dependencies. `sources.ts` and `additional-sources.ts` are the acquisition inventory: original model pages, exact download URLs, file names, licenses, and expected source SHA-256 values. Download those original files into a local directory before running the converter; the default directory is ignored by Git. The converter never executes downloaded code.

```sh
npm run prepare:wildlife -- .orca/tour-assets/animals/raw docs/demo/tour/models
npm run check:wildlife
```

The converter verifies all 24 local source digests before writing anything. It does not enable network access on `NodeIO`. Both command arguments are optional. For a reproducibility check, use a separate output directory and compare the resulting 24 GLBs and `manifest.json` byte for byte:

```sh
npm run prepare:wildlife -- .orca/tour-assets/animals/raw .orca/tour-assets/animals/reproduced
```

Credits and license text files are reviewed, committed resources; preparation does not rewrite them. Copy them along with the models whenever redistributing this inventory. The full notices are in `docs/demo/tour/models/CREDITS.md` and `docs/demo/tour/models/licenses/`.

## Coordinate and animation contract

- Every file preserves its authored scale and local transforms, with +Y up. The original eight models have verified +Z forward; additional models retain their authored heading. Runtime heading variation does not rotate or flatten the imported geometry.
- Apply placement, centering, ground offset, and desired size through a parent wrapper at runtime. Do not bake node transforms into skinned geometry. Sheep and pig have an authored 100× armature scale that must stay intact.
- `manifest.json` records bind bounds and 17 sampled poses for each retained clip. `minFootY`/`maxFootY` describe sampled lowest geometry points, not a certified collision hull. These are useful for grounding and visual checks; animation extrema between samples can differ.
- Cow and deer retain Eating, Idle, Idle_2, and Idle_Headlow. Fox, horse, and donkey retain Eating, Idle, and Idle_2. Horse and donkey omit Idle_Headlow to meet the 1 MiB per-file limit. Sheep and pig retain Armature|Idle. Names are unchanged.
- The chipmunk is a single textured mesh without bones or authored animation. Any ambient squirrel movement in the tour is a runtime effect, not an animation supplied by Google.
- Frog and spider retain only `FrogArmature|Frog_Idle` and `SpiderArmature|Spider_Idle`; fish and whale retain `Armature|Swim`. Attack, jump, death, and walking clips are excluded. The remaining new models are unrigged; their legs and bodies are not procedurally stretched to imitate skeletal animation.
- `src/tour/wildlife/placement.ts` normalizes new species by both height and horizontal span while preserving proportions. Ground birds stand on their source surface; the model contains no invented perch. Butterflies remain above their source plants, with small rigid heading motion. Fish, whale, and jellyfish straddle a fixed source waterline without whole-body bobbing. Fish schools keep three independently pickable actors, and butterflies/gardens keep two to four. Every member maps back to the original contribution ID and date.

## Preservation and size checks

The optimizer combines base color factors with existing vertex colors in linear color space. It preserves original roughness, metallic factors, sidedness, vertex positions, normals, joints, weights, and node transforms. It merges compatible primitives directly without flattening or baking the skeleton. Source animations excluded from the inventory have their channels and samplers disposed as well, so removed clips cannot leave orphaned binary payload behind.

The jellyfish has one documented art adaptation in `palette.ts`: its magenta solid colors become muted blue-gray, pearl-blue, and ivory before consolidation. Its original opaque alpha mode and alpha values remain unchanged, and no geometry or texture coordinates are altered by the palette step. This is a color adaptation, not a new translucent or rigged model.

Redundant animation keys are removed with zero tolerance. After GLB serialization, the converter reloads each file through official glTF Transform tooling and compares bind and sampled animation bounds against the source to within 0.0001 authored units. Textures larger than 512 pixels are resized proportionally to fit 512 pixels and encoded as PNG. Original UVs, color factors, alpha, and the squirrel texture remain intact. Clam and butterfly preserve separate textured and solid surfaces, using two drawable primitives; other species use one. Clam, turtle, and butterfly preserve the source's omitted normals and render with glTF's flat-shading behavior.

The converter rejects files over 1 MiB, more than one mesh, primitives/materials beyond the per-model budget above, or a combined wildlife payload over 12 MiB. The application loads only requested species; the separate combined initial transfer gate includes nature and village models. No Draco, meshopt compression, quantization, simplification, or new procedural anatomy is applied. `manifest.json` records actual texture dimensions, byte sizes, triangles, bones, source hashes, and published hashes.

The asset contract tests check actual binary chunks, local resources, skin attributes, peaceful clips, licensing inventory, byte/triangle/bone counts, and checksums. Art quality, correct world size, and animation appearance still require the tour's browser review.

## Source license evidence

The original Ultimate Animated Animals `License.txt` came from:

`https://drive.google.com/uc?export=download&id=1F2uy8T2fRpdc6gZ4mnS02_C2E63WvKtn`

SHA-256: `83d8959f9fc56353ed571fbe2dc52e4bcd64508e2399501cd45ac2ce3df0bf8c`.

It is preserved as `licenses/Quaternius-ultimate-pack.txt`. The selected historical downloads are CC0. The four new Quaternius models are identified individually on Poly Pizza and the original [Easy Enemy](https://quaternius.com/packs/easyenemy.html) and [Animated Fish](https://quaternius.com/packs/animatedfish.html) pack pages. These licenses do not imply permission for unrelated newer Quaternius packs.

The Google Poly models remain CC BY 3.0, including attribution, license links, original model identification, and notices of changes in the visible tour credits. No source license is inferred from the site's general search results. Exact individual pages and direct binary downloads are recorded in `additional-sources.ts` and the generated manifest.
