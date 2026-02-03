# Theme 1: Nebula Map

> Visualizes contribution intensity as the brightness and color of a nebula — an organic, flowing representation

## 1. Concept

**One-liner**: Your coding activity becomes the light of a cosmic nebula

Completely breaks away from the traditional GitHub contribution grid, reinterpreting 364 data points as **organic nebula forms**. High-contribution areas glow like bright, hot stars, while no-contribution areas appear as dark interstellar dust.

### Mood Keywords
`mysterious` `awe-inspiring` `organic` `deep` `immersive`

### Visual References
- Hubble Space Telescope's Carina Nebula / Pillars of Creation
- James Webb Space Telescope's infrared nebula imagery (warm tones)
- Simplex noise-based procedural generation patterns

---

## 2. Color Palette

### Dark Mode (GitHub Dark: `#0d1117`)

| Role | Color Name | HEX | Usage |
|------|-----------|-----|-------|
| Nebula Core (L4) | Supernova White | `#F0E6FF` | Highest contribution — brightest core |
| Nebula Hot (L3) | Plasma Cyan | `#7DD3FC` | High contribution — hot gas |
| Nebula Warm (L2) | Astral Violet | `#A78BFA` | Medium contribution — nebula center |
| Nebula Cool (L1) | Deep Orchid | `#7C3AED` | Low contribution — nebula edge |
| Nebula Dust (L0) | Void Indigo | `#1E1048` | No contribution — interstellar dust |
| Glow Accent | Nebula Rose | `#F472B6` | Highlight, pink glow |
| Star Particle | Starlight | `#FDE68A` | Star particles, fine points |
| Text Primary | Lunar White | `#E2E8F0` | Title, primary text |
| Text Secondary | Dust Gray | `#94A3B8` | Secondary text, labels |
| Stat Accent | Soft Cyan | `#67E8F9` | Stat number emphasis |

#### Dark Mode Gradient

```
L0 → L1 → L2 → L3 → L4
#1E1048 → #7C3AED → #A78BFA → #7DD3FC → #F0E6FF
```

#### Secondary Gradient (Pink)

```
#2D1B69 → #7C3AED → #C084FC → #F472B6 → #FDE68A
```

### Light Mode (GitHub Light: `#ffffff`)

| Role | Color Name | HEX | Usage |
|------|-----------|-----|-------|
| Nebula Core (L4) | Deep Cosmos | `#5B21B6` | Highest contribution — darkest core |
| Nebula Hot (L3) | Royal Violet | `#7C3AED` | High contribution |
| Nebula Warm (L2) | Lavender | `#A78BFA` | Medium contribution |
| Nebula Cool (L1) | Mist Violet | `#C4B5FD` | Low contribution |
| Nebula Dust (L0) | Faint Haze | `#EDE9FE` | No contribution — faint mist |
| Glow Accent | Berry Pink | `#DB2777` | Highlight |
| Star Particle | Amber Glow | `#D97706` | Star particle points |
| Text Primary | Deep Slate | `#1E293B` | Title, primary text |
| Text Secondary | Mid Slate | `#64748B` | Secondary text |
| Stat Accent | Indigo | `#4F46E5` | Stat number emphasis |

#### Light Mode Gradient

```
L0 → L1 → L2 → L3 → L4
#EDE9FE → #C4B5FD → #A78BFA → #7C3AED → #5B21B6
```

---

## 3. Visual Components

### 3.1 Nebula Body (Main Visualization)

Transforms 52w × 7d data into nebula forms.

**Rendering Method**:
1. Generate **radial gradient circles** centered on each contribution cell
2. Distort circle boundaries irregularly using simplex noise
3. Blend gradients of adjacent cells naturally
4. Use `mix-blend-mode: screen` (dark) / `multiply` (light) for light overlap

```
Cell size: 10px × 10px (base grid)
Glow radius: Level × 6px (L1=6px, L2=12px, L3=18px, L4=24px)
Blur radius: Level × 3px
```

### 3.2 Star Particles (Background Stars)

Fine stars scattered behind the nebula:

| Property | Value |
|----------|-------|
| Count | 60–80 |
| Size | `0.5px – 2px` |
| Color (Dark) | `#FDE68A` (80%), `#FFFFFF` (20%) |
| Color (Light) | `#D97706` (60%), `#A78BFA` (40%) |
| Opacity | `0.3 – 0.8` |

### 3.3 Nebula Filaments

Gas tendrils within the nebula:

- SVG `<path>` elements for curves
- Simplex noise-based paths
- `stroke-width: 0.5px – 1.5px`
- `opacity: 0.15 – 0.35`
- Colors: complementary tones from the nebula palette (`#F472B6`, `#67E8F9`)

### 3.4 Stats Overlay

| Item | Icon | Style |
|------|------|-------|
| Total | Small nebula icon (3 overlapping circles) | Glow effect |
| Streak | Light rays (3 parallel lines) | Gradient |
| Active Day | Bright star (4-point) | Twinkle |
| Current | Pulsing dot | Animated |

---

## 4. Animation

### 4.1 Nebula Breathing

The entire nebula slowly expands and contracts as if breathing.

```css
@keyframes nebula-breathe {
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50%      { opacity: 1;    transform: scale(1.02); }
}

.nebula-glow {
  animation: nebula-breathe 8s ease-in-out infinite;
}
```

- Duration: `6s – 10s` (randomly distributed)
- Each nebula cluster pulses at different timing for asynchronous breathing

