# Theme 4: Alien Defense

> Uses the contribution grid as a defense grid to fend off an alien invasion — a game-inspired visualization

## 1. Concept

**One-liner**: Your coding is the shield that defends Earth

Interprets the 52w × 7d contribution grid as a **Defense Grid**. Cells with contributions become defense turrets, while an alien fleet invades from above. More contributions mean stronger defense, resulting in more aliens destroyed.

### Mood Keywords
`dynamic` `game-like` `tense` `neon` `retro-futuristic`

### Visual References
- Space Invaders / Galaga minimal remakes
- Geometry Wars neon wireframe aesthetic
- 80s arcade fused with modern minimalism
- Cyberpunk UI neon grids

---

## 2. Color Palette

### Dark Mode (GitHub Dark: `#0d1117`)

| Role | Color Name | HEX | Usage |
|------|-----------|-----|-------|
| Turret L4 | Plasma Core | `#34D399` | Strongest unit — bright emerald |
| Turret L3 | Shield Green | `#10B981` | Strong unit |
| Turret L2 | Dim Guard | `#059669` | Medium unit |
| Turret L1 | Faint Post | `#047857` | Weak unit |
| Empty Cell (L0) | Grid Dark | `#0F1A15` | Empty grid cell |
| Grid Line | Wire Green | `#134E3A` | Grid lines |
| Alien Body | Invader Red | `#F87171` | Alien body |
| Alien Eye | Crimson | `#EF4444` | Alien eye/core |
| Alien Glow | Danger Red | `#DC2626` | Alien glow |
| Laser Beam | Neon Lime | `#A3E635` | Turret laser |
| Explosion | Flash Orange | `#FB923C` | Explosion effect |
| Explosion Core | Flash Yellow | `#FDE68A` | Explosion center |
| Shield | Barrier Cyan | `#22D3EE` | Defense shield |
| Text Primary | Terminal Green | `#D1FAE5` | Title (terminal feel) |
| Text Secondary | Dim Green | `#6EE7B7` | Secondary text |
| Stat Accent | Neon Green | `#34D399` | Stat number emphasis |
| Score Text | Arcade Gold | `#FBBF24` | Score display |

#### Dark Mode Unit Tier Mapping

```
L0 (empty)  →  #0F1A15  (dark empty grid)
L1 (weak)   →  #047857  r=3px  opacity=0.6   (scout turret)
L2 (medium) →  #059669  r=4px  opacity=0.75  (guard turret)
L3 (strong) →  #10B981  r=4px  opacity=0.9   (cannon + shield)
L4 (max)    →  #34D399  r=5px  opacity=1.0   (plasma cannon + glow)
```

### Light Mode (GitHub Light: `#ffffff`)

| Role | Color Name | HEX | Usage |
|------|-----------|-----|-------|
| Turret L4 | Deep Emerald | `#047857` | Strongest unit |
| Turret L3 | Forest | `#059669` | Strong unit |
| Turret L2 | Mint | `#10B981` | Medium unit |
| Turret L1 | Pale Mint | `#6EE7B7` | Weak unit |
| Empty Cell (L0) | Light Grid | `#F0FDF4` | Empty grid cell |
| Grid Line | Soft Green | `#BBF7D0` | Grid lines |
| Alien Body | Alert Red | `#DC2626` | Alien body |
| Alien Eye | Dark Red | `#991B1B` | Alien core |
| Laser Beam | Olive Green | `#65A30D` | Turret laser |
| Explosion | Warm Orange | `#EA580C` | Explosion effect |
| Shield | Teal | `#0D9488` | Defense shield |
| Text Primary | Dark Green | `#14532D` | Title |
| Text Secondary | Mid Green | `#166534` | Secondary text |
| Stat Accent | Emerald | `#059669` | Stat emphasis |
| Score Text | Deep Amber | `#B45309` | Score |

---

## 3. Visual Components

### 3.1 Defense Grid

Retains the 52w × 7d grid but reinterprets it with game aesthetics.

