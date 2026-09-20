import type { SettingsV1 } from '../core/snapshot-types.js';
import type { RendererVersion } from './renderer-version.js';
import { settingsForRenderer, workflowVersion } from './renderer-settings.js';

export type WorkflowResult =
  | { readonly ok: true; readonly content: string }
  | { readonly ok: false; readonly field: 'title' | 'layoutSeed'; readonly message: string };

export function workflowDocument(
  document: SettingsV1,
  renderer: RendererVersion = 'current',
): WorkflowResult {
  const settings = settingsForRenderer(document.settings, renderer);
  const version = workflowVersion(settings, renderer);
  if (settings.title.includes('${{')) {
    return {
      ok: false,
      field: 'title',
      message:
        'Remove ${{ from Title before exporting a workflow. GitHub evaluates Actions expressions even inside quoted titles. Rendering and JSON exports still support this literal text.',
    };
  }
  if (settings.layoutSeed?.includes('${{')) {
    return {
      ok: false,
      field: 'layoutSeed',
      message:
        'Remove ${{ from Layout seed before exporting a workflow. GitHub evaluates Actions expressions even inside quoted values. Rendering and JSON exports still support this literal text.',
    };
  }
  const fields: Record<string, string | number> = {
    username: document.username,
    title: settings.title,
    preset: settings.preset,
    density: settings.density,
    hemisphere: settings.hemisphere,
    motion: settings.motion,
    layout: settings.layout,
    village_style: settings.style,
    art_style: settings.artStyle,
    normalization: settings.normalization.kind,
    output_dir: './maeul-output',
  };
  if (document.year !== undefined) fields.year = document.year;
  if (settings.layoutSeed !== undefined) fields.layout_seed = settings.layoutSeed;
  if (settings.terrainMode === 'landscape') {
    fields.terrain_mode = 'landscape';
    fields.landscape_layout = settings.landscapeLayout ?? 'island';
  }
  if (settings.normalization.kind === 'fixed') fields.max_count = settings.normalization.maxCount;
  const inputs = Object.entries(fields)
    .map(([key, value]) => `          ${key}: ${JSON.stringify(String(value))}`)
    .join('\n');
  return {
    ok: true,
    content: `# Presentation: ${version.label}. ${version.description}
# Settings and snapshot JSON store data/settings; select the presentation in this workflow or demo URL.
name: Update Maeul in the Sky

on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:

permissions:
  contents: read

jobs:
  village:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v7
      - uses: t1seo/maeul-in-the-sky@${version.revision}
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
${inputs}
      - name: Upload village images
        uses: actions/upload-artifact@v7
        with:
          name: maeul-village
          path: ./maeul-output
          if-no-files-found: error
  publish:
    needs: village
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Download village images
        uses: actions/download-artifact@v8
        with:
          name: maeul-village
          path: ./maeul-output
      - name: Publish village images
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_branch: output
          publish_dir: ./maeul-output
`,
  };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export type ReadmeAppearance = 'auto' | 'light' | 'dark';

export function readmeDocument(
  document: SettingsV1,
  repository: string,
  appearance: ReadmeAppearance = 'auto',
): string {
  const path = repository.split('/').map(encodeURIComponent).join('/');
  const base = `https://raw.githubusercontent.com/${path}/output/maeul-in-the-sky`;
  if (appearance !== 'auto') {
    return `<a href="https://t1seo.github.io/maeul-in-the-sky/">
  <img alt="${escapeHtml(document.settings.title)}" src="${escapeHtml(base)}-${appearance}.svg" width="100%">
</a>
`;
  }
  return `<a href="https://t1seo.github.io/maeul-in-the-sky/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="${escapeHtml(base)}-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="${escapeHtml(base)}-light.svg">
    <img alt="${escapeHtml(document.settings.title)}" src="${escapeHtml(base)}-dark.svg" width="100%">
  </picture>
</a>
`;
}
