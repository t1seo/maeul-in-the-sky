import type { ArtStyle } from '../../../core/render-options.js';
import type { AssetColors } from '../palette.js';
import type { AssetType } from '../assets/types.js';
import { renderCatalogAsset } from '../assets/rendering.js';
import { withMotionContext } from '../../../core/animation.js';

export class AssetSymbols {
  private readonly shapes = new Map<string, { id: string; art: string }>();
  private readonly paletteKeys = new WeakMap<AssetColors, string>();

  constructor(private readonly namespace: string) {}

  render(
    type: AssetType,
    colors: AssetColors,
    variant: number,
    x: number,
    y: number,
    artStyle: ArtStyle,
  ): string {
    let paletteKey = this.paletteKeys.get(colors);
    if (paletteKey === undefined) {
      paletteKey = JSON.stringify(colors);
      this.paletteKeys.set(colors, paletteKey);
    }
    const key = `${type}:${variant}:${artStyle}:${paletteKey}`;
    let shape = this.shapes.get(key);
    if (!shape) {
      const id = `${this.namespace}-asset-${this.shapes.size}`;
      const art = withMotionContext({ mode: 'off', namespace: id }, () =>
        renderCatalogAsset(type, colors, variant, artStyle),
      );
      shape = { id, art };
      this.shapes.set(key, shape);
    }
    return `<use href="#${shape.id}" x="${x}" y="${y}"/>`;
  }

  definitions(): string {
    if (!this.shapes.size) return '';
    return `<defs>${Array.from(
      this.shapes.values(),
      ({ id, art }) =>
        `<symbol id="${id}" data-asset-symbol="true" overflow="visible">${art}</symbol>`,
    ).join('')}</defs>`;
  }
}
