import { expect, it } from 'vitest';
import { svgElement, svgRoot } from '../../src/core/svg.js';

it('isolates accessible references when an SVG namespace is supplied', () => {
  // Given two inline render namespaces.
  const accessibility = { title: 'Village', description: 'One supplied date' };
  // When rendering an explicitly namespaced root.
  const svg = svgRoot({}, '<g/>', { ...accessibility, namespace: 'preview-light' });
  // Then labels resolve inside this SVG.
  expect(svg).toContain('aria-labelledby="preview-light-title preview-light-description"');
  expect(svg).toContain('<title id="preview-light-title">Village</title>');
});

it('escapes attribute values when text crosses the SVG boundary', () => {
  // Given untrusted attribute text.
  // When creating an element.
  const svg = svgElement('g', { 'data-title': '" onload="alert(1)' }, '');
  // Then the quote stays inside the attribute value.
  expect(svg).toBe('<g data-title="&quot; onload=&quot;alert(1)"></g>');
});
