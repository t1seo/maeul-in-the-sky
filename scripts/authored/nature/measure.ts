import type { Document } from '@gltf-transform/core';
import { getBounds } from '@gltf-transform/functions';
import sharp from 'sharp';
import { digest, NatureAssetError } from './sources.js';

export function measureNatureNodes(document: Document) {
  return document
    .getRoot()
    .listNodes()
    .map((node) => {
      const primitives = node.getMesh()?.listPrimitives() ?? [];
      const bounds = getBounds(node);
      return {
        name: node.getName(),
        bounds: { min: bounds.min, max: bounds.max },
        triangles: primitives.reduce(
          (sum, primitive) => sum + (primitive.getIndices()?.getCount() ?? 0) / 3,
          0,
        ),
        vertices: primitives.reduce(
          (sum, primitive) => sum + (primitive.getAttribute('POSITION')?.getCount() ?? 0),
          0,
        ),
        primitives: primitives.length,
        materials: primitives.map((primitive) => primitive.getMaterial()?.getName() ?? ''),
      };
    });
}

export function assertNatureBounds(
  before: ReturnType<typeof measureNatureNodes>,
  after: ReturnType<typeof measureNatureNodes>,
): void {
  if (before.length !== after.length)
    throw new NatureAssetError('collection', 'Model count changed');
  for (const [index, original] of before.entries()) {
    const output = after[index];
    if (
      !output ||
      output.name !== original.name ||
      original.triangles !== output.triangles ||
      original.primitives !== output.primitives
    ) {
      throw new NatureAssetError(original.name, 'Geometry or named node was lost');
    }
    for (const side of ['min', 'max'] as const) {
      for (let axis = 0; axis < 3; axis += 1) {
        if (Math.abs(original.bounds[side][axis] - output.bounds[side][axis]) > 1e-6) {
          throw new NatureAssetError(original.name, 'Authored vertex bounds changed');
        }
      }
    }
  }
}

export async function measureNature(document: Document) {
  const root = document.getRoot();
  const textures = [];
  for (const texture of root.listTextures()) {
    const image = texture.getImage();
    if (!image) throw new NatureAssetError(texture.getName(), 'Embedded image is missing');
    const { width, height, format } = await sharp(image).metadata();
    if (!width || !height)
      throw new NatureAssetError(texture.getName(), 'Image dimensions are missing');
    textures.push({
      name: texture.getName(),
      format,
      width,
      height,
      bytes: image.byteLength,
      decodedRgbaBytes: width * height * 4,
      sha256: digest(image),
    });
  }
  const nodes = measureNatureNodes(document);
  return {
    nodes,
    triangles: nodes.reduce((sum, node) => sum + node.triangles, 0),
    vertices: nodes.reduce((sum, node) => sum + node.vertices, 0),
    primitives: nodes.reduce((sum, node) => sum + node.primitives, 0),
    materials: root.listMaterials().length,
    textures,
    imageBytes: textures.reduce((sum, texture) => sum + texture.bytes, 0),
    decodedRgbaBytes: textures.reduce((sum, texture) => sum + texture.decodedRgbaBytes, 0),
  };
}
