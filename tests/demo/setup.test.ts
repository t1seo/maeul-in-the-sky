import { describe, expect, it } from 'vitest';
import { readmeDocument, workflowDocument } from '../../src/demo/setup.js';
import { settingsFixture } from './fixtures.js';

describe('C06 secure setup exports', () => {
  it.each([
    ['classic', 'miniature'],
    ['classic', 'pixel'],
    ['korean', 'miniature'],
    ['korean', 'pixel'],
  ] as const)('exports %s culture and %s art as separate workflow inputs', (style, artStyle) => {
    // Given: independently chosen culture and art settings.
    const document = settingsFixture();

    // When: the setup workflow is generated.
    const result = workflowDocument({
      ...document,
      settings: { ...document.settings, style, artStyle },
    });

    // Then: the action receives both choices under their supported input names.
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.content).toContain(`village_style: "${style}"`);
    expect(result.content).toContain(`art_style: "${artStyle}"`);
    expect(result.content).toContain('uses: t1seo/maeul-in-the-sky@v2.1.0');
  });

  it('quotes exact scalar content when a title contains YAML and HTML syntax', () => {
    const document = settingsFixture('A: "B" & <C>\nnext: \'line\'');
    const result = workflowDocument(document);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const title = result.content.match(/^ {10}title: (.+)$/m)?.[1];
    expect(title).toBeDefined();
    expect(JSON.parse(title ?? 'null')).toBe(document.settings.title);
    expect(result.content).toContain('preset: "civilization"');
    expect(result.content).toContain('workflow_dispatch:');
    expect(result.content).toContain('${{ secrets.GITHUB_TOKEN }}');
    expect(result.content).toContain('publish_branch: output');
  });

  it('keeps generation read-only and passes output to a dependent publication job', () => {
    // Given: a valid settings document.
    const document = settingsFixture();

    // When: the GitHub Actions workflow is generated.
    const result = workflowDocument(document);

    // Then: only the dependent publication job can write repository contents.
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const villageJob = result.content.match(/ {2}village:\n([\s\S]*?)(?=\n {2}publish:)/)?.[1];
    const publishJob = result.content.match(/ {2}publish:\n([\s\S]*)$/)?.[1];
    expect(villageJob).toContain('contents: read');
    expect(villageJob).not.toContain('contents: write');
    expect(villageJob).toContain('uses: actions/checkout@v7');
    expect(villageJob).toContain('uses: actions/upload-artifact@v7');
    expect(publishJob).toContain('needs: village');
    expect(publishJob).toContain('contents: write');
    expect(publishJob).toContain('uses: actions/download-artifact@v8');
    expect(publishJob).toContain('uses: peaceiris/actions-gh-pages@v4');
  });

  it('rejects a title when it contains an Actions expression', () => {
    const result = workflowDocument(settingsFixture('${{ secrets.PRIVATE }}'));
    expect(result).toMatchObject({ ok: false, field: 'title' });
    if (result.ok) return;
    expect(result.message).toContain('Remove');
    expect(result.message).toContain('${{');
  });

  it('rejects a layout seed when it would be evaluated as an Actions expression', () => {
    const document = settingsFixture();
    const result = workflowDocument({
      ...document,
      settings: { ...document.settings, layoutSeed: '${{ secrets.PRIVATE }}' },
    });
    expect(result).toMatchObject({ ok: false, field: 'layoutSeed' });
  });

  it('escapes attributes and URL segments when generating an inert README', () => {
    const document = settingsFixture('" onload="alert(1) <script> &');
    const result = readmeDocument(document, 'my owner/repo name');
    expect(result).toContain('&quot; onload=&quot;alert(1) &lt;script&gt; &amp;');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain(' onload="');
    expect(result).toContain('/my%20owner/repo%20name/output/maeul-in-the-sky-dark.svg');
    expect(result).toContain('prefers-color-scheme: light');
  });
});
