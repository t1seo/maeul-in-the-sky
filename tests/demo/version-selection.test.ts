import { describe, expect, it } from 'vitest';
import { demoQuery, parseDemoQuery } from '../../src/demo/state.js';
import { workflowDocument } from '../../src/demo/setup.js';
import { settingsFixture } from './fixtures.js';

describe('presentation version selection', () => {
  it('preserves classic separately when a settings link is reopened', () => {
    // Given: a classic link with independent Korean culture and pixel artwork.
    const incoming = '?renderer=classic&style=korean&artStyle=pixel&title=My+garden';
    // When: its settings are shared again.
    const restored = parseDemoQuery(demoQuery(parseDemoQuery(incoming)));
    // Then: version survives without entering the schema-v1 document.
    expect(restored).toMatchObject({ renderer: 'classic' });
    expect(restored.document.settings).toMatchObject({ style: 'korean', artStyle: 'pixel' });
    expect(restored.document).not.toHaveProperty('renderer');
    expect(restored.document.settings).not.toHaveProperty('renderer');
  });

  it('rejects unknown renderer choices when a link is opened', () => {
    // Given / When / Then: untrusted versions cannot become module URLs.
    expect(() => parseDemoQuery('?renderer=https://other.example/engine.js')).toThrow();
  });

  it('pins the exact old action when classic is applied to a profile', () => {
    // Given: valid settings and the pre-update renderer selection.
    const settings = settingsFixture();
    // When: its workflow is generated.
    const result = workflowDocument(settings, 'classic');
    // Then: the workflow executes the old revision and describes the choice.
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.content).toContain(
      'uses: t1seo/maeul-in-the-sky@05a10eff07575acf2c81adcd66a66bc501507217',
    );
    expect(result.content).toContain('Classic');
    expect(result.content).not.toContain('uses: t1seo/maeul-in-the-sky@main');
  });
});
