# Theme 3: Space Voyage

> Represents contributions from year start to present as a spaceship's voyage path — a storytelling visualization

## 1. Concept

**One-liner**: A year of coding becomes a voyage across the galaxy

Represents contributions from January to the present as a **spaceship's flight path**. Contribution days become bright trajectory segments, no-contribution days become drift zones. The ship passes planets and asteroids at major milestones (100, 500, 1000 contributions).

### Mood Keywords
`adventurous` `dynamic` `storytelling` `progression` `futuristic`

### Visual References
- Interstellar, The Expanse navigation chart UI
- Mass Effect Galaxy Map interface
- Minimalist space route diagrams
- 80s Tron neon grid (modernized)

---

## 2. Color Palette

### Dark Mode (GitHub Dark: `#0d1117`)

| Role | Color Name | HEX | Usage |
|------|-----------|-----|-------|
| Active Trail | Warp Cyan | `#22D3EE` | Contribution days — bright trajectory |
| Trail Glow | Engine Blue | `#0EA5E9` | Trail outer glow |
| Drift Trail | Drift Gray | `#334155` | No-contribution — drift zone |
| Warp Drive | Hyperdrive White | `#F0F9FF` | Streak segments — warp effect |
| Ship Body | Titanium | `#CBD5E1` | Spaceship body |
| Ship Engine | Plasma Orange | `#FB923C` | Engine flame |
| Planet 1 | Mars Red | `#F87171` | Milestone planet (100) |
| Planet 2 | Jupiter Amber | `#FBBF24` | Milestone planet (500) |
| Planet 3 | Neptune Blue | `#60A5FA` | Milestone planet (1000) |
| Asteroid | Rock Gray | `#64748B` | Asteroid decorations |
| Star BG | Faint Star | `#1E293B` | Background stars |
| Text Primary | HUD White | `#E2E8F0` | Title, primary text |
| Text Secondary | HUD Gray | `#94A3B8` | Secondary text, labels |
| Stat Accent | Neon Cyan | `#22D3EE` | Stat number emphasis |
| Progress Bar BG | Dark Track | `#1E293B` | Progress bar background |
| Progress Bar Fill | Gradient | `#0EA5E9 → #22D3EE` | Progress bar fill |

#### Dark Mode Trail Intensity Mapping

```
L0 (drift)  →  #334155  stroke-width=1px   dash: 4 8    opacity=0.3
L1 (cruise) →  #0EA5E9  stroke-width=1.5px solid       opacity=0.5
L2 (accel)  →  #22D3EE  stroke-width=2px   solid       opacity=0.7
L3 (fast)   →  #22D3EE  stroke-width=2.5px solid+glow  opacity=0.85
L4 (warp)   →  #F0F9FF  stroke-width=3px   solid+glow  opacity=1.0
```

### Light Mode (GitHub Light: `#ffffff`)

| Role | Color Name | HEX | Usage |
|------|-----------|-----|-------|
| Active Trail | Deep Teal | `#0D9488` | Contribution days — trajectory |
| Trail Glow | Teal | `#14B8A6` | Trail outer edge |
| Drift Trail | Light Drift | `#E2E8F0` | Drift zone |
| Warp Drive | Dark Teal | `#0F766E` | Warp effect |
| Ship Body | Slate | `#475569` | Spaceship body |
| Ship Engine | Warm Orange | `#EA580C` | Engine flame |
| Planet 1 | Coral | `#DC2626` | Milestone (100) |
| Planet 2 | Amber | `#D97706` | Milestone (500) |
| Planet 3 | Royal Blue | `#2563EB` | Milestone (1000) |
| Asteroid | Mid Gray | `#94A3B8` | Asteroids |
| Star BG | Faint Dot | `#CBD5E1` | Background stars |
| Text Primary | Dark Slate | `#1E293B` | Title, primary text |
| Text Secondary | Mid Slate | `#64748B` | Secondary text |
| Stat Accent | Deep Teal | `#0D9488` | Stat emphasis |

---

## 3. Visual Components

### 3.1 Flight Path (Main Visualization)

Transforms 52 weeks of data into a left-to-right trajectory.

**Path Structure**:
```
Left (Jan) ──────────────────────────→ Right (Dec / current)

Path uses smooth curves, not straight lines:
  - Each week (7 days) becomes one curve segment
  - Y position varies by weekly average contribution
  - High contribution → upward (ascent), none → downward (descent)
  - Connected with Bezier curves for smooth transitions
```

**Trajectory Visualization**:
```
High contrib ─────── ╱──╲ ────── ╱──────╲ ──── (top)
                    ╱    ╲      ╱        ╲
Medium       ──────╱──────╲────╱──────────╲──── (mid)
                  ╱        ╲  ╱            ╲
Low / none  ───╱──────────╲╱──────────────╲─── (bottom)

Jan    Feb    Mar    Apr    May    Jun ...
```

