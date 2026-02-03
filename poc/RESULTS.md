# Rendering POC Test Results

> Test SVG: `poc/rendering-test.svg`
> Tested on: GitHub profile README via `<img>` tag

## Test Results

| # | Test | Method | Expected | Result | Notes |
|---|------|--------|----------|--------|-------|
| T1 | SMIL `<animate>` | `<animate attributeName="opacity">` | Opacity pulse | PENDING | Primary animation method |
| T2 | SMIL `<animateTransform>` | `type="rotate"` and `type="scale"` | Rotation + scale | PENDING | Primary transform method |
| T3 | CSS `@keyframes` | `animation: css-fade 2s infinite` | Opacity pulse | PENDING | Secondary animation method |
| T4 | CSS `stroke-dashoffset` | `animation: dash-draw 3s forwards` | Line drawing | PENDING | Needed for trail/constellation effects |
| T5 | `<feBlend mode="screen">` | SVG filter primitive | Colors blend additively | PENDING | Critical for Nebula dark mode |
| T6 | `<feBlend mode="multiply">` | SVG filter primitive | Colors blend multiplicatively | PENDING | Critical for Nebula light mode |
| T7 | `<feGaussianBlur>` | Glow filter via blur + merge | Circle with soft glow | PENDING | Used in all themes |
| T8 | `<feColorMatrix>` | Color transformation filter | Shifted color | PENDING | Optional enhancement |
| T9 | Transparent background | No `fill` on root `<svg>` | Shows page background through | PENDING | Core requirement |
| T10 | CSS `var()` | Custom properties in `<style>` | Cyan circle at 80% opacity | PENDING | Code organization |
| T11 | System font stack | `-apple-system, ...` in `<text>` | Readable text | PENDING | Stats overlay |
| T12 | `<radialGradient>` | SVG gradient fill | Purple-cyan gradient circle | PENDING | Nebula core effect |

## Strategy Decisions

### Animation Strategy
- **Primary**: SMIL (`<animate>`, `<animateTransform>`) — if T1, T2 pass
- **Secondary**: CSS `@keyframes` — if T3, T4 pass
- **Fallback**: Static SVG (no animation) — if all animation tests fail

### Blending Strategy
- **Primary**: SVG `<feBlend>` filter primitives — if T5, T6 pass
- **Fallback**: Simple opacity layering (no blend modes)

## How to Test

1. Push this repo to GitHub
2. In a profile README repo, add:
   ```markdown
   ![POC Test](https://raw.githubusercontent.com/t1seo/cosmio/main/poc/rendering-test.svg)
   ```
3. View on GitHub (both dark and light theme)
4. Check each test case visually
5. Update results above