### 4.2 Star Twinkle

Subtle twinkling of background stars:

```css
@keyframes star-twinkle {
  0%, 100% { opacity: 0.3; }
  50%      { opacity: 0.9; }
}

.star {
  animation: star-twinkle 3s ease-in-out infinite;
  /* Random animation-delay per star: 0s – 3s */
}
```

### 4.3 Color Shift

Subtle hue drift of the nebula:

```css
@keyframes color-drift {
  0%, 100% { filter: hue-rotate(0deg); }
  50%      { filter: hue-rotate(15deg); }
}

.nebula-body {
  animation: color-drift 20s ease-in-out infinite;
}
```

### 4.4 Filament Flow

Gas tendrils slowly drifting:

```css
@keyframes filament-drift {
  0%   { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -200; }
}

.filament {
  stroke-dasharray: 100 50;
  animation: filament-drift 30s linear infinite;
}
```

---

## 5. SVG Filter Definitions

### Dark Mode Glow Filters

```xml
<defs>
  <!-- Nebula glow -->
  <filter id="nebula-glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
  </filter>

  <!-- Star glow -->
  <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur"/>
    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
  </filter>

  <!-- Nebula radial gradient (L4 example) -->
  <radialGradient id="nebula-l4" cx="50%" cy="50%" r="50%">
    <stop offset="0%"   stop-color="#F0E6FF" stop-opacity="0.95"/>
    <stop offset="40%"  stop-color="#7DD3FC" stop-opacity="0.6"/>
    <stop offset="70%"  stop-color="#A78BFA" stop-opacity="0.3"/>
    <stop offset="100%" stop-color="#7C3AED" stop-opacity="0"/>
  </radialGradient>
</defs>
```

### Light Mode Glow Filters

```xml
<defs>
  <filter id="nebula-glow-light" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
    <feComposite in="SourceGraphic" in2="blur" operator="over"/>
  </filter>

  <radialGradient id="nebula-l4-light" cx="50%" cy="50%" r="50%">
    <stop offset="0%"   stop-color="#5B21B6" stop-opacity="0.9"/>
    <stop offset="40%"  stop-color="#7C3AED" stop-opacity="0.6"/>
    <stop offset="70%"  stop-color="#A78BFA" stop-opacity="0.3"/>
    <stop offset="100%" stop-color="#C4B5FD" stop-opacity="0"/>
  </radialGradient>
</defs>
```

---

## 6. Accessibility Contrast Ratios

### Dark Mode (`#0d1117` background)

| Element | Color | Ratio | WCAG |
|---------|-------|-------|------|
| Title (`#E2E8F0`) | Lunar White | `13.2:1` | AAA |
| Stat Value (`#67E8F9`) | Soft Cyan | `9.8:1` | AAA |
| Stat Label (`#94A3B8`) | Dust Gray | `5.6:1` | AA |
| L4 Core (`#F0E6FF`) | Supernova | `14.1:1` | AAA |
| L1 Edge (`#7C3AED`) | Deep Orchid | `3.5:1` | Decorative |

### Light Mode (`#ffffff` background)

| Element | Color | Ratio | WCAG |
|---------|-------|-------|------|
| Title (`#1E293B`) | Deep Slate | `14.5:1` | AAA |
| Stat Value (`#4F46E5`) | Indigo | `6.3:1` | AA |
| Stat Label (`#64748B`) | Mid Slate | `5.0:1` | AA |
| L4 Core (`#5B21B6`) | Deep Cosmos | `8.2:1` | AAA |

---

## 7. Layout Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ✦ cosmio · @username                                          │
│                                                                 │
│  ┌─────────────────────────────────────────┐  ┌──────────────┐ │
│  │ ·  ·          ·                         │  │              │ │
│  │      ░░▒▓█ ·      ·                     │  │  ✦ 1,247     │ │
│  │   ░░▒▒▓▓██▓▒░   ·      ░░▒▒▓░          │  │  contributions│ │
│  │  ░▒▒▓▓████▓▓▒░       ░▒▒▓▓█▓▒░  ·      │  │              │ │
│  │   ░▒▒▓▓██▓▒░░     ░▒▒▓▓██▓▓▒░░         │  │  ═ 42 days   │ │
│  │  ·  ░░▒▒▓▒░░  ·    ░░▒▒▓▓▒░░    ·      │  │  longest     │ │
│  │       ░░░           ░░▒░░   ·           │  │              │ │
│  │  ·        ·     ·          ·       ·    │  │  ★ Wednesday  │ │
│  │      ·        ·        ·                │  │  most active  │ │
│  └─────────────────────────────────────────┘  │              │ │
│                                                │  ● 7 days    │ │
│                                                │  current     │ │
│                                                └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Implementation Notes

### Simplex Noise Application

```
noise(x, y) → [-1, 1]

Nebula boundary distortion:
  radius_final = base_radius + noise(x * 0.05, y * 0.05) * amplitude

amplitude = Level × 3px
frequency = 0.05 (lower = smoother forms)
```

### Blending Strategy

- Dark: overlay each cell's glow with `screen` blending → bright areas naturally add up
- Light: use `multiply` blending → dark areas naturally stack
- Adjust spacing so adjacent cell glows overlap by 40%+

### Performance Optimization

- Apply `feGaussianBlur` only once to the entire group (not per-cell)
- Wrap the entire nebula in a single `<g>` group and apply filter to the group
- Star particles use only `opacity` for twinkle (no filters)