**Grid Style**:
```
Cell size: 10px × 10px
Cell spacing: 2px
Grid lines: stroke-width=0.3px, color=#134E3A (dark) / #BBF7D0 (light)

Corners: border-radius=1px (slightly rounded)
```

**Empty Cells (L0)**:
- Subtly visible empty grid cells
- Dark: `#0F1A15` fill, opacity=0.4
- Light: `#F0FDF4` fill, opacity=0.5

### 3.2 Turrets (Defense Units)

Defense units placed in cells with contributions:

| Level | Unit Form | Visual Features |
|-------|-----------|----------------|
| L1 | Small square (scout) | Solid color, no glow |
| L2 | Rounded square (guard) | Slight brightness, border |
| L3 | Circle + border (cannon) | Glow + small shield ring |
| L4 | Circle + crosshair (plasma) | Strong glow + rotating crosshair |

**L4 Turret Detail**:
```xml
<!-- L4 Plasma Cannon -->
<g class="turret-l4">
  <!-- Glow background -->
  <circle r="8" fill="#34D399" opacity="0.15" filter="url(#turret-glow)"/>
  <!-- Shield ring -->
  <circle r="6" fill="none" stroke="#22D3EE" stroke-width="0.5" opacity="0.4"/>
  <!-- Core -->
  <circle r="4" fill="#34D399"/>
  <!-- Crosshair -->
  <line x1="-7" y1="0" x2="7" y2="0" stroke="#34D399" stroke-width="0.3" opacity="0.5"/>
  <line x1="0" y1="-7" x2="0" y2="7" stroke="#34D399" stroke-width="0.3" opacity="0.5"/>
</g>
```

### 3.3 Alien Fleet

Aliens invading from the top:

**Alien Forms**: Minimal geometric icons (8px × 8px)

```
Type A (normal):  ∇ inverted triangle (Invader Red)
Type B (enhanced): ◇ diamond (Invader Red + glow)
Type C (boss):    ⬡ hexagon (Danger Red + strong glow)
```

**Placement**:
- 3 rows descending from top
- Penetrate through empty cells (L0) — undefended areas are breached
- Destroyed when reaching turret cells (laser + explosion)
- L4 turrets auto-destroy aliens within 2-cell range

**Alien Count**: inversely proportional to contribution volume
```
total_aliens = max(15, 50 - (total_contributions / 100))
destroyed = proportional to contribution ratio
surviving = total_aliens - destroyed
```

### 3.4 Laser Beams

Lasers fired from turrets toward aliens:

```
Color: Neon Lime (#A3E635)
stroke-width: 1px (L1–L2) / 1.5px (L3) / 2px (L4)
opacity: 0.7

Path: turret position → nearest alien position
Form: straight line (slight angle variation for natural feel)
```

### 3.5 Explosions

Explosion when an alien is destroyed:

```
Core: Flash Yellow (#FDE68A), r=3px
Outer: Flash Orange (#FB923C), r=6px
Debris: 4–6 small dots radiating outward
```

### 3.6 Shield Bar

Overall defense strength gauge at bottom:

```
┌──────────────────────────────────────────────┐
│ SHIELD ████████████████░░░░░░░░░ 67%         │
└──────────────────────────────────────────────┘

Color: Barrier Cyan (#22D3EE)
Background: Grid Dark / Light Grid
Height: 4px
```

Defense power = (cells with contributions / total cells) × 100%

### 3.7 Scoreboard

Arcade-style score display:

```
SCORE: 001,247    HIGH: 001,500    STREAK: 042

Font: monospace, 11px, bold
Color: Arcade Gold (#FBBF24) (dark) / Deep Amber (#B45309) (light)
letter-spacing: 0.08em
```

### 3.8 Stats Overlay

| Item | Display Format | Icon |
|------|---------------|------|
| Total | `SCORE: 001,247` | Arcade font |
| Streak | `COMBO: ×42` | Combo counter |
| Active Day | `MVP: WED` | Star icon |
| Current | `STREAK: 007` | Blinking text |

