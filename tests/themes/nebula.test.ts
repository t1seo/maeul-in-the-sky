import { describe, it, expect } from 'vitest';
import { mockContributionData } from '../fixtures/mock-data.js';
import { nebulaTheme } from '../../src/themes/nebula/index.js';

describe('Nebula Theme', () => {
  const options = { title: '@testuser', width: 840, height: 240 };

  it('should render dark mode SVG', () => {
    const output = nebulaTheme.render(mockContributionData, options);
    expect(output.dark).toContain('<svg');
    expect(output.dark).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(output.dark).toContain('@testuser');
  });

  it('should render light mode SVG', () => {
    const output = nebulaTheme.render(mockContributionData, options);
    expect(output.light).toContain('<svg');
    expect(output.light).toContain('@testuser');
  });

  it('should produce deterministic output', () => {
    const output1 = nebulaTheme.render(mockContributionData, options);
    const output2 = nebulaTheme.render(mockContributionData, options);
    expect(output1.dark).toBe(output2.dark);
    expect(output1.light).toBe(output2.light);
  });

  it('should contain star particles', () => {
    const output = nebulaTheme.render(mockContributionData, options);
    expect(output.dark).toContain('class="star-field"');
    expect(output.dark).toContain('star-twinkle');
  });

  it('should contain nebula glow filters', () => {
    const output = nebulaTheme.render(mockContributionData, options);
    expect(output.dark).toContain('id="nebula-glow"');
    expect(output.dark).toContain('id="nebula-blend"');
  });

  it('should contain contribution stats', () => {
    const output = nebulaTheme.render(mockContributionData, options);
    expect(output.dark).toContain('42');
    expect(output.dark).toContain('Wednesday');
  });

  it('should contain nebula body with glow circles', () => {
    const output = nebulaTheme.render(mockContributionData, options);
    expect(output.dark).toContain('class="nebula-body"');
    expect(output.dark).toContain('url(#nebula-glow)');
  });

  it('should contain filaments', () => {
    const output = nebulaTheme.render(mockContributionData, options);
    expect(output.dark).toContain('class="filament-field"');
    expect(output.dark).toContain('filament-drift');
  });

  it('should have no background fill (transparent)', () => {
    const output = nebulaTheme.render(mockContributionData, options);
    // SVG root should not have a fill attribute for background
    expect(output.dark).not.toMatch(/<svg[^>]+fill="/);
  });

  it('should match dark mode snapshot', () => {
    const output = nebulaTheme.render(mockContributionData, options);
    expect(output.dark).toMatchSnapshot();
  });

  it('should match light mode snapshot', () => {
    const output = nebulaTheme.render(mockContributionData, options);
    expect(output.light).toMatchSnapshot();
  });
});
