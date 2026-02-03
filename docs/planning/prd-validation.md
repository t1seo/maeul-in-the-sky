# PRD Validation Report

## 1. Overall Assessment

| Item | Assessment |
|------|-----------|
| **Grade** | B |
| **Summary** | Solid PRD with clear vision, realistic scope, and well-structured architecture. Proceed after addressing Node.js version, SVG rendering assumptions, and a few ambiguous specs. |
| **Estimated Dev Effort** | Phase 0 + Phase 1 (MVP): ~2,500–3,500 lines of TypeScript. Phases 2–4 are incremental (~500–800 LOC each). |
| **Estimated Monthly Cost** | $0 (GitHub API free tier + GitHub Actions free tier for public repos) |
| **Solo Dev Suitability** | ⭐⭐⭐⭐⭐ (5/5) — No backend, no database, no auth, no infra. Pure code generation tool. |

**Grade Criteria:**
- **A**: Ready to start development immediately
- **B**: Minor fixes needed, then proceed ✅
- **C**: Significant revision required
- **F**: Full rethink needed

---

## 2. Validation Summary

| Area | Status | Key Finding |
|------|--------|-------------|
| Technical Feasibility | 🟢 | GitHub GraphQL API, SVG generation, CSS animations — all proven and well-documented |
| Structural Clarity | 🟢 | Clear Input → Process → Output for all scenarios; TypeScript interfaces defined |
| Error Handling | 🟢 | 7 error scenarios covered with specific messages |
| Data Structure | 🟡 | `ContributionData` interface missing `ContributionWeek` and `ContributionDay` type definitions |
| MVP Scope | 🟢 | Well-prioritized P0/P1/P2; Phase 0 + 1 is a realistic MVP |
| Solo Dev Feasibility | 🟢 | Perfect for solo — no server, no DB, no auth, no deployment infra |
| Cost Feasibility | 🟢 | $0/month — all free tier. No paid services required. |
| Timeline Feasibility | 🟢 | With Claude Code acceleration, all phases achievable |
| Platform Constraints | 🟢 | ~~`node20` deprecated~~ → Fixed to `node24`. Animation & blending strategy documented. |
| Dependency Risk | 🟡 | Single dependency on GitHub GraphQL API; low risk but needs fallback awareness |
| Monetization Feasibility | 🟢 | Open-source — no monetization model needed; success = stars & adoption |

---

## 3. Detailed Findings

### 🟠 Critical (High Risk)

**[CRT-01] GitHub Action specifies `node20`, which is deprecated**
- **Location:** Section 6.3 Tech Stack, Section 11.2 GitHub Action
- **Problem:** PRD specifies `runs.using: node20` in the action definition. GitHub has announced Node 20 deprecation — **all Actions will be forced to Node 24 starting March 4, 2026**, and Node 20 will be removed entirely by summer 2026. ([Source](https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/))
- **Risk:** If launched with `node20`, the Action will break within months. Users will see failures in their workflows.
- **Fix:** Change `action.yml` to `runs.using: 'node24'`. Update Node.js minimum version requirement from 18 to 20 (or 22+) in `package.json` engines field. Test against Node 24 from day one.