---

## 4. Animation

### 4.1 Alien Descent

Aliens slowly descend from above:

```css
@keyframes alien-descend {
  0%   { transform: translateY(-20px); opacity: 0; }
  10%  { opacity: 1; }
  100% { transform: translateY(var(--stop-y)); opacity: 1; }
}

.alien {
  animation: alien-descend 5s ease-out forwards;
  /* Staggered delay per alien: 0.2s × index */
}
```

### 4.2 Alien Sway

Space Invaders-style left-right movement:

```css
@keyframes alien-sway {
  0%, 100% { transform: translateX(0); }
  50%      { transform: translateX(4px); }
}

.alien-row {
  animation: alien-sway 3s ease-in-out infinite;
  /* 0.5s delay per row for wave effect */
}
```

### 4.3 Laser Fire

Lasers fire from turrets:

```css
@keyframes laser-fire {
  0%   { stroke-dashoffset: var(--beam-length); opacity: 0; }
  20%  { opacity: 0.8; }
  80%  { opacity: 0.8; }
  100% { stroke-dashoffset: 0; opacity: 0; }
}

.laser-beam {
  stroke-dasharray: var(--beam-length);
  animation: laser-fire 1.5s ease-out forwards;
  /* Triggers when alien enters turret range */
}
```

### 4.4 Explosion

```css
@keyframes explode {
  0%   { transform: scale(0); opacity: 1; }
  50%  { transform: scale(1.5); opacity: 0.8; }
  100% { transform: scale(2); opacity: 0; }
}

.explosion {
  animation: explode 0.6s ease-out forwards;
}
```

### 4.5 Turret Idle

Subtle pulsing for L3–L4 turrets:

```css
@keyframes turret-pulse {
  0%, 100% { filter: brightness(1); }
  50%      { filter: brightness(1.3); }
}

.turret-l3, .turret-l4 {
  animation: turret-pulse 2s ease-in-out infinite;
}
```

### 4.6 Shield Charge

Shield bar fills left-to-right:

```css
@keyframes shield-fill {
  from { width: 0; }
  to   { width: var(--shield-percent); }
}

.shield-bar-fill {
  animation: shield-fill 3s ease-out forwards;
}
```

### 4.7 Score Count-Up

Score counts up from 0 (SMIL-based):

```xml
<text class="score-value">
  <animate attributeName="textContent"
    from="000,000" to="001,247"
    dur="3s" fill="freeze"/>
</text>
```

> Note: SVG textContent animation is limited.
> Alternative: sequentially display multiple `<text>` elements

---

## 5. SVG Filter Definitions

### Neon Glow (Dark Mode)

```xml
<defs>
  <!-- Turret glow (green) -->
  <filter id="turret-glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
    <feColorMatrix in="blur" type="matrix"
      values="0 0 0 0 0.204
              0 0 0 0 0.827
              0 0 0 0 0.6
              0 0 0 0.5 0" result="green-glow"/>
    <feMerge>
      <feMergeNode in="green-glow"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>

  <!-- Alien glow (red) -->
  <filter id="alien-glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur"/>
    <feColorMatrix in="blur" type="matrix"
      values="0 0 0 0 0.863
              0 0 0 0 0.196
              0 0 0 0 0.196
              0 0 0 0.4 0" result="red-glow"/>
    <feMerge>
      <feMergeNode in="red-glow"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>

  <!-- Explosion glow -->
  <filter id="explosion-glow" x="-100%" y="-100%" width="300%" height="300%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
    <feMerge>
      <feMergeNode in="blur"/>
      <feMergeNode in="blur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>

  <!-- Laser beam -->
  <filter id="laser-glow" x="-20%" y="-40%" width="140%" height="180%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur"/>
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
| Title (`#D1FAE5`) | Terminal Green | `12.5:1` | AAA |
| Score (`#FBBF24`) | Arcade Gold | `10.3:1` | AAA |
| Stat Label (`#6EE7B7`) | Dim Green | `8.9:1` | AAA |
| L4 Turret (`#34D399`) | Plasma Core | `8.2:1` | AAA |
| Alien (`#F87171`) | Invader Red | `6.1:1` | AA |
| Laser (`#A3E635`) | Neon Lime | `9.5:1` | AAA |

