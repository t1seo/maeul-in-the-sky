# Cosmio - Brainstorm Document

> An open-source tool that transforms GitHub contribution data into space-themed animated SVGs
>
> **Product Name: Cosmio** (Cosmos + io)

## 1. Project Overview

### Goal

Build an **artistic and premium** contribution visualization tool that differentiates itself from existing GitHub profile decoration tools (snake, 3D contrib).

### Decisions

| Item | Decision |
|------|----------|
| Project Name | **Cosmio** |
| Theme | Space (4 views) |
| Tech Stack | TypeScript + Node.js |
| Output Format | Animated SVG (dark/light mode) |
| Automation | GitHub Action |
| Extras | Stats overlay, custom title |
| Test User | `t1seo` |

---

## 2. Competitive Analysis

| Project | Theme | Limitation |
|---------|-------|-----------|
| [Platane/snk](https://github.com/Platane/snk) | Snake game | Cute but not premium |
| [3D Contrib](https://github.com/yoshi389111/github-profile-3d-contrib) | 3D bar chart | Data-viz feel, lacks emotion |
| [GitHub Skyline](https://github.com/github/gh-skyline) | 3D city | Cannot embed in profile README (STL) |
| [Space Shooter](https://www.producthunt.com/products/github-space-shooter) | Space shooter | Game-focused, not refined |
| [Pac-Man Contrib](https://github.com/abozanona/pacman-contribution-graph) | Pac-Man | Retro, far from premium |

**Key Finding**: No "premium, refined" contribution view with a space theme exists yet. Blue ocean.

---

## 3. Four Themes in Detail

### Phase 1: Nebula Map

Represents contribution intensity as **nebula brightness and color**.

- High contribution days = bright, hot stars (white/blue)
- Low contribution days = dark interstellar dust
- The entire graph forms a single nebula image
- **Animation**: Nebula pulses slowly like breathing (simplex noise-based)
- **Differentiator**: Completely breaks away from grid format; organic forms

### Phase 2: Constellation

Transforms 52 weeks × 7 days of contribution data into a **star chart**.

- Contribution days = stars (brightness = contribution count)
- No-contribution days = empty sky
- Consecutive contribution days are connected by lines to form **auto-generated constellations**
- Longer streaks produce larger/more complex constellation patterns
- **Animation**: Stars twinkle, constellation lines draw one by one
- **Differentiator**: Contribution patterns become constellations (data = art)

### Phase 3: Space Voyage

Represents contributions from the start of the year to the present as a **spaceship's voyage path**.

- Contribution days = flight segments (bright trajectory)
- No-contribution days = drift/float
- Planets/asteroids at milestones (100, 500, 1000 contributions)
- Contribution streaks = warp drive segments (light trail effect)
- Progress indicator toward final destination
- **Animation**: Ship moves along the path, stars flow backward
- **Differentiator**: Storytelling + progress tracking. Dynamic and engaging

### Phase 4: Alien Defense

Uses the contribution graph grid as a **defense grid**.

- Cells with contributions = defense units/turrets placed
- Empty cells = open space
- Alien fleet descends from above; contribution units defend
- More contributions = stronger defense = more aliens destroyed
- **Animation**: Shooting effects, explosions, alien movement
- **Differentiator**: Satisfies both gameplay fun and visual appeal

---

## 4. Common Requirements

### Dark/Light Mode
- Generate dark/light version SVGs for each theme
- Use GitHub `<picture>` tag with `prefers-color-scheme` auto-detection

### Stats Overlay
- Total contributions
- Longest streak
- Most active day of the week
- Current consecutive contribution days

### Custom Title
- Username or user-defined text
- Refined font styling matching the space theme

---

## 5. Architecture

```
cosmio/
├── src/
│   ├── api/              # GitHub GraphQL API data collection
│   │   ├── client.ts     # GraphQL client
│   │   └── queries.ts    # Contribution queries
│   ├── core/             # Common SVG rendering engine
│   │   ├── svg.ts        # SVG builder
│   │   ├── animation.ts  # Animation utilities
│   │   └── theme.ts      # Theme interface
│   ├── themes/           # Renderer for each of the 4 themes
│   │   ├── nebula/       # Phase 1
│   │   ├── constellation/# Phase 2
│   │   ├── voyage/       # Phase 3
│   │   └── defense/      # Phase 4
│   ├── utils/            # Utilities
│   │   ├── noise.ts      # Simplex noise
│   │   ├── color.ts      # Color processing
│   │   └── math.ts       # Math helpers
│   └── index.ts          # CLI entry point
├── action.yml            # GitHub Action definition
├── .github/
│   └── workflows/        # Example workflows for users
├── package.json
├── tsconfig.json
└── docs/
    └── planning/
        └── brainstorm.md # This document
```

---

## 6. Technical References

### SVG Animation Techniques
- SVG `<animate>`, `<animateTransform>` native animations
- Organic shape morphing via simplex noise
- CSS keyframes inlined within SVG

### Data Source
- GitHub GraphQL API (`contributionsCollection`)
- 52 weeks × 7 days = 364 data points
- Each cell: date, contribution count, level (0–4)

### Reference Projects
- [d3-celestial](https://github.com/ofrohn/d3-celestial) — Star chart rendering
- [thenextweb/constellation](https://github.com/thenextweb/constellation) — Constellation animation
- [simplex-noise.js](https://github.com/jwagner/simplex-noise) — Noise generation
- [Smashing Magazine - Magical SVG Techniques](https://www.smashingmagazine.com/2022/05/magical-svg-techniques/)

---

## 7. Differentiation Points

1. **vs. Existing Tools**: snake/3D contrib = "cute/practical" → Cosmio = **"artistic/premium"**
2. **Multi-theme**: Choose from 4 styles with a single Action
3. **Auto dark/light**: Syncs with GitHub theme
4. **Open-source plugin architecture**: Community can add custom themes

---

## 8. Implementation Roadmap

| Phase | Content | Dependencies |
|-------|---------|-------------|
| 0 | Common infrastructure (API, SVG engine, CLI) | — |
| 1 | Nebula Map theme | Phase 0 |
| 2 | Constellation theme | Phase 0 |
| 3 | Space Voyage theme | Phase 0 |
| 4 | Alien Defense theme | Phase 0 |
| 5 | GitHub Action packaging | Phase 0 + at least 1 theme |
| 6 | README / Documentation / Demo | All |
