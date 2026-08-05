# Maeul in the Sky

Maeul in the Sky turns a GitHub contribution history into a deterministic, animated isometric village. This language names the domain concepts shared by data acquisition, terrain generation, and rendering.

## Language

**Contribution Calendar**:
A date-indexed history of GitHub contribution days grouped by Sunday-based calendar weeks. Its first and last weeks may be partial, and a requested range may span 52 or 53 weeks.
_Avoid_: Contribution grid, yearly data

**Terrain**:
The isometric world derived from a Contribution Calendar, including elevation, water, vegetation, buildings, and ambient animation.
_Avoid_: Graph, chart

**Terrain Generation**:
The complete operation that validates a request, obtains a Contribution Calendar, renders both color modes, and writes the resulting SVG files.
_Avoid_: Pipeline, workflow

**Theme**:
A rendering strategy that turns a complete Contribution Calendar into dark and light Terrain SVGs.
_Avoid_: Skin, template

**Biome**:
A deterministic environmental classification for Terrain cells, such as river, pond, or forest.
_Avoid_: Region, zone

**Season Zone**:
One of eight calendar-aligned phases used to blend seasonal colors, assets, and effects across Terrain weeks.
_Avoid_: Season bucket, period
