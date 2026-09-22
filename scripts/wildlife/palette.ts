import type { Document } from '@gltf-transform/core';
import { Color } from 'three';
import { WildlifeAssetError } from './sources.js';

const JELLYFISH_COLORS: ReadonlyMap<string, string> = new Map([
  ['Mat.1', '#729aa7'],
  ['Mat', '#c4dde0'],
  ['Mat.2', '#e8ede4'],
]);

export function adaptWildlifePalette(document: Document, id: string): void {
  if (id !== 'jellyfish') return;
  for (const material of document.getRoot().listMaterials()) {
    const swatch = JELLYFISH_COLORS.get(material.getName());
    if (!swatch)
      throw new WildlifeAssetError(id, 'Unrecognized source material for palette adaptation');
    const tint = new Color(swatch);
    material.setBaseColorFactor([tint.r, tint.g, tint.b, material.getBaseColorFactor()[3]]);
  }
}

export function wildlifePaletteChanges(id: string): readonly string[] {
  return id === 'jellyfish'
    ? [
        'Adapted the three original solid material colors to muted blue-gray, pale pearl-blue, and ivory; preserved geometry, normals, texture coordinates, original alpha values, and opaque alpha mode.',
      ]
    : [];
}
