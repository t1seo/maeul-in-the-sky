# Maeul miniature art direction

This is the shared production specification for the September 2026 asset quality overhaul. It is subordinate to the user's priorities: improve ALL existing assets first, expand diversity second, and make high-activity days visibly rewarding.

## Visual target

A small, crafted, warm miniature village. Organic treetops have deliberate asymmetry. Buildings have convincing roofs, distinct front/side planes and a readable entrance. Rural props have recognizable silhouettes. Wonders remain distinct landmark compositions, not enlarged generic houses.

The reference principles are Townscaper's clear architectural volumes and Dorfromantik's clustered nature, adapted to our 16×7 projection, palette and tiny final display. Make original geometry; do not copy game assets.

## Shared geometry and material rules

1. Ground anchor is (x, y). Keep public renderer names, signatures and stable asset IDs.
2. Preserve existing catalog bounds whenever possible; use their available space more effectively. Never globally scale the world or expand every bound. If a specific artwork cannot fit, record the exact requested bound in the lane report for integration.
3. Light comes from upper left. Use a light/top plane, a base plane and a dark/right plane. Materials use existing AssetColors roles, not a fixed light-only palette.
4. Prefer large cohesive shapes to dozens of tiny strokes. Small display quality is the priority. A tree or house should remain identifiable at roughly 8–12px tall in a natural-width banner.
5. Shadows are short, restrained, and grounded. Do not add SVG blur/filter/foreignObject, external resources, CSS dependencies or per-instance definitions.
6. Use filled paths for flowing silhouettes and simple polygons for architecture. Merge multiple same-fill details into a path where it improves cost/readability. Do not add generic decorative rings or sparkles to every object.
7. Variants must be deliberate changes in silhouette/proportion/accessories. Preserve the meaning of the object across variants. Do not use unseeded randomness, clocks or palette-dependent geometry.
8. Preserve motion helpers and valid motion-off geometry. Moving parts must have visible static forms. New animation is not required for an artwork to count as improved.
9. Avoid halos from transparency overlap: canopy clumps should read as one object. Use 2–3 meaningful tones rather than many translucent circles.
10. Do not satisfy coverage through a universal wrapper, stroke, scale or recolor. Each exported asset renderer needs an intentional object-specific redesign or structural improvement.

## Family notes

- Pine: tiered but organic asymmetric canopy, visible trunk, short branches, clear top highlight.
- Broadleaf/fruit trees: 3–5 larger lobes, crown mass and branching structure; fruit is a small number of high-contrast clusters.
- Birch/willow/palm: retain distinct tall pale trunk, drooping canopy, or radiating fronds respectively.
- Flowers/crops/reeds: readable grouped stems and heads, root/soil contact, coherent farming rows; avoid hairline clutter.
- Animals: rounded body, distinct head/ears/beak/tail appropriate to species, plausible feet; dots alone are not a redesign.
- House/barn/inn/shop: roof thickness/overhang, two wall planes, door or window large enough to read. Their silhouettes must differ.
- Korean content: giwa/choga roof identity, timber/cream walls, restrained lattice, natural stone/terracotta; original culturally recognizable objects.
- Winter: snow caps follow the same underlying object's volumes. Spring/summer/autumn variants share the new family geometry language.
- Water/shore: silhouettes and highlights communicate form without needing the animation. Keep marine animals distinct.
- Wonders: purposeful bases, readable main mass, one iconic feature, secondary detail hierarchy. Thirty original identities remain distinguishable.

## Quality evidence

- Keep a renderer checklist with all exported functions in the owned files and what changed.
- Capture enlarged light/dark examples AND actual scene scale. Large previews alone are insufficient.
- Run focused raster bounds and relevant motion tests. Record failures honestly; do not update shared golden data without integration ownership.
- The coordinator will compare all 223 original IDs against the preserved pre-change evidence. Hash differences establish coverage only; visual review establishes quality.
- Aim for similar order of SVG node count to current art. Record material size increases rather than silently loosening performance tests.

## Implementation discipline

Use the existing TypeScript and test conventions, strict types for new code, no any/assertion escape hatches. Keep files below 250 nonblank/noncomment lines by extracting cohesive local family helpers where needed. Own only the assigned files; other workers share the workspace. Do not reformat unrelated files or update catalog registries/bounds outside your ownership.
