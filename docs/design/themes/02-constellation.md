# Theme 2: Constellation

> Transforms contribution data into a star chart where coding patterns become constellations

## 1. Concept

**One-liner**: Your coding patterns become constellations in the night sky

Transforms the 52w × 7d contribution grid into an **astronomical star chart** style. Contribution days become stars, and consecutive contribution days are connected by lines to form auto-generated constellations. Longer streaks produce more complex and beautiful constellation patterns.

### Mood Keywords
`classical` `astronomical` `precise` `elegant` `intellectual`

### Visual References
- 19th century star atlases (Uranometria) with detailed engraving style
- Modern astronomy apps (Stellarium, Sky Guide) with minimal constellation rendering
- Celestial observation maps with coordinate grids

---

## 2. Color Palette

### Dark Mode (GitHub Dark: `#0d1117`)

| Role | Color Name | HEX | Usage |
|------|-----------|-----|-------|
| Star Bright (L4) | Sirius White | `#FFFDF7` | Highest contribution — 1st magnitude |
| Star Medium (L3) | Polaris Gold | `#FDE68A` | High contribution — 2nd magnitude |
| Star Dim (L2) | Vega Amber | `#FBBF24` | Medium contribution — 3rd magnitude |
| Star Faint (L1) | Antares Copper | `#D97706` | Low contribution — 4th magnitude |
| No Star (L0) | — | transparent | No contribution — empty sky |
| Constellation Line | Silver Thread | `#94A3B8` | Constellation connecting lines |
| Grid Line | Night Grid | `#1E293B` | Background grid lines |
| Celestial Equator | Ecliptic Blue | `#3B82F6` | Special reference line |
| Text Primary | Moonlight | `#E2E8F0` | Title, primary text |
| Text Secondary | Star Dust | `#94A3B8` | Labels, secondary text |
| Stat Accent | Solar Gold | `#FBBF24` | Stat number emphasis |

#### Dark Mode Magnitude Mapping

```
L1 (4th mag)  →  #D97706  r=1.5px  opacity=0.6
L2 (3rd mag)  →  #FBBF24  r=2.0px  opacity=0.75
L3 (2nd mag)  →  #FDE68A  r=2.5px  opacity=0.9
L4 (1st mag)  →  #FFFDF7  r=3.5px  opacity=1.0 + glow
```

### Light Mode (GitHub Light: `#ffffff`)

| Role | Color Name | HEX | Usage |
|------|-----------|-----|-------|
| Star Bright (L4) | Midnight Core | `#1E1B4B` | Highest contribution — darkest |
| Star Medium (L3) | Deep Indigo | `#3730A3` | High contribution |
| Star Dim (L2) | Indigo | `#4F46E5` | Medium contribution |
| Star Faint (L1) | Soft Indigo | `#818CF8` | Low contribution |
| No Star (L0) | — | transparent | No contribution |
| Constellation Line | Slate Line | `#CBD5E1` | Constellation connecting lines |
| Grid Line | Light Grid | `#F1F5F9` | Background grid lines |
| Celestial Equator | Sky Blue | `#60A5FA` | Special reference line |
| Text Primary | Dark Slate | `#1E293B` | Title, primary text |
| Text Secondary | Mid Gray | `#64748B` | Labels, secondary text |
| Stat Accent | Deep Blue | `#2563EB` | Stat number emphasis |

#### Light Mode Magnitude Mapping

```
L1 (4th mag)  →  #818CF8  r=1.5px  opacity=0.5
L2 (3rd mag)  →  #4F46E5  r=2.0px  opacity=0.65
L3 (2nd mag)  →  #3730A3  r=2.5px  opacity=0.8
L4 (1st mag)  →  #1E1B4B  r=3.5px  opacity=1.0
```

---

## 3. Visual Components

### 3.1 Stars

Each contribution cell is transformed into a star.

**Star Forms**:
- L1–L2: Simple circles (`<circle>`)
- L3: Circle + subtle glow
- L4: Circle + strong glow + 4-point cross rays (lens flare)