### 3.2 Spaceship

Icon indicating current position:

**Form**: Minimal geometric triangle + engine effect

```
Size: 12px × 8px
Direction: Rotates along tangent of last trajectory segment
Structure:
  ┌ Body: triangle (fill: Titanium)
  ├ Window: small circle (fill: Warp Cyan, r=1px)
  └ Engine: inverted triangle flame (fill: Plasma Orange, glow)
```

### 3.3 Milestone Planets

Planets appear on the trajectory when cumulative contributions hit specific values:

| Milestone | Planet | Size | Features |
|-----------|--------|------|----------|
| 100 | Mars (Mars Red) | r=6px | Small rocky planet, crater pattern |
| 250 | Asteroid Belt | 5–8 small dots | Asteroid cluster |
| 500 | Jupiter (Jupiter Amber) | r=10px | Large gas planet, stripe pattern |
| 750 | Saturn Ring | r=8px + ring | Ringed planet |
| 1000 | Neptune (Neptune Blue) | r=8px | Blue planet, glow effect |
| 1500+ | Black Hole | r=6px + disk | Accretion disk + lensing effect |

**Planet Detail** (SVG-implementable level):
- Simple circles + internal patterns (stripes, craters)
- Surface texture via `<pattern>` or `<linearGradient>`
- Milestone label below planet: "100 ✓", "500 ✓"

### 3.4 Warp Drive Sections

Warp effect for 7+ day consecutive contribution streaks:

```
Normal trail:  ────────────
Warp trail:    ═══════════  (thick bright line + side speed lines)

Speed line effect:
  - Short horizontal line clusters on both sides of trail
  - Length: 4px–12px, random
  - Spacing: 2px–6px
  - opacity: 0.15–0.4
  - Color: Warp Cyan → transparent gradient
```

### 3.5 Progress Bar

Annual goal progress displayed at bottom:

```
┌──────────────────────────────────────────────┐
│ ████████████████████░░░░░░░░░  67% · 847/1260│
└──────────────────────────────────────────────┘

Height: 4px
Border radius: 2px
Goal: Previous year's contribution count or user-defined value
```

### 3.6 Stats Overlay

| Item | Icon | Style |
|------|------|-------|
| Total | Trajectory icon (curve) | Cyan tone |
| Streak | Warp icon (parallel speed lines) | Bright accent |
| Active Day | Planet icon (circle) | Planet color |
| Current | Spaceship icon | Engine glow |

### 3.7 Background Elements

```
Background stars: 40–60, r=0.5–1.5px, opacity=0.2–0.5
Nebula fragments: 3–5 small blurred circles, opacity=0.05–0.1
```

---

## 4. Animation

### 4.1 Ship Travel

Spaceship moves along the trajectory to current position:

```css
@keyframes ship-travel {
  0%   { offset-distance: 0%; }
  100% { offset-distance: 100%; }
}

.spaceship {
  offset-path: path('M0,120 C100,80 200,140 300,100 ...');
  offset-rotate: auto;
  animation: ship-travel 10s ease-out forwards;
}
```

### 4.2 Trail Drawing

Trajectory draws left-to-right:

```css
@keyframes draw-trail {
  from { stroke-dashoffset: var(--trail-length); }
  to   { stroke-dashoffset: 0; }
}

.flight-path {
  stroke-dasharray: var(--trail-length);
  animation: draw-trail 8s ease-out forwards;
}
```

### 4.3 Engine Flame

Spaceship engine flame flickers:

```css
@keyframes engine-flicker {
  0%, 100% { opacity: 0.8; transform: scaleX(1); }
  25%      { opacity: 1;   transform: scaleX(1.2); }
  50%      { opacity: 0.6; transform: scaleX(0.8); }
  75%      { opacity: 0.9; transform: scaleX(1.1); }
}

.engine-flame {
  animation: engine-flicker 0.5s ease-in-out infinite;
}
```

### 4.4 Speed Lines (Warp Sections)

Speed lines flow through warp sections:

```css
@keyframes speed-line {
  0%   { transform: translateX(0); opacity: 0.4; }
  100% { transform: translateX(-20px); opacity: 0; }
}

.speed-line {
  animation: speed-line 1.5s linear infinite;
  /* Staggered delay per line: 0s – 1.5s */
}
```

### 4.5 Planet Arrival Pulse

Milestone planets pulse once upon arrival:

```css
@keyframes planet-arrive {
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.milestone-planet {
  animation: planet-arrive 0.8s ease-out forwards;
  /* delay: triggers when trail drawing reaches the planet position */
}
```

