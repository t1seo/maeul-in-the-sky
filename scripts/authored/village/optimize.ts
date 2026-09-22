import type { Document } from '@gltf-transform/core';
import { dequantize, dedup, flatten, join, prune, weld } from '@gltf-transform/functions';
import { bakeVillageColors, embedVillageTextures } from './materials.js';
import { VillagePreparationError, type VillageSource } from './schema.js';

function poseGate(document: Document, id: string): void {
  const animation = document
    .getRoot()
    .listAnimations()
    .find((clip) => clip.getName() === 'open');
  if (!animation) throw new VillagePreparationError(id, 'Missing authored open clip');
  for (const channel of animation.listChannels()) {
    const output = channel.getSampler()?.getOutput();
    const node = channel.getTargetNode();
    if (!node || !output || channel.getTargetPath() !== 'rotation') {
      throw new VillagePreparationError(id, 'Unexpected gate opening channel');
    }
    const quaternion: [number, number, number, number] = [0, 0, 0, 1];
    const [x, y, z, w] = output.getElement(output.getCount() - 1, quaternion);
    node.setRotation([x, y, z, w]);
  }
}

export async function optimizeVillage(
  document: Document,
  model: VillageSource,
): Promise<readonly string[]> {
  const changes = [
    'Source positions and authored normals retained; static transforms baked, resources deduplicated and primitives joined.',
  ];
  await document.transform(dequantize());
  if (model.treatment === 'gate') {
    poseGate(document, model.id);
    changes.push(
      'Baked final authored open pose (gate leaves ±84 degrees) to keep the entrance passable.',
    );
  }
  for (const clip of document.getRoot().listAnimations()) {
    for (const channel of clip.listChannels()) channel.dispose();
    for (const sampler of clip.listSamplers()) sampler.dispose();
    clip.dispose();
  }
  if (model.source.creator === '3D Assets') {
    changes.push(
      'Decoded KHR_mesh_quantization offline into core glTF; removed unused open/close animation data.',
    );
    if (model.id === 'hanok' || model.id === 'hanok-gate') {
      for (const material of document.getRoot().listMaterials()) {
        if (material.getName() === 'tile') material.setBaseColorFactor([0.067, 0.078, 0.09, 1]);
      }
      changes.push(
        'Darkened only roof tile material to charcoal slate; original door, timber, floor and plaster colors preserved.',
      );
    }
  }
  if (model.treatment === 'onggi') {
    for (const material of document.getRoot().listMaterials())
      material.setBaseColorFactor([0.065, 0.022, 0.01, 1]);
    changes.push('Replaced pale clay color with dark brown earthenware glaze and roughness 0.38.');
  }
  if (model.treatment === 'snow') {
    for (const material of document.getRoot().listMaterials()) {
      if (material.getName().startsWith('Roof')) material.setBaseColorFactor([0.8, 0.86, 0.9, 1]);
    }
    changes.push('Applied snow color to authored roof surfaces for the winter catalog variant.');
  }
  if (model.treatment === 'fountain') {
    for (const mesh of document.getRoot().listMeshes()) {
      for (const primitive of mesh.listPrimitives()) {
        if (primitive.getMaterial()?.getName() === 'Water') primitive.dispose();
      }
    }
    changes.push(
      'Removed static source water; the tour supplies season-aware water or ice and fountain streams.',
    );
  }
  if (document.getRoot().listTextures().length === 0) {
    bakeVillageColors(document, model.id);
    changes.push(
      'Baked linear base colors into normalized vertex colors; unified opaque nonmetallic roughness 0.86, except glazed jars, for a single static drawable.',
    );
  } else {
    await embedVillageTextures(document, model.id);
    changes.push(
      'Embedded source textures and baked texture transforms; opaque color images over 1024 pixels resized to 1024 JPEG at quality 90.',
    );
  }
  await document.transform(flatten(), join({ keepNamed: false }), weld(), dedup(), prune());
  if (document.getRoot().listExtensionsRequired().length > 0) {
    throw new VillagePreparationError(model.id, 'Required runtime extension remains');
  }
  return changes;
}
