# Maeul Design System

> Common design system for a tool that transforms GitHub contribution data into space-themed animated SVGs

## 1. GitHub Environment Constraints

### Background Colors (where SVGs are rendered)

| Mode | Background | Surface | Border |
|------|-----------|---------|--------|
| GitHub Light | `#ffffff` | `#f6f8fa` | `#d0d7de` |
| GitHub Dark | `#0d1117` | `#161b22` | `#30363d` |

### SVG Rendering Limitations

- SVGs are rendered via `<img>` tags (external resources blocked)
- No JavaScript execution → CSS animation + SMIL only
- No external font loading → system fonts or SVG `<text>` only
- `foreignObject` is available but with some limitations
- **All SVGs must have transparent backgrounds** (rendered on top of GitHub's background)

### Dark/Light Mode Strategy

```html
<!-- Usage in GitHub README -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="maeul-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="maeul-light.svg">
  <img alt="Maeul" src="maeul-dark.svg">
</picture>
```

- Generate 2 SVG files per theme (dark / light)
- **Default to dark** (majority of developers use dark mode)

---

## 2. SVG Canvas

### Dimensions

| Property | Value |
|----------|-------|
| Width | `840px` (GitHub README max rendering width) |
| Height | `240px` (default) ~ `320px` (extended) |
| ViewBox | `0 0 840 240` |
| Aspect Ratio | 3.5:1 |

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Title Area - top padding 20px]                            │
│                                                             │
│  ┌───────────────────────────────────────────┐ ┌──────────┐ │
│  │                                           │ │ Stats    │ │
│  │         Main Visualization                │ │ Overlay  │ │
│  │         (Contribution Data)               │ │          │ │
│  │                                           │ │ Total    │ │
│  │                                           │ │ Streak   │ │
│  │                                           │ │ Best Day │ │
│  └───────────────────────────────────────────┘ └──────────┘ │
│                                                             │
│  [bottom padding 16px]                                      │
└─────────────────────────────────────────────────────────────┘
```

- **Main visualization area**: `640 × 180px`
- **Stats overlay**: `160 × 180px` (right side)
- **Title**: top-left, height `28px`

---

## 3. Typography

### Font Stack

SVG fonts use system font fallbacks:

```css
/* Title */
font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont,
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Body / Numbers */
font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono',
             'Cascadia Code', Consolas, monospace;
```

### Text Scale

| Role | Size | Weight | Letter Spacing |
|------|------|--------|----------------|
| Title | `16px` | 600 (SemiBold) | `0.02em` |
| Stat Label | `10px` | 400 (Regular) | `0.04em` |
| Stat Value | `14px` | 700 (Bold) | `0` |
| Caption | `9px` | 400 (Regular) | `0.02em` |

### Text Colors (shared across themes)

| Role | Dark Mode | Light Mode |
|------|-----------|------------|
| Title | `#e6edf3` | `#1f2328` |
| Primary Text | `#c9d1d9` | `#1f2328` |
| Secondary Text | `#8b949e` | `#656d76` |
| Muted Text | `#484f58` | `#8b949e` |

---

## 4. Animation Principles

### Performance Guidelines

- Total animated elements: **50 max** (limit SVG rendering load)
- Use frame-independent CSS animations
- No `will-change` property (unsupported in SVG)
- Minimize complex filters (`feGaussianBlur`, etc.)

### Timing

| Type | Duration | Easing |
|------|----------|--------|
| Subtle twinkle | `2s – 4s` | ease-in-out |
| Smooth pulse | `4s – 8s` | ease-in-out |
| Slow drift | `10s – 30s` | linear |
| Path animation | `5s – 15s` | ease-in-out |

### Infinite Loop

All animations use `infinite` repeat with staggered `delay` values to create natural asynchronous movement.

---

## 5. Contribution Data Mapping

### Level Definitions

| Level | Contribution Count | Meaning |
|-------|--------------------|---------|
| 0 | 0 | None |
| 1 | 1–3 | Low |
| 2 | 4–7 | Medium |
| 3 | 8–12 | High |
| 4 | 13+ | Very High |

### Data Structure

- 52 weeks × 7 days = **364** data points
- Each cell: `{ date, count, level(0–4) }`

---

## 6. Stats Overlay

Common statistics displayed across all themes:

| Item | Display Format | Icon/Symbol |
|------|---------------|-------------|
| Total Contributions | `1,234` | Theme-specific |
| Longest Streak | `42 days` | Theme-specific |
| Current Streak | `7 days` | Theme-specific |
| Most Active Day | `Wednesday` | Theme-specific |

---

## 7. Accessibility

### Contrast Ratio Requirements

| Combination | Min Contrast | Standard |
|-------------|-------------|----------|
| Title on GitHub Dark | `7:1+` | WCAG AAA |
| Stats on GitHub Dark | `4.5:1+` | WCAG AA |
| Title on GitHub Light | `7:1+` | WCAG AAA |
| Stats on GitHub Light | `4.5:1+` | WCAG AA |

### Color Vision Deficiency Support

- Never convey information through color alone (combine with size, brightness, pattern)
- Contribution levels must be distinguishable by **brightness variation** alone

---

## 8. File Naming Convention

```
maeul-{theme}-{mode}.svg

Examples:
maeul-nebula-dark.svg
maeul-nebula-light.svg
maeul-constellation-dark.svg
maeul-constellation-light.svg
maeul-voyage-dark.svg
maeul-voyage-light.svg
maeul-defense-dark.svg
maeul-defense-light.svg
```