### 4.6 Parallax Stars

Background stars slowly drift left for sense of motion:

```css
@keyframes star-parallax {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-30px); }
}

.bg-stars {
  animation: star-parallax 30s linear infinite;
}
```

---

## 5. SVG Filter Definitions

### Trail Glow (Dark Mode)

```xml
<defs>
  <!-- Active trail glow -->
  <filter id="trail-glow" x="-20%" y="-40%" width="140%" height="180%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
    <feColorMatrix in="blur" type="matrix"
      values="0 0 0 0 0.133
              0 0 0 0 0.827
              0 0 0 0 0.933
              0 0 0 0.6 0" result="colored-blur"/>
    <feMerge>
      <feMergeNode in="colored-blur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>

  <!-- Warp drive glow -->
  <filter id="warp-glow" x="-10%" y="-50%" width="120%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
    <feMerge>
      <feMergeNode in="blur"/>
      <feMergeNode in="blur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>

  <!-- Engine flame -->
  <radialGradient id="engine-gradient" cx="0%" cy="50%">
    <stop offset="0%"  stop-color="#FB923C" stop-opacity="1"/>
    <stop offset="50%" stop-color="#FB923C" stop-opacity="0.5"/>
    <stop offset="100%" stop-color="#22D3EE" stop-opacity="0"/>
  </radialGradient>
</defs>
```

---

## 6. Accessibility Contrast Ratios

### Dark Mode (`#0d1117` background)

| Element | Color | Ratio | WCAG |
|---------|-------|-------|------|
| Title (`#E2E8F0`) | HUD White | `13.2:1` | AAA |
| Stat Value (`#22D3EE`) | Neon Cyan | `9.1:1` | AAA |
| Stat Label (`#94A3B8`) | HUD Gray | `5.6:1` | AA |
| Active Trail (`#22D3EE`) | Warp Cyan | `9.1:1` | AAA |
| Planet Label | Per planet color | `4.5:1+` | AA |

### Light Mode (`#ffffff` background)

| Element | Color | Ratio | WCAG |
|---------|-------|-------|------|
| Title (`#1E293B`) | Dark Slate | `14.5:1` | AAA |
| Stat Value (`#0D9488`) | Deep Teal | `4.6:1` | AA |
| Stat Label (`#64748B`) | Mid Slate | `5.0:1` | AA |
| Active Trail (`#0D9488`) | Deep Teal | `4.6:1` | AA |

---

## 7. Layout Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  🚀 cosmio · @username                          ┌────────────┐ │
│                                                  │ ✦ 1,247    │ │
│        ●100            ●500         ●1000        │ contribs   │ │
│         │               │             │          │            │ │
│    ╱──╲ ▼          ╱──╲ ▼        ╱──╲ ▼          │ ═ 42 days  │ │
│   ╱    ╲──────────╱    ╲───────╱    ╲            │ longest    │ │
│  ╱      ╲        ╱      ╲    ╱      ╲    ▶      │            │ │
│ ╱ - - - -╲- - - ╱- - - - ╲- ╱        ╲         │ ⊕ Wed      │ │
│            ╲   ╱            ╳          ╲         │ active     │ │
│             ╲ ╱              ╲          ╲        │            │ │
│              v                v          v       │ ● 7 days   │ │
│                                                  │ current    │ │
│  Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep ... └────────────┘ │
│                                                                 │
│  ████████████████████░░░░░░░░░  67% · 847/1260 contributions   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Legend: ╱╲ = high contribution  v = no contribution  ════ = warp streak
        ▶ = spaceship  ● = milestone planet  ████ = progress bar
```

---

## 8. Implementation Notes

### Trajectory Path Generation

```
1. Average 52 weeks of data per-week
2. Map weekly average → y-coordinate (high contribution = top, low = bottom)
3. Place at evenly-spaced x-coordinates left to right
4. Generate smooth curve via Catmull-Rom spline
5. Convert curve to SVG path 'd' attribute
```

### Y-Coordinate Mapping

```
y_min = 30px  (max contribution = top)
y_max = 190px (min contribution = bottom)
y_center = 110px

y = y_center - (weeklyAvg / maxWeeklyAvg) × (y_center - y_min)
```

### Milestone Position Calculation

```
cumulative = 0
for each week:
  cumulative += weekTotal
  if cumulative crosses milestone:
    place planet at (week_x, path_y_at_week_x)
```

### Performance Optimization

- Trajectory rendered as a single `<path>` element
- Warp section speed lines limited to 20 max
- Background star parallax applied to single `<g>` group
- Planet details reused via `<symbol>` + `<use>`
