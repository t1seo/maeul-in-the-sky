import { describe, expect, it } from 'vitest';
import { renderTerrain as classicRenderTerrain } from '../../assets/versions/classic/browser.js';
import { renderOptions, renderSnapshot } from '../../src/demo/preview.js';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { demoQuery, parseDemoQuery } from '../../src/demo/state.js';
import { workflowDocument } from '../../src/demo/setup.js';

describe('landscape studio settings', () => {
  it.each(['island', 'archipelago', 'valley'])(
    'shares the selected %s landscape without losing other presentation settings',
    (layout) => {
      const state = parseDemoQuery(
        `?terrainMode=landscape&landscapeLayout=${layout}&style=korean&artStyle=pixel`,
      );
      expect(state.document.settings).toMatchObject({
        terrainMode: 'landscape',
        landscapeLayout: layout,
        style: 'korean',
        artStyle: 'pixel',
      });
      expect(parseDemoQuery(demoQuery(state))).toEqual(state);
    },
  );

  it('preserves calendar links and clears landscape choices for archived Classic', () => {
    const state = parseDemoQuery('?renderer=classic&terrainMode=landscape&landscapeLayout=valley');
    expect(state.renderer).toBe('classic');
    expect(state.document.settings).not.toHaveProperty('terrainMode');
    expect(state.document.settings).not.toHaveProperty('landscapeLayout');
    expect(demoQuery(state)).not.toContain('terrainMode');
    expect(demoQuery(parseDemoQuery('?terrainMode=calendar'))).toBe(demoQuery(parseDemoQuery('')));
  });

  it.each(['?terrainMode=3d', '?terrainMode=landscape&landscapeLayout=moon'])(
    'rejects the unsupported terrain choice in %s',
    (query) => expect(() => parseDemoQuery(query)).toThrow(),
  );

  it('uses shared landscape dimensions for both download layouts', () => {
    const { settings } = parseDemoQuery('?terrainMode=landscape').document;
    expect(renderOptions(settings)).toMatchObject({ width: 1200, height: 840 });
    expect(renderOptions({ ...settings, layout: 'card' })).toMatchObject({
      width: 840,
      height: 840,
    });
  });

  it('exports the unpublished feature branch and its terrain inputs explicitly', () => {
    const { document } = parseDemoQuery('?terrainMode=landscape&landscapeLayout=archipelago');
    const result = workflowDocument(document);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.content).toContain('t1seo/maeul-in-the-sky@t1seo/civilization-terrain');
    expect(result.content).toContain('terrain_mode: "landscape"');
    expect(result.content).toContain('landscape_layout: "archipelago"');
    expect(result.content).toContain('must be pushed');
  });

  it('protects the strict archived renderer and its workflow from landscape settings', () => {
    const { document } = parseDemoQuery('?terrainMode=landscape&landscapeLayout=valley');
    const sample = sampleSnapshot();
    const snapshot = { ...sample, settings: document.settings };
    const output = renderSnapshot(snapshot, snapshot.settings, 'classic-preview', {
      version: 'classic',
      renderTerrain: classicRenderTerrain,
    });
    expect(output.dark).toContain('viewBox="0 0 840 240"');
    expect(output.metadata).not.toHaveProperty('terrainMode');
    const workflow = workflowDocument(document, 'classic');
    if (!workflow.ok) throw new TypeError(workflow.message);
    expect(workflow.content).toContain('@05a10eff07575acf2c81adcd66a66bc501507217');
    expect(workflow.content).not.toContain('terrain_mode:');
    expect(workflow.content).not.toContain('landscape_layout:');
  });
});