**[CRT-02] CSS `@keyframes` animation may not work in GitHub `<img>` rendering**
- **Location:** Section 5.3 SVG Output Requirements ("CSS @keyframes + SMIL `<animate>` only")
- **Problem:** The PRD assumes CSS `@keyframes` animations work in GitHub-rendered SVGs via `<img>` tags. Research shows this is **partially true** — CSS animations work if they're inside a `<style>` block within the SVG or via `<foreignObject>`, but GitHub's sanitization is aggressive. SMIL animations are more reliably supported. ([Source](https://blog.eamonncottrell.com/animate-svgs-for-github-readmes), [Source](https://www.theopinionateddev.com/blog/customize-your-github-profile-with-css-and-svg-animations))
- **Risk:** If CSS animations are stripped by GitHub's sanitizer, all 4 themes lose their visual impact.
- **Fix:**
  1. Build a proof-of-concept SVG with both CSS and SMIL animations early in Phase 0
  2. Test rendering on actual GitHub profile README before committing to animation strategy
  3. Prefer SMIL as primary animation method; use CSS `@keyframes` only for properties SMIL cannot animate
  4. Document which animation properties work via which method

**[CRT-03] `mix-blend-mode` usage in Nebula theme needs validation**
- **Location:** Design doc `01-nebula-map.md` (Section 3.1: "use `mix-blend-mode: screen` (dark) / `multiply` (light)")
- **Problem:** `mix-blend-mode` works *internally* between SVG elements when applied via `style` attribute or `<style>` block. However, whether GitHub's SVG sanitizer preserves `mix-blend-mode` CSS is unconfirmed. The SVG spec does NOT support `mix-blend-mode` as a presentation attribute — it must be a CSS style property. ([Source](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mix-blend-mode))
- **Risk:** If GitHub strips `mix-blend-mode`, the Nebula theme's core visual effect (glowing, overlapping nebula clouds) will render as flat circles.
- **Fix:** Test with a minimal SVG containing `mix-blend-mode: screen` on GitHub before Phase 1. Prepare a fallback using SVG `<feBlend>` filter with `mode="screen"` as an alternative (pure SVG, no CSS needed).

---

### 🟡 Major (Improvement Needed)

**[MJR-01] `ContributionWeek` and `ContributionDay` types not defined**
- **Location:** Section 6.3 Theme Interface
- **Problem:** `ContributionData.weeks` is typed as `ContributionWeek[]`, but `ContributionWeek` and its inner `ContributionDay` types are not defined in the PRD. Missing fields: date, count, level, dayOfWeek.
- **Fix:** Add type definitions:
  ```typescript
  interface ContributionWeek {
    days: ContributionDay[];
  }
  interface ContributionDay {
    date: string;       // ISO date
    count: number;      // raw contribution count
    level: 0 | 1 | 2 | 3 | 4;  // GitHub's intensity level
  }
  ```

**[MJR-02] No empty-state SVG design specified**
- **Location:** Section 7 Error Handling ("Render empty-state SVG (all L0) with message")
- **Problem:** The error handling table mentions rendering an "empty-state SVG" for users with zero contributions, but no design specification exists for what this looks like in any theme.
- **Fix:** Add an empty-state design note to `design-system.md` — e.g., "dim background elements only + centered message: 'No contributions yet — start coding!'"

**[MJR-03] `feGaussianBlur` performance concern not quantified**
- **Location:** Design docs (all themes use SVG blur filters)
- **Problem:** The design system says "Max 50 animated elements" and "single-group blur filters", but doesn't specify maximum number of blur filter *instances*. Blur filters are the most expensive SVG operation. The Nebula theme applies blur to potentially 364 cells.
- **Fix:** The design already says "Apply `feGaussianBlur` only once to the entire group (not per-cell)" — ensure the implementation strictly follows this. Add a hard limit: max 5 `<filter>` definitions per SVG file.

**[MJR-04] Star count target of 500 in 3 months is ambitious**
- **Location:** Section 1.3 Success Criteria
- **Problem:** 500 GitHub stars in 3 months for a profile decoration tool is possible but requires active marketing. Platane/snk has ~5.5K stars but accumulated over 4+ years. ([Source](https://github.com/Platane/snk))
- **Risk:** Missing the star target isn't a product failure, but setting unrealistic expectations may cause discouragement.
- **Fix:** Adjust to "200+ stars in 3 months" as realistic target. 500 stars as stretch goal.

**[MJR-05] No versioning strategy for SVG output**
- **Location:** Sections 5.3, 11
- **Problem:** When the rendering engine updates (new effects, bug fixes), existing users' SVGs will change appearance. No strategy for versioning SVG output or notifying users of visual changes.
- **Fix:** Add a `--version` flag that can pin to a specific rendering version, or document that SVG output may change between versions and users should pin their Action version (`@v1`, `@v2`).

---

### 🟢 Minor (Recommendations)

**[MNR-01] Consider `--format` flag for future GIF/PNG support**
- **Suggestion:** While MVP is SVG-only, reserving a `--format svg|gif|png` CLI flag in the interface design would make future extension easier without breaking changes.

**[MNR-02] README embedding snippet could be simpler**
- **Suggestion:** The `<picture>` tag approach works but is verbose. Consider generating a ready-to-paste markdown snippet as part of CLI output, so users can just copy and paste.

**[MNR-03] No CI/CD pipeline defined for the project itself**
- **Suggestion:** Add a GitHub Actions workflow for the cosmio repo itself: lint, test, build on PR. This is standard for npm packages and builds trust.

**[MNR-04] npm package name `cosmio` is available**
- **Verified:** `npm view cosmio` returns 404 — the name is available. Register it early to prevent squatting.

**[MNR-05] Demo repo assumption**
- **Location:** Section 11.3
- **Problem:** Demo repo assumes `t1seo/t1seo` as the profile README repo. This should be configurable or documented as an example.

---

## 4. Action Items

| Priority | ID | Item | Current State | Fix | Effort |
|----------|-----|------|--------------|-----|--------|
| 🟠 1 | CRT-01 | Node.js version | `node20` specified | Change to `node24`, min Node 20+ | Low |
| 🟠 2 | CRT-02 | Animation strategy | CSS + SMIL assumed | Build POC SVG, test on GitHub, document findings | Medium |
| 🟠 3 | CRT-03 | `mix-blend-mode` | Assumed to work | Test on GitHub; prepare `<feBlend>` fallback | Medium |
| 🟡 4 | MJR-01 | Missing types | Undefined | Add `ContributionWeek`, `ContributionDay` to PRD | Low |
| 🟡 5 | MJR-02 | Empty-state design | Unspecified | Add empty-state section to design system | Low |
| 🟡 6 | MJR-03 | Blur filter limit | Vague | Set hard limit: max 5 filter defs per SVG | Low |
| 🟡 7 | MJR-04 | Star target | 500 in 3 months | Adjust to 200 realistic / 500 stretch | Low |
| 🟡 8 | MJR-05 | Output versioning | Not addressed | Document version pinning strategy | Low |

---

## 5. Recommendations

### 5.1 Phase 0 Must Include: SVG Rendering POC

Before building the full engine, create a **proof-of-concept SVG** that tests:
1. CSS `@keyframes` animation in `<style>` block → render via `<img>` on GitHub
2. SMIL `<animate>` → render via `<img>` on GitHub
3. `mix-blend-mode: screen` inside SVG → render via `<img>` on GitHub
4. `<feBlend mode="screen">` as CSS fallback → render via `<img>` on GitHub
5. `<feGaussianBlur>` filter performance at various counts
6. Transparent background rendering on both `#0d1117` and `#ffffff`

This POC takes ~1 hour and prevents weeks of wasted work if assumptions are wrong.

### 5.2 Type Definition Addition

```typescript
interface ContributionWeek {
  days: ContributionDay[];
  firstDay: string;  // ISO date of Sunday/Monday
}

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionData {
  weeks: ContributionWeek[];
  stats: {
    total: number;
    longestStreak: number;
    currentStreak: number;
    mostActiveDay: string;
  };
  year: number;
  username: string;
}
```

### 5.3 Updated Action Configuration

```yaml
# action.yml
name: 'Cosmio — Space Contribution Visualizer'
description: 'Generate space-themed animated SVGs from GitHub contributions'
runs:
  using: 'node24'    # NOT node20
  main: 'dist/action.js'
```

---

## 6. Validation Meta

| Item | Details |
|------|---------|
| Validation Date | 2026-02-03 |
| PRD Version | 1.0 |
| Web Search Performed | ✅ |
| APIs Verified | ✅ GitHub GraphQL API `contributionsCollection` — confirmed working |
| npm Name Verified | ✅ `cosmio` — available (404 on registry) |
| Platform Constraints Verified | ✅ GitHub Actions node24 migration, SVG rendering in `<img>` |
| Competitor Data Verified | ✅ Platane/snk — 5.5K stars, active as of 2025 |

### Sources

- [GitHub GraphQL API Rate Limits](https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api)
- [Node 20 Deprecation on GitHub Actions](https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/)
- [SVG Animation Methods Compared](https://xyris.app/blog/svg-animation-methods-compared-css-smil-and-javascript/)
- [Animate SVGs for GitHub READMEs](https://blog.eamonncottrell.com/animate-svgs-for-github-readmes)
- [CSS Animations in GitHub Profile SVGs](https://www.theopinionateddev.com/blog/customize-your-github-profile-with-css-and-svg-animations)
- [MDN: mix-blend-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mix-blend-mode)
- [Platane/snk Repository](https://github.com/Platane/snk)
- [SMIL Support - Can I Use](https://caniuse.com/svg-smil)
- [CSS mix-blend-mode Support - Can I Use](https://caniuse.com/css-mixblendmode)
