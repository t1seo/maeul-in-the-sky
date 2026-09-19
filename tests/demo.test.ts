import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

interface ButtonStub {
  dataset: Record<string, string>;
  attributes: Map<string, string>;
  addEventListener: (event: string, handler: () => void) => void;
  click: () => void;
  setAttribute: (name: string, value: unknown) => void;
}

function createButton(dataset: Record<string, string>): ButtonStub {
  let clickHandler = (): void => undefined;
  const attributes = new Map<string, string>();
  return {
    dataset,
    attributes,
    addEventListener: (event, handler) => {
      if (event === 'click') clickHandler = handler;
    },
    click: () => clickHandler(),
    setAttribute: (name, value) => attributes.set(name, String(value)),
  };
}

describe('preset demo', () => {
  const html = readFileSync(new URL('../docs/demo/index.html', import.meta.url), 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  const script = scripts.at(-1)?.[1] ?? '';

  it('ships every preset in both color modes', () => {
    for (const preset of ['nature', 'balanced', 'civilization']) {
      for (const mode of ['dark', 'light']) {
        const svg = readFileSync(
          new URL(`../docs/demo/assets/preset-${preset}-${mode}.svg`, import.meta.url),
          'utf8',
        );
        expect(svg).toMatch(/^<svg/);
        expect(svg).toContain('role="img"');
      }
    }
  });

  it('applies query state and updates the preview through controls', () => {
    const presetButtons = ['nature', 'balanced', 'civilization'].map((preset) =>
      createButton({ preset }),
    );
    const modeButtons = ['dark', 'light'].map((mode) => createButton({ mode }));
    const terrain = { src: '', alt: '' };
    const presetName = { textContent: '' };
    const presetDescription = { textContent: '' };
    const historyUrls: string[] = [];

    vm.runInNewContext(script, {
      URLSearchParams,
      window: {
        location: { pathname: '/', search: '?preset=civilization&mode=light' },
        matchMedia: () => ({ matches: false }),
        history: {
          replaceState: (_state: unknown, _title: string, url: string) => historyUrls.push(url),
        },
      },
      document: {
        querySelector: (selector: string) => {
          if (selector === '#terrain') return terrain;
          if (selector === '#preset-name') return presetName;
          if (selector === '#preset-description') return presetDescription;
          return undefined;
        },
        querySelectorAll: (selector: string) =>
          selector === '[data-preset]' ? presetButtons : modeButtons,
      },
    });

    expect(terrain.src).toBe('assets/preset-civilization-light.svg');
    expect(terrain.alt).toContain('Civilization');
    expect(presetName.textContent).toBe('Civilization');
    expect(presetButtons[2].attributes.get('aria-pressed')).toBe('true');
    expect(modeButtons[1].attributes.get('aria-pressed')).toBe('true');

    presetButtons[0].click();

    expect(terrain.src).toBe('assets/preset-nature-light.svg');
    expect(presetDescription.textContent).toContain('Light decoration with more open space');
    expect(historyUrls.at(-1)).toBe('/?preset=nature&mode=light');
  });
});