```
L4 star structure:
  ┌ Outer glow (feGaussianBlur, r=8px, opacity=0.3)
  ├ Inner glow (feGaussianBlur, r=4px, opacity=0.5)
  ├ Core circle (r=3.5px, opacity=1.0)
  └ Cross rays (stroke-width=0.5px, length=12px, opacity=0.4)
```

**Star Placement**:
- Random offset ±2px from base grid position (natural distribution)
- L0 cells are not rendered at all (empty sky)

### 3.2 Constellation Lines

Consecutive contribution days are connected by lines to form constellations.

**Connection Rules**:
1. Consecutive days within the same week → vertical connection
2. Same weekday across adjacent weeks with consecutive contributions → horizontal connection
3. Diagonal connection → last contribution day of one week to first of the next

**Line Style**:
```
stroke-width: 0.8px
stroke: #94A3B8 (dark) / #CBD5E1 (light)
opacity: 0.5
stroke-linecap: round
```

**Pattern Classification** (by streak length):
| Streak Length | Constellation Type | Description |
|--------------|-------------------|-------------|
| 2–4 days | Binary / Triangle | Small asterism |
| 5–9 days | Trapezoid / Pentagon | Medium constellation |
| 10–20 days | Complex polygon | Major constellation |
| 21+ days | Large connected structure | Milky Way-scale formation |

### 3.3 Background Grid (Celestial Grid)

Subtle grid evoking celestial coordinates:

```
Grid spacing: weekly vertical lines + daily horizontal lines
stroke-width: 0.3px
opacity: 0.15 (dark) / 0.08 (light)
color: #1E293B (dark) / #F1F5F9 (light)
```

**Celestial Equator**:
- Special reference line crossing horizontally through center
- Color: `#3B82F6` (dark) / `#60A5FA` (light)
- `stroke-dasharray: 8 4`
- `opacity: 0.25`

### 3.4 Constellation Labels

Large constellations (10+ day streak) receive Latin-style labels:

```
Font: italic, 8px, letter-spacing: 0.08em
opacity: 0.4
color: Text Secondary

Naming convention:
  - Streak start month + Roman numeral
  - e.g., "Mar III", "Jul I", "Oct II"
```

### 3.5 Stats Overlay

| Item | Icon | Style |
|------|------|-------|
| Total | Star chart icon | Gold tone |
| Streak | Constellation pattern (3 stars) | Line emphasis |
| Active Day | 1st magnitude star (glow) | Twinkle |
| Current | Blinking cursor star | Animated |

---

## 4. Animation

### 4.1 Star Scintillation

Simulates atmospheric seeing effect on stars:

```css
@keyframes scintillation {
  0%, 100% { opacity: var(--base-opacity); r: var(--base-r); }
  25%      { opacity: calc(var(--base-opacity) * 0.7); }
  50%      { opacity: var(--base-opacity); r: calc(var(--base-r) * 1.1); }
  75%      { opacity: calc(var(--base-opacity) * 0.85); }
}

.star {
  animation: scintillation 3s ease-in-out infinite;
  /* L4 stars slower: 5s, L1 stars faster: 2s */
}
```

### 4.2 Constellation Drawing

Constellation lines draw one-by-one when SVG loads:

```css
@keyframes draw-line {
  from { stroke-dashoffset: var(--line-length); }
  to   { stroke-dashoffset: 0; }
}

.constellation-line {
  stroke-dasharray: var(--line-length);
  stroke-dashoffset: var(--line-length);
  animation: draw-line 2s ease-out forwards;
  /* Sequential delay per line: 0.1s × index */
}
```

### 4.3 Sky Rotation

Very slow parallax rotation for celestial sphere feel:

```css
@keyframes sky-rotate {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(0.5deg); }
}

.grid-layer {
  transform-origin: center;
  animation: sky-rotate 60s linear infinite alternate;
}
```

### 4.4 Lens Flare (L4 only)

1st magnitude star cross rays rotate subtly:

