import { gzipSync } from 'node:zlib';
import { optimizeSvgArtifact } from './optimize.js';
import { compareContracts } from './integrity.js';

export function optimizeGeneratedArtifact(svg: string): string {
  const candidate = optimizeSvgArtifact(svg, 'geometry-path');
  if (!compareContracts(svg, candidate).preserved) {
    throw new TypeError('SVG optimization changed protected content or references');
  }
  const artifact =
    Buffer.byteLength(candidate) > Buffer.byteLength(svg) ||
    gzipSync(candidate).length >= gzipSync(svg).length
      ? svg
      : candidate;
  return artifact.replace(/^[ \t]+$/gm, '');
}