### Light Mode (`#ffffff` background)

| Element | Color | Ratio | WCAG |
|---------|-------|-------|------|
| Title (`#14532D`) | Dark Green | `11.8:1` | AAA |
| Score (`#B45309`) | Deep Amber | `5.1:1` | AA |
| Stat Label (`#166534`) | Mid Green | `8.7:1` | AAA |
| L4 Turret (`#047857`) | Deep Emerald | `5.9:1` | AA |
| Alien (`#DC2626`) | Alert Red | `4.6:1` | AA |

---

## 7. Layout Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ⚔ COSMIO DEFENSE · @username       SCORE: 001,247  HI: 001,500│
│                                                                 │
│  ┌─────────────────────────────────────────┐  ┌──────────────┐ │
│  │  ∇  ∇     ∇  ∇  ∇     ∇     ∇  ∇      │  │              │ │
│  │    ∇  ∇  ∇     ∇    ∇    ∇  ∇     ∇    │  │  SCORE       │ │
│  │       │  │           │         │        │  │  001,247     │ │
│  │       ╳  │     ╳     │         ╳    ╳   │  │              │ │
│  │       │  │     │     │         │    │   │  │  COMBO       │ │
│  │  ■ ■  ●  ●  ■  ●  ■  ◉  ■  ■  ●  ◉    │  │  ×42         │ │
│  │  ■ ●  ◉  ●  ●  ◉  ■  ●  ■  ●  ◉  ●    │  │              │ │
│  │     ●  ●  ●  ■  ●  ●  ◉  ■  ●  ●  ●   │  │  MVP: WED    │ │
│  │  ●  ■     ●  ●     ●  ●     ●  ■  ●    │  │              │ │
│  │  ■  ●  ●  ■  ●  ■     ●  ●  ■  ●  ■    │  │  STREAK      │ │
│  │  ●  ●  ◉     ●  ●  ●  ●  ■  ●  ◉  ●    │  │  007 ▮       │ │
│  │  ■     ●  ●  ■  ●  ■  ●  ●  ●  ●  ●    │  │              │ │
│  └─────────────────────────────────────────┘  └──────────────┘ │
│                                                                 │
│  SHIELD ████████████████░░░░░░░░░ 67%   ALIENS DESTROYED: 83%  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Legend: ∇ = alien   ◉ = L4 turret   ● = L2–L3 turret   ■ = L1 / empty
        │ = laser   ╳ = explosion
```

---

## 8. Implementation Notes

### Alien Placement Algorithm

```
1. Calculate total_contributions
2. aliens_count = clamp(50 - contributions/100, 15, 50)
3. Place aliens in 3 rows (top 3 rows)
4. Set penetration paths primarily through L0 cells
5. Nearest turret fires laser at lowest alien in each column
```

### Destruction Logic

```
for each turret:
  range = turret.level  // L1=1 cell, L2=1, L3=2, L4=2
  targets = aliens within range (Manhattan distance)
  if targets.length > 0:
    fire laser at closest target
    mark target as destroyed
```

### Game Balance

| Contributions | Defense Rate | Surviving Aliens | Feel |
|--------------|-------------|-----------------|------|
| 0–100 | ~20% | Many | Crisis mode |
| 100–500 | ~50% | Half | Fierce battle |
| 500–1000 | ~75% | Few | Strong defense |
| 1000+ | ~90% | Almost none | Perfect defense |

### Performance Optimization

- Aliens capped at 50 max
- Laser beams: 20 max simultaneous
- Explosion effects: 10 max simultaneous
- Grid cells rendered as `<rect>` elements (no paths needed)
- Turret icons reused via `<symbol>` + `<use>` per level
- Glow filters applied only to L3–L4 turrets and aliens