```css
@keyframes lens-flare {
  0%, 100% { transform: rotate(0deg); opacity: 0.3; }
  50%      { transform: rotate(15deg); opacity: 0.5; }
}

.star-l4-flare {
  animation: lens-flare 6s ease-in-out infinite;
}
```

---

## 5. SVG Filter Definitions

### Star Glow (Dark Mode)

```xml
<defs>
  <!-- L4 1st magnitude glow -->
  <filter id="star-l4-glow" x="-100%" y="-100%" width="300%" height="300%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1"/>
    <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur2"/>
    <feMerge>
      <feMergeNode in="blur1"/>
      <feMergeNode in="blur2"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>

  <!-- L3 2nd magnitude glow -->
  <filter id="star-l3-glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur"/>
    <feMerge>
      <feMergeNode in="blur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>
```

---

## 6. Accessibility Contrast Ratios

### Dark Mode (`#0d1117` background)

| Element | Color | Ratio | WCAG |
|---------|-------|-------|------|
| Title (`#E2E8F0`) | Moonlight | `13.2:1` | AAA |
| Stat Value (`#FBBF24`) | Solar Gold | `10.3:1` | AAA |
| Stat Label (`#94A3B8`) | Star Dust | `5.6:1` | AA |
| L4 Star (`#FFFDF7`) | Sirius | `15.4:1` | AAA |
| Constellation Line (`#94A3B8`) | Silver | `5.6:1` | AA |

### Light Mode (`#ffffff` background)

| Element | Color | Ratio | WCAG |
|---------|-------|-------|------|
| Title (`#1E293B`) | Dark Slate | `14.5:1` | AAA |
| Stat Value (`#2563EB`) | Deep Blue | `5.2:1` | AA |
| Stat Label (`#64748B`) | Mid Gray | `5.0:1` | AA |
| L4 Star (`#1E1B4B`) | Midnight | `15.9:1` | AAA |

---

## 7. Layout Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ☆ cosmio · @username                                          │
│                                                                 │
│  ┌─────────────────────────────────────────┐  ┌──────────────┐ │
│  │╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌│  │              │ │
│  │  ·  ★───·          ·                    │  │  ☆ 1,247     │ │
│  │╌╌╌╌╌│╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌│  │  contributions│ │
│  │     ·───★───·   ·──·                   │  │              │ │
│  │╌╌╌╌╌╌╌╌╌│╌╌╌╌╌╌╌│╌╌│╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌│  │  ═ 42 days   │ │
│  │  ·      ·   ★───★──★  Mar III    ·     │  │  longest     │ │
│  │╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌│╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌│  │              │ │
│  │         ·        ·       ·──·──·        │  │  ★ Wednesday  │ │
│  │╌ ─ ╌ ─ ╌ ─ ╌ ─ ╌ ─ ╌ ─ ╌│─ ╌ ─ ╌ ─ ╌╌│  │  most active  │ │
│  │  ·         ·     ·───·   ★  Jul I      │  │              │ │
│  │╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌│  │  ◆ 7 days    │ │
│  └─────────────────────────────────────────┘  │  current     │ │
│                                                └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Legend: ★ = L4 (1st mag)  · = L1–L3  ─ = constellation line  ╌ = grid
        ─ ─ = ecliptic line
```

---

## 8. Implementation Notes

### Auto-Generated Constellation Algorithm

```
1. Extract consecutive contribution day (streak) groups
2. Build adjacency graph for cells within each group
3. Connect using Minimum Spanning Tree (MST) algorithm
4. Add labels to large groups (10+)
5. Optimize paths to minimize line crossings
```

### Star Position Jitter

```
offset_x = hash(date) % 4 - 2  // -2px to +2px
offset_y = hash(date + seed) % 4 - 2
```

- Consistent hash-based offsets maintain position across refreshes
- Creates natural star distribution effect

### Performance Optimization

- Glow filters applied only to L3 and L4 (roughly 20% of total)
- Grid lines rendered as a single `<pattern>` element
- Constellation labels limited to 6 maximum
- Drawing animation runs only once on initial load (`forwards`)
