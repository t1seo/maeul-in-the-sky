import { describe, expect, it } from 'vitest';
import { optimizeSvgArtifact } from '../../scripts/optimization/optimize.js';
import { roundAbsolutePath } from '../../scripts/optimization/path-numbers.js';
import { compareContracts } from '../../scripts/optimization/integrity.js';

describe('C10 SVG build artifact numeric safety', () => {
  it('rounds validated absolute path coordinates and preserves unsupported or malformed grammar', () => {
    expect(roundAbsolutePath('M1.234567,2.345678 Q3.456789,4.567891 5,6Z')).toBe(
      'M1.23,2.35 Q3.46,4.57 5,6Z',
    );
    for (const input of [
      'M1.234567 2L3',
      'M1.234567 2a3 4 0 0 1 5 6',
      'M1.234567 2l3 4',
      'M1.234567 2Z3',
      'M1.234567 2 LNaN 4',
    ])
      expect(roundAbsolutePath(input)).toBe(input);
  });
  const input =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 240" aria-labelledby="1.234567 title"><title id="title">1.234567 한글 &amp; title</title><desc>2.345678 description</desc><style>#x { opacity:.123456; } .1\\.234567 { fill:red; }</style><defs><linearGradient id="1.234567"><stop offset="0" stop-color="red"/></linearGradient></defs><g data-count="1.234567"><polygon points="1.234567,2.345678 4.567891,6.789123 8,9" fill="url(#1.234567)"/><circle id="x" cx="-0.000001" cy="2.345678" r="1.234567"><animate attributeName="cx" begin="x.click" values="1.234567;2.345678" dur="1.234567s"/></circle><text x="1.234567">3.456789</text></g></svg>';

  it('detects the numeric ID regression in the rejected stock SVGO numeric plugin', () => {
    const output = optimizeSvgArtifact(input, 'svgo-numeric');
    const contract = compareContracts(input, output);
    expect(contract.preserved).toBe(false);
    expect(contract.outputMissingReferences).toContain('1.234567');
  });

  it('rounds known polygon coordinates while preserving text, IDs, CSS and SMIL', () => {
    const output = optimizeSvgArtifact(input, 'geometry');
    expect(output).toContain('points="1.23,2.35 4.57,6.79 8,9"');
    for (const exact of [
      'viewBox="0 0 840 240"',
      'id="1.234567"',
      'url(#1.234567)',
      'data-count="1.234567"',
      '1.234567 한글 &amp; title',
      '2.345678 description',
      '#x { opacity:.123456; }',
      'values="1.234567;2.345678"',
      'dur="1.234567s"',
      'begin="x.click"',
      '<text x="1.234567">3.456789</text>',
    ]) {
      expect(output).toContain(exact);
    }
  });

  it('normalizes negative zero and does not rewrite malformed, unit-bearing or unknown attributes', () => {
    const output = optimizeSvgArtifact(
      '<svg><circle cx="-0.00001" cy="1.234567px" r="1e-3" data-foo="1.234567"/><polygon points="1.234567,garbage"/></svg>',
      'geometry',
    );
    expect(output).toContain('cx="0"');
    expect(output).toContain('cy="1.234567px"');
    expect(output).toContain('r="1e-3"');
    expect(output).toContain('data-foo="1.234567"');
    expect(output).toContain('points="1.234567,garbage"');
  });

  it('preserves meaningful tiny lengths instead of rounding them to zero', () => {
    expect(
      optimizeSvgArtifact(
        '<svg><circle r="0.001"/><rect width="0.001" height="2"/></svg>',
        'geometry',
      ),
    ).toContain('r="0.001"');
  });

  it('retains animated path data and all animations', () => {
    const svg =
      '<svg><path id="p" d="M1.234567 2.345678L3.456789 4.567891"><animate attributeName="d" values="M1.234567 2.345678;M3.456789 4.567891" dur="2s"/></path></svg>';
    const output = optimizeSvgArtifact(svg, 'geometry-path');
    expect(output).toContain('d="M1.234567 2.345678L3.456789 4.567891"');
    expect(output).toContain('<animate');
  });

  it('rounds only complete translations on groups without changing scale, CSS or text positioning', () => {
    const output = optimizeSvgArtifact(
      '<svg><g transform="translate(123.456789,-0.00001)"><path d="M0 0L1 1"/></g><g transform="translate(123.456789,5) scale(1.234567)"/><text transform="translate(1.234567,2.345678)">text</text></svg>',
      'geometry',
    );
    expect(output).toContain('transform="translate(123.46,0)"');
    expect(output).toContain('transform="translate(123.456789,5) scale(1.234567)"');
    expect(output).toContain('<text transform="translate(1.234567,2.345678)">');
  });
});
