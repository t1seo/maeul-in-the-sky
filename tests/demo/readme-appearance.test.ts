import { describe, expect, it } from 'vitest';
import { readmeDocument } from '../../src/demo/setup.js';
import { settingsFixture } from './fixtures.js';

describe('SVG profile appearance', () => {
  it('keeps automatic GitHub theme switching as the default', () => {
    const document = settingsFixture();
    const automatic = readmeDocument(document, 'owner/profile', 'auto');
    expect(automatic).toBe(readmeDocument(document, 'owner/profile'));
    expect(automatic).toContain('prefers-color-scheme: dark');
    expect(automatic).toContain('prefers-color-scheme: light');
    expect(automatic).not.toContain('.png');
  });

  it.each(['light', 'dark'] as const)(
    'keeps the selected %s image regardless of the GitHub theme',
    (appearance) => {
      const document = settingsFixture('A "village" & <sky>');
      const result = readmeDocument(document, 'my owner/my profile', appearance);
      expect(result).toContain(
        `src="https://raw.githubusercontent.com/my%20owner/my%20profile/output/maeul-in-the-sky-${appearance}.svg"`,
      );
      expect(result).not.toContain('<picture>');
      expect(result).not.toContain('<source');
      expect(result).not.toContain('prefers-color-scheme');
      expect(result).toContain('A &quot;village&quot; &amp; &lt;sky&gt;');
      expect(result).not.toContain('/world/');
    },
  );
});
