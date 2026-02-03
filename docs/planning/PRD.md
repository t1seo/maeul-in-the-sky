# PRD (Product Requirements Document)

## Cosmio — GitHub Contribution Visualization Tool

> **Last Updated:** 2026-02-03
> **Version:** 1.1

---

## 1. Project Overview

| Item | Details |
|------|---------|
| **Product Name** | Cosmio |
| **One-liner** | An open-source tool that transforms GitHub contribution data into artistic, space-themed animated SVGs |
| **Platform** | CLI (npm) + GitHub Action |
| **Tech Stack** | TypeScript + Node.js |
| **License** | MIT |
| **Repository** | [github.com/t1seo/cosmio](https://github.com/t1seo/cosmio) |
| **npm Package** | `cosmio` |

### 1.1 Vision & Purpose

- **Why**: Existing GitHub profile decoration tools (snake, 3D contrib, pac-man) are either cute or practical, but none achieve an **artistic, premium** aesthetic. There is a clear gap for a tool that turns contribution data into something visually stunning.

- **Pain Point**: Developers who care about their GitHub profile have limited options — most tools feel toy-like or overly data-oriented. There's no way to make contribution graphs look genuinely beautiful.

- **Solution**: Cosmio transforms 52 weeks × 7 days of contribution data into one of 4 space-themed animated SVG visualizations that auto-adapt to GitHub's dark/light mode. Set up once via GitHub Action, and the SVG updates daily.

### 1.2 Target Audience

| Persona | Description | Needs |
|---------|-------------|-------|
| **Primary** | Developers who actively maintain their GitHub profile README | Premium, artistic visualization that stands out; zero-maintenance after setup |
| **Secondary** | Open-source maintainers who want to attract contributors | Eye-catching profile that builds personal brand credibility |
| **Tertiary** | Developer community / content creators | Shareable, distinctive visual that sparks conversation |

### 1.3 Success Criteria

| Metric | Target | Timeframe |
|--------|--------|-----------|
| GitHub Stars | 500+ | 3 months after launch |
| npm Weekly Downloads | 200+ | 3 months after launch |
| GitHub Action Users | 100+ repos | 3 months after launch |
| Community Themes | 2+ contributed | 6 months after launch |

---

## 2. Competitive Analysis

| Project | Theme | Strengths | Weaknesses | Our Edge |
|---------|-------|-----------|-----------|----------|
| [Platane/snk](https://github.com/Platane/snk) | Snake game | Fun, well-known, easy setup | Cute but not premium | Artistic > cute |
| [3D Contrib](https://github.com/yoshi389111/github-profile-3d-contrib) | 3D bar chart | Data-rich, informative | Feels like a chart, lacks emotion | Emotion > information |
| [GitHub Skyline](https://github.com/github/gh-skyline) | 3D city | Official GitHub project | Cannot embed in README (STL file) | Native SVG embedding |
| [Pac-Man Contrib](https://github.com/abozanona/pacman-contribution-graph) | Pac-Man | Nostalgic appeal | Retro, not refined | Modern premium aesthetics |

**Key Insight**: No tool combines **space theme + premium aesthetics + animated SVG + dark/light auto-switch**. This is a blue ocean.

---

## 3. Key Features & MVP Scope

### 3.1 MVP Features (In-Scope)

| Priority | Feature | Description |
|----------|---------|-------------|
| P0 | **GitHub GraphQL API Client** | Fetch contribution data (52w × 7d = 364 data points) for any public user |
| P0 | **SVG Rendering Engine** | Core engine that generates animated SVGs with transparent backgrounds |
| P0 | **Dark/Light Mode** | Generate 2 SVGs per theme; users embed via `<picture>` tag |
| P0 | **Nebula Map Theme** | Phase 1 theme — organic nebula visualization (see design doc) |
| P0 | **Stats Overlay** | Total contributions, longest streak, most active day, current streak |
| P0 | **CLI Tool** | `npx cosmio --user <username> --theme nebula` |
| P1 | **GitHub Action** | Automated daily SVG generation via workflow |
| P1 | **Custom Title** | Username or user-defined text overlay |
| P1 | **Constellation Theme** | Phase 2 theme — star chart visualization |
| P2 | **Space Voyage Theme** | Phase 3 theme — spaceship trajectory visualization |
| P2 | **Alien Defense Theme** | Phase 4 theme — game-like defense grid visualization |

### 3.2 Post-MVP Features (Out-of-Scope)

- Custom color schemes / user-defined palettes
- Community theme plugin system (`cosmio-theme-*` npm packages)
- Web-based preview / configurator UI
- Contribution data from GitLab / Bitbucket
- Weekly/monthly email reports
- Interactive SVGs (hover effects — not supported in GitHub `<img>`)

---

## 4. User Journey

### 4.1 Core Flow

```
[Discover Cosmio] → [Install / Setup Action] → [Configure theme] → [SVG generated] → [Embed in README] → [Auto-updates daily]
```

### 4.2 Detailed Scenarios

| # | Scenario | Input | Process | Output |
|---|----------|-------|---------|--------|
| 1 | CLI One-off | `npx cosmio --user t1seo --theme nebula` | Fetch data → Render SVG → Write files | `cosmio-nebula-dark.svg` + `cosmio-nebula-light.svg` |
| 2 | GitHub Action Setup | User adds workflow YAML to repo | Action runs daily at midnight UTC | SVGs committed to repo, README auto-updated |
| 3 | Theme Selection | `--theme nebula\|constellation\|voyage\|defense` | Load theme renderer | Theme-specific SVG output |
| 4 | Custom Title | `--title "My Coding Journey"` | Overlay text on SVG | Personalized title in SVG |
| 5 | README Embedding | User copies `<picture>` snippet | GitHub renders appropriate SVG | Dark/light mode auto-switch |

### 4.3 GitHub Action Workflow (User Perspective)

```yaml
# .github/workflows/cosmio.yml
name: Generate Cosmio
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:       # Manual trigger

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: t1seo/cosmio@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          theme: nebula
          title: '@t1seo'
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'chore: update cosmio SVG'
```

### 4.4 README Embedding (User Perspective)

```markdown
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./cosmio-nebula-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./cosmio-nebula-light.svg">
  <img alt="Cosmio" src="./cosmio-nebula-dark.svg" width="840">
</picture>
```

---

## 5. Functional Requirements

### 5.1 CLI Interface

| Command | Description | Required |
|---------|-------------|----------|
| `--user <username>` | GitHub username to visualize | Yes |
| `--theme <name>` | Theme selection (default: `nebula`) | No |
| `--title <text>` | Custom title text (default: `@username`) | No |
| `--output <dir>` | Output directory (default: `./`) | No |
| `--year <YYYY>` | Year to visualize (default: current) | No |
| `--token <token>` | GitHub PAT for private profiles | No |
| `--help` | Show help | No |
| `--version` | Show version | No |

### 5.2 GitHub Action Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `github_token` | GitHub token for API access | `${{ github.token }}` |
| `theme` | Theme name | `nebula` |
| `title` | Custom title | `@<username>` |
| `output_dir` | Output directory | `./` |
| `year` | Target year | Current year |

### 5.3 SVG Output Requirements

| Requirement | Specification |
|-------------|--------------|
| Format | SVG 1.1 with inline animations |
| Background | Transparent (no fill on root `<svg>`) |
| Dimensions | `840 × 240px` (viewBox), scalable |
| Animation | **SMIL-first strategy** (see Animation Strategy below) |
| File Size | Target < 100KB per SVG |
| Browser Support | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| GitHub Rendering | Must render correctly in GitHub `<img>` tag |
| No External Dependencies | No external fonts, images, or scripts |
| Blending | SVG `<feBlend>` filter primitives (not CSS `mix-blend-mode`) |

### 5.4 Animation Strategy

GitHub renders SVGs via `<img>` tags, which blocks JavaScript and external resources. Animation support is limited:

| Method | GitHub `<img>` Support | Use Case |
|--------|----------------------|----------|
| **SMIL `<animate>`** | ✅ Reliable | Primary method — opacity, transform, attribute animation |
| **SMIL `<animateTransform>`** | ✅ Reliable | Rotation, scaling, translation |
| **CSS `@keyframes` in `<style>`** | ⚠️ Partial | Secondary method — simple property animations only |
| **CSS `mix-blend-mode`** | ⚠️ Unverified | Avoid — use SVG `<feBlend>` filter instead |
| **JavaScript** | ❌ Blocked | Never use |

**SMIL-First Rule**: Default to SMIL for all animations. Only use CSS `@keyframes` when SMIL cannot express the desired effect (e.g., `stroke-dashoffset` animation). All animation approaches must be validated against GitHub rendering during Phase 0 POC.

### 5.5 SVG Blending Strategy

GitHub's sanitizer behavior with CSS `mix-blend-mode` is unverified. To avoid risk, use **SVG-native `<feBlend>` filter primitives** for all blending effects:

```xml
<!-- Use this (SVG-native, reliable) -->
<filter id="blend-screen">
  <feImage href="#layer-a" result="a"/>
  <feImage href="#layer-b" result="b"/>
  <feBlend in="a" in2="b" mode="screen"/>
</filter>

<!-- NOT this (CSS, may be stripped by GitHub) -->
<style>.layer { mix-blend-mode: screen; }</style>
```

| Blend Effect | SVG Filter Approach |
|-------------|-------------------|
| Nebula glow overlap (dark) | `<feBlend mode="screen">` |
| Nebula glow overlap (light) | `<feBlend mode="multiply">` |
| Star glow | `<feGaussianBlur>` + `<feMerge>` (no blending needed) |
| Trail glow | `<feGaussianBlur>` + `<feComposite>` |

### 5.6 Phase 0 POC: GitHub Rendering Validation

Before building the full engine, create a minimal proof-of-concept SVG that tests all rendering assumptions on an actual GitHub profile README:

| Test | What to Verify |
|------|---------------|
| SMIL `<animate>` | Opacity and transform animations play in `<img>` |
| SMIL `<animateTransform>` | Rotation and scale animations play in `<img>` |
| CSS `@keyframes` | Basic keyframe animations survive GitHub sanitizer |
| `<feBlend mode="screen">` | SVG-native blending renders correctly |
| `<feGaussianBlur>` | Glow filters render on both dark and light backgrounds |
| Transparent background | SVG renders correctly on `#0d1117` and `#ffffff` |
| `<style>` block | Internal CSS styles are preserved |

**Exit criteria**: POC SVG renders correctly on GitHub profile README with all tested features working. Document which methods work and which don't. Update animation and blending strategy accordingly.

### 5.7 Data Requirements

| Field | Source | Type |
|-------|--------|------|
| Contribution Grid | GitHub GraphQL API | 52 weeks × 7 days matrix |
| Contribution Count | Per cell | Integer (0–n) |
| Contribution Level | Per cell | Enum (0–4) |
| Total Contributions | Computed | Integer |
| Longest Streak | Computed | Integer (days) |
| Current Streak | Computed | Integer (days) |
| Most Active Day | Computed | Weekday name |

### 5.8 Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | SVG generation < 5 seconds |
| **Reliability** | Graceful handling of GitHub API rate limits (with retry) |
| **Accessibility** | WCAG AA contrast ratios for all text elements |
| **Security** | No user data stored; token used only for API calls |
| **Compatibility** | Node.js 20+ |
| **Package Size** | npm package < 2MB (no heavy dependencies) |

---

## 6. Technical Architecture

### 6.1 Project Structure

```
cosmio/
├── src/
│   ├── api/                  # GitHub GraphQL API
│   │   ├── client.ts         # GraphQL client with retry logic
│   │   └── queries.ts        # Contribution data queries
│   ├── core/                 # Shared rendering engine
│   │   ├── svg.ts            # SVG builder utilities
│   │   ├── animation.ts      # Animation helpers (keyframes, SMIL)
│   │   ├── stats.ts          # Stats computation (streak, active day)
│   │   └── theme.ts          # Theme interface & registry
│   ├── themes/               # Theme renderers
│   │   ├── nebula/           # Phase 1: Nebula Map
│   │   │   ├── renderer.ts   # Main render function
│   │   │   ├── palette.ts    # Dark/light color palettes
│   │   │   └── effects.ts    # Glow, noise, filament generators
│   │   ├── constellation/    # Phase 2: Constellation
│   │   ├── voyage/           # Phase 3: Space Voyage
│   │   └── defense/          # Phase 4: Alien Defense
│   ├── utils/                # Utilities
│   │   ├── noise.ts          # Simplex noise implementation
│   │   ├── color.ts          # Color manipulation (hex, opacity)
│   │   └── math.ts           # Math helpers (lerp, clamp, hash)
│   └── index.ts              # CLI entry point (commander.js)
├── action.yml                # GitHub Action definition
├── .github/
│   └── workflows/
│       └── demo.yml          # Demo workflow for testing
├── tests/
│   ├── api/                  # API client tests
│   ├── core/                 # Engine tests
│   └── themes/               # Theme snapshot tests
├── examples/                 # Example output SVGs
├── docs/
│   ├── planning/
│   │   ├── brainstorm.md
│   │   ├── naming-cosmio.md
│   │   └── PRD.md            # This document
│   └── design/
│       ├── design-system.md
│       └── themes/
│           ├── 01-nebula-map.md
│           ├── 02-constellation.md
│           ├── 03-space-voyage.md
│           └── 04-alien-defense.md
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

### 6.2 Tech Stack

| Category | Technology | Rationale |
|----------|-----------|-----------|
| **Language** | TypeScript 5.x | Type safety for SVG generation |
| **Runtime** | Node.js 20+ | GitHub Action compatibility (node24 runner) |
| **CLI Framework** | commander.js | Lightweight, standard CLI parsing |
| **HTTP Client** | undici / fetch | Built-in Node.js fetch (no axios needed) |
| **Noise Generation** | simplex-noise | Lightweight, zero-dependency noise |
| **Testing** | Vitest | Fast, TypeScript-native |
| **Build** | tsup | Fast bundling, ESM + CJS output |
| **Linting** | ESLint + Prettier | Code consistency |

### 6.3 Theme Interface

```typescript
interface Theme {
  name: string;
  render(data: ContributionData, options: ThemeOptions): {
    dark: string;   // SVG string for dark mode
    light: string;  // SVG string for light mode
  };
}

interface ContributionData {
  weeks: ContributionWeek[];  // 52 weeks
  stats: {
    total: number;
    longestStreak: number;
    currentStreak: number;
    mostActiveDay: string;
  };
}

interface ThemeOptions {
  title: string;
  width: number;   // default: 840
  height: number;  // default: 240
}
```

### 6.4 External APIs

| API | Usage | Auth |
|-----|-------|------|
| GitHub GraphQL API | Fetch contribution data | PAT or `GITHUB_TOKEN` |

No other external services required. This is a fully self-contained tool.

---

## 7. Error Handling

| Scenario | Handling |
|----------|----------|
| Invalid username | Exit with clear error: `Error: User "xxx" not found on GitHub` |
| Rate limited | Retry with exponential backoff (3 attempts, 1s/2s/4s) |
| Network failure | Exit with error: `Error: Failed to connect to GitHub API` |
| Invalid theme name | Exit with error listing available themes |
| No contributions | Render empty-state SVG (all L0) with message |
| Private profile | Prompt for `--token` flag |
| SVG generation failure | Exit with error + suggest opening a GitHub issue |

---

## 8. Design Guidelines

> Full design specifications are documented separately. See:
> - [`docs/design/design-system.md`](../design/design-system.md) — Common design system
> - [`docs/design/themes/01-nebula-map.md`](../design/themes/01-nebula-map.md) — Nebula Map theme
> - [`docs/design/themes/02-constellation.md`](../design/themes/02-constellation.md) — Constellation theme
> - [`docs/design/themes/03-space-voyage.md`](../design/themes/03-space-voyage.md) — Space Voyage theme
> - [`docs/design/themes/04-alien-defense.md`](../design/themes/04-alien-defense.md) — Alien Defense theme

### 8.1 Design Principles

| Principle | Description |
|-----------|-------------|
| **Premium over cute** | Every element should feel refined and intentional |
| **Dark-first** | Dark mode is the primary design target |
| **Transparent canvas** | SVGs sit on GitHub's background — no opaque fills |
| **Accessibility** | WCAG AA minimum for all text; info conveyed by brightness, not just color |
| **Performance** | Max 50 animated elements; single-group blur filters |

### 8.2 Color Identity Per Theme

| Theme | Dark Primary | Light Primary | Character |
|-------|-------------|---------------|-----------|
| Nebula | Purple / Cyan / Pink | Violet / Lavender | Mysterious, organic |
| Constellation | Gold / Amber | Indigo / Navy | Classical, elegant |
| Voyage | Cyan / Orange | Teal / Orange | Dynamic, futuristic |
| Defense | Emerald / Red | Green / Red | Game-like, tense |

---

## 9. Development Roadmap

### 9.1 Phases

| Phase | Scope | Dependencies | Status |
|-------|-------|-------------|--------|
| **Phase 0** | Common infrastructure (API client, SVG engine, CLI, stats computation, theme interface) | — | Planned |
| **Phase 1** | Nebula Map theme | Phase 0 | Planned |
| **Phase 2** | Constellation theme | Phase 0 | Planned |
| **Phase 3** | Space Voyage theme | Phase 0 | Planned |
| **Phase 4** | Alien Defense theme | Phase 0 | Planned |
| **Phase 5** | GitHub Action packaging + marketplace publishing | Phase 0 + 1 theme min | Planned |
| **Phase 6** | README, documentation, demo, examples | All phases | Planned |

### 9.2 Phase 0 Breakdown (Foundation)

| Task | Description |
|------|-------------|
| **GitHub rendering POC** | Build minimal SVG testing SMIL, CSS animations, `<feBlend>`, blur filters on actual GitHub README. Document results. **(Gate: must pass before proceeding)** |
| Project scaffolding | package.json, tsconfig, vitest, tsup, ESLint |
| GitHub GraphQL client | Fetch `contributionsCollection` with error handling + retry |
| Contribution data parser | Parse API response into `ContributionData` type |
| Stats computation | Calculate total, streaks, most active day |
| SVG builder | Utility functions for SVG element generation |
| Animation utilities | CSS keyframe + SMIL animation helpers |
| Theme interface | `Theme` interface + theme registry |
| CLI setup | commander.js with all flags |
| Output writer | Write dark/light SVG files to disk |

### 9.3 Phase 1 Breakdown (Nebula Map)

| Task | Description |
|------|-------------|
| Color palette module | Dark/light palette with all contribution level colors |
| Simplex noise integration | Noise-based nebula boundary distortion |
| Nebula body renderer | Radial gradient circles with `<feBlend>` screen/multiply blending |
| Star particles | Background star field generation |
| Nebula filaments | Gas tendril path generation |
| Glow filters | SVG filter definitions for nebula + star glow |
| Stats overlay | Themed stat display with icons |
| Title rendering | Custom title with proper font stack |
| Animation integration | Breathing, twinkle, color shift, filament flow |
| Snapshot tests | Visual regression tests for SVG output |

---

## 10. Testing Strategy

### 10.1 Unit Tests

| Module | What to Test |
|--------|-------------|
| API Client | Mock GraphQL responses, error handling, retry logic |
| Stats | Streak calculation edge cases (gaps, year boundaries) |
| Color Utils | Hex manipulation, opacity calculations |
| Noise | Deterministic output for same seed |
| SVG Builder | Correct SVG element generation |

### 10.2 Integration Tests

| Test | Description |
|------|-------------|
| End-to-end CLI | Run CLI with mock data → verify SVG output exists and is valid |
| Theme rendering | Each theme produces valid SVG with correct viewBox and no external refs |
| Dark/Light pair | Both variants generated with correct color palettes |

### 10.3 Visual Regression

- Snapshot tests comparing generated SVGs against known-good baselines
- Run on CI for every PR
- Update snapshots intentionally when design changes

---

## 11. Distribution & Publishing

### 11.1 npm Package

```bash
# Installation
npm install -g cosmio
# or
npx cosmio --user <username> --theme nebula
```

| Item | Detail |
|------|--------|
| Package name | `cosmio` |
| Entry point | `dist/index.js` |
| Binary | `cosmio` (via `bin` field) |
| Module format | ESM + CJS dual publish |
| Minimum Node | 20 |

### 11.2 GitHub Action

| Item | Detail |
|------|--------|
| Action name | `Cosmio — Space Contribution Visualizer` |
| Marketplace category | Utilities |
| Runs on | `node24` |
| Inputs | `github_token`, `theme`, `title`, `output_dir`, `year` |
| Outputs | `dark_svg_path`, `light_svg_path` |

### 11.3 Demo Repository

- Maintain a demo repo (`t1seo/t1seo`) with all 4 themes showcased
- Auto-update daily via GitHub Action
- Serve as living documentation + proof-of-concept

---

## 12. Changelog

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.1 | 2026-02-03 | Fix CRT-01 (node20→node24), CRT-02 (SMIL-first animation strategy), CRT-03 (feBlend over mix-blend-mode). Add Phase 0 POC gate. | — |
| 1.0 | 2026-02-03 | Initial PRD creation | — |
