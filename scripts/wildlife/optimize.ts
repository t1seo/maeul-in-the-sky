import type { Document } from '@gltf-transform/core';
import { dedup, prune, resample } from '@gltf-transform/functions';
import { consolidateWildlifeMaterials } from './materials.js';
import { adaptWildlifePalette } from './palette.js';
import { resizeWildlifeTextures } from './textures.js';

export const PEACEFUL_CLIP = /(?:^|\|)(?:Idle(?:_2|_Headlow)?|Eating)$/;

export function retainWildlifeClip(id: string, name: string): boolean {
  if (id === 'frog') return name === 'FrogArmature|Frog_Idle';
  if (id === 'spider') return name === 'SpiderArmature|Spider_Idle';
  if (id === 'fish' || id === 'whale') return name === 'Armature|Swim';
  return (
    PEACEFUL_CLIP.test(name) && !((id === 'horse' || id === 'donkey') && name === 'Idle_Headlow')
  );
}

export async function optimizeWildlife(document: Document, id: string): Promise<void> {
  const root = document.getRoot();
  for (const animation of root.listAnimations()) {
    if (retainWildlifeClip(id, animation.getName())) continue;
    for (const channel of animation.listChannels()) channel.dispose();
    for (const sampler of animation.listSamplers()) sampler.dispose();
    animation.dispose();
  }
  adaptWildlifePalette(document, id);
  if (id !== 'squirrel') consolidateWildlifeMaterials(document, id);
  await resizeWildlifeTextures(document, id);
  await document.transform(
    resample({ tolerance: 0, cleanup: false }),
    dedup(),
    prune({ keepLeaves: true, keepAttributes: true, keepIndices: true }),
  );
}
