import { svgNumber } from '../../../core/svg.js';
import type { IsoCell } from './projection.js';
import { THW, THH } from './projection.js';
import { currentSurfaceContext } from './surface-context.js';
import { renderSurfaceBlock } from './surface-block.js';
export function renderBlock(cell: IsoCell, isWater = false): string {
  if (currentSurfaceContext()) return renderSurfaceBlock(cell, isWater);
  const { isoX: cx, isoY: cy, height: h, colors } = cell;

  if (h === 0) {
    const topPoints = [
      `${svgNumber(cx)},${svgNumber(cy - THH)}`,
      `${svgNumber(cx + THW)},${svgNumber(cy)}`,
      `${svgNumber(cx)},${svgNumber(cy + THH)}`,
      `${svgNumber(cx - THW)},${svgNumber(cy)}`,
    ].join(' ');

    if (isWater) {
      // 6a: Multi-layer water surface — base, lighter inner diamond, specular highlight
      const inset = 1.5;
      const innerPoints = [
        `${svgNumber(cx)},${svgNumber(cy - THH + inset)}`,
        `${svgNumber(cx + THW - inset * 1.5)},${svgNumber(cy)}`,
        `${svgNumber(cx)},${svgNumber(cy + THH - inset)}`,
        `${svgNumber(cx - THW + inset * 1.5)},${svgNumber(cy)}`,
      ].join(' ');
      return (
        `<polygon points="${topPoints}" fill="${colors.top}" stroke="${colors.left}" stroke-width="0.3"/>` +
        `<polygon points="${innerPoints}" fill="${colors.top}" opacity="0.3" style="filter:brightness(1.3)"/>` +
        `<ellipse cx="${svgNumber(cx + 1)}" cy="${svgNumber(cy - 0.5)}" rx="1.5" ry="0.6" fill="#fff" opacity="0.15"/>`
      );
    }

    return `<polygon points="${topPoints}" fill="${colors.top}" stroke="${colors.left}" stroke-width="0.3"/>`;
  }

  const parts: string[] = [];

  // Left face
  const leftPoints = [
    `${svgNumber(cx - THW)},${svgNumber(cy)}`,
    `${svgNumber(cx)},${svgNumber(cy + THH)}`,
    `${svgNumber(cx)},${svgNumber(cy + THH + h)}`,
    `${svgNumber(cx - THW)},${svgNumber(cy + h)}`,
  ].join(' ');
  parts.push(`<polygon points="${leftPoints}" fill="${colors.left}"/>`);

  // 6e: Side face water tinting — gradient overlay for elevated water cells
  if (isWater && h > 0) {
    // Darker overlay at the bottom half of left face for water depth
    const midY = cy + THH + h * 0.5;
    const leftGradPoints = [
      `${svgNumber(cx - THW)},${svgNumber(cy + h * 0.5)}`,
      `${svgNumber(cx)},${svgNumber(midY)}`,
      `${svgNumber(cx)},${svgNumber(cy + THH + h)}`,
      `${svgNumber(cx - THW)},${svgNumber(cy + h)}`,
    ].join(' ');
    parts.push(`<polygon points="${leftGradPoints}" fill="#1a3a6a" opacity="0.15"/>`);
  }

  // Right face
  const rightPoints = [
    `${svgNumber(cx + THW)},${svgNumber(cy)}`,
    `${svgNumber(cx)},${svgNumber(cy + THH)}`,
    `${svgNumber(cx)},${svgNumber(cy + THH + h)}`,
    `${svgNumber(cx + THW)},${svgNumber(cy + h)}`,
  ].join(' ');
  parts.push(`<polygon points="${rightPoints}" fill="${colors.right}"/>`);

  if (isWater && h > 0) {
    const midY = cy + THH + h * 0.5;
    const rightGradPoints = [
      `${svgNumber(cx + THW)},${svgNumber(cy + h * 0.5)}`,
      `${svgNumber(cx)},${svgNumber(midY)}`,
      `${svgNumber(cx)},${svgNumber(cy + THH + h)}`,
      `${svgNumber(cx + THW)},${svgNumber(cy + h)}`,
    ].join(' ');
    parts.push(`<polygon points="${rightGradPoints}" fill="#1a3a6a" opacity="0.12"/>`);
  }

  // Top face (drawn last)
  const topPoints = [
    `${svgNumber(cx)},${svgNumber(cy - THH)}`,
    `${svgNumber(cx + THW)},${svgNumber(cy)}`,
    `${svgNumber(cx)},${svgNumber(cy + THH)}`,
    `${svgNumber(cx - THW)},${svgNumber(cy)}`,
  ].join(' ');

  if (isWater) {
    // 6a: Multi-layer water surface on elevated water blocks
    const inset = 1.5;
    const innerPoints = [
      `${svgNumber(cx)},${svgNumber(cy - THH + inset)}`,
      `${svgNumber(cx + THW - inset * 1.5)},${svgNumber(cy)}`,
      `${svgNumber(cx)},${svgNumber(cy + THH - inset)}`,
      `${svgNumber(cx - THW + inset * 1.5)},${svgNumber(cy)}`,
    ].join(' ');
    parts.push(
      `<polygon points="${topPoints}" fill="${colors.top}" stroke="${colors.left}" stroke-width="0.3"/>`,
    );
    parts.push(
      `<polygon points="${innerPoints}" fill="${colors.top}" opacity="0.3" style="filter:brightness(1.3)"/>`,
    );
    parts.push(
      `<ellipse cx="${svgNumber(cx + 1)}" cy="${svgNumber(cy - 0.5)}" rx="1.5" ry="0.6" fill="#fff" opacity="0.15"/>`,
    );
  } else {
    parts.push(
      `<polygon points="${topPoints}" fill="${colors.top}" stroke="${colors.left}" stroke-width="0.3"/>`,
    );
  }

  return parts.join('');
}
