# Village model preparation

The village catalog vendors 36 self-contained, core glTF 2.0 binary models. Runtime rendering uses only the local files under `docs/demo/tour/models/village/`. No model CDN, decompression extension or remote executable is needed in the browser.

`sources.json` pins the exact input file hashes, source model pages, download URLs, resource hashes, creators and licenses. The Quaternius selections use the historical per-model CC0 releases recorded on Poly Pizza; this does not claim that all current Quaternius packs use CC0. Kenney and KayKit include their original notices alongside full CC0 and CC BY license texts. The Korean kit's publisher discloses AI generation with Claude Opus 5; that disclosure is retained in the source metadata.

To reproduce the models, download the pinned inputs into a cache directory using each record's `input` path. Extract the pinned Kenney archive under `kenney-town/`, preserve the KayKit glTF buffer/image directory structure, and put the Korean kit inputs in `korean-hanok/`. The checked input hashes reject changed downloads before loading. Then run the existing project toolchain:

```sh
npx tsx scripts/authored/village/prepare.ts /absolute/path/to/buildings-candidates
npx vitest run --project unit tests/tour/authored-village-binaries.test.ts tests/tour/authored-village-mapping.test.ts
```

The default cache is `.orca/tour-assets/research/buildings-candidates`. Preparation verifies every input and external resource, dequantizes the Korean models, embeds textures, bakes Kenney UV transforms, flattens transforms, and merges static primitives. Source normals and geometry are preserved. Solid material colors become normalized linear vertex colors with a rough, nonmetallic surface. The source metallic value of 0.4 on Quaternius timber is deliberately removed. Detailed modification lists, final hashes, sizes, triangles, decoded texture bytes and bounds are written to the shipping manifest.

The hanok roof tile color is darkened without changing timber, paper doors, plaster or the maru. The gate uses the final pose of its authored open animation so the two leaves remain approximately 84 degrees open. Onggi jars use a dark earthenware glaze and stay grouped on their terrace. Winter house/barn roofs keep the exact authored geometry with a snow-colored roof surface. Procedural ground snow, campfire flames, ice cream display and fountain water remain explicit composite details. Fountain surfaces match the source's two water planes at Y=0.14 and Y=0.38, scaled to the 2.7-metre basin span, with a 5-mm surface offset. Frozen fountains use ice and omit streams.

The runtime mappings use exact catalog IDs. Choga, pavilions, Korean watermills and estates, library, cathedral and clocktower keep their existing models because the selected packs do not offer an equivalent quality-approved replacement. The thatched kit item is an open shed, and the side-wing roof has visible defects, so neither replaces a Korean dwelling. The church model does not replace the winter church: its source atlas does not expose a separate roof material suitable for the same snow treatment. Hay mazes remain distinct from a single hay bale. The downloaded Kenney Fantasy Town kit has no finished logs, stump, signpost, dock or complete bridge; modular plank and wall pieces do not establish a better complete prop, so these retain their existing geometry unless the nature catalog supplies an equivalent model.

The researched Scott Marshall Eiffel Tower is retained as a future candidate, not shipped. After joining, welding and mesh simplification at error limits 0.002, 0.01 and 0.05, it still measured 2.40–2.42 MiB and about 48,000 triangles. Removing its lattice detail solely to force the 1-MiB per-model limit would not establish a quality improvement.

All prepared files have one primitive and are below 1 MiB. The complete village directory's GLB transfer is approximately 7.1 MiB; the app requests only models used in the current landscape. The complete decoded texture payload is 11.25 MiB. Chrome visual QA and scene-wide performance checks belong to the parent tour integration task.
