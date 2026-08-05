# Contributing

Thank you for helping improve Maeul in the Sky. Bug fixes, new Terrain assets, accessibility work, documentation, and focused performance improvements are welcome.

## Before you start

- Search existing issues and pull requests.
- Open a feature request before a large visual or API change.
- Keep one pull request focused on one outcome.
- Use the project terms in [CONTEXT.md](CONTEXT.md), especially Contribution Calendar, Terrain, Theme, Biome, and Season Zone.

## Local setup

Node.js 20 or newer is required.

```bash
git clone https://github.com/t1seo/maeul-in-the-sky.git
cd maeul-in-the-sky
npm ci
```

Run the development checks:

```bash
npm run lint
npm run typecheck
npm run format:check
npm test
npm run test:artifact
```

Generate the local preset demo after renderer or asset changes:

```bash
npm run generate:demo
```

Open `docs/demo/index.html` and inspect Nature, Balanced, and Civilization in both color modes. Animation changes must also be checked with reduced motion enabled.

## Project layout

- `src/api`: GitHub Contribution Calendar acquisition
- `src/core`: shared types, statistics, presets, and SVG helpers
- `src/themes`: Theme registry and Terrain renderer
- `src/generate.ts`: complete Terrain Generation operation
- `src/action.ts`: GitHub Action adapter
- `src/index.ts`: command-line adapter
- `tests`: unit, integration, and renderer tests
- `scripts`: preview and package smoke tools

## Pull requests

A useful pull request includes:

- A short explanation of the visible or behavioral change
- Tests for new boundaries or fixed regressions
- Before and after images for visual changes
- Updated README or changelog entries when public behavior changes
- No generated build output unless the repository already tracks that artifact

Maintainers may ask to split unrelated changes. By contributing, you agree that your work is licensed under the project’s [MIT License](LICENSE).
