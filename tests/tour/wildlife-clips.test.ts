import { Document } from '@gltf-transform/core';
import { expect, it } from 'vitest';
import { optimizeWildlife, retainWildlifeClip } from '../../scripts/wildlife/optimize.js';

it.each([
  ['frog', 'FrogArmature|Frog_Idle', true],
  ['spider', 'SpiderArmature|Spider_Idle', true],
  ['fish', 'Armature|Swim', true],
  ['whale', 'Armature|Swim', true],
  ['cow', 'Armature|Swim', false],
  ['frog', 'FrogArmature|Frog_Attack', false],
  ['frog', 'FrogArmature|Frog_Jump', false],
  ['spider', 'SpiderArmature|Spider_Death', false],
  ['spider', 'SpiderArmature|Spider_Walk', false],
  ['fish', 'Unknown|Idle_Attack', false],
])('selects only approved source motion for %s: %s', (species, clip, allowed) => {
  // Given an original source animation label.
  // When its species-specific peaceful behavior is selected.
  const retained = retainWildlifeClip(species, clip);
  // Then unrelated, combat and travel clips cannot enter the shipped tour.
  expect(retained).toBe(allowed);
});

it('removes animation sampler data when excluding a combat clip', async () => {
  // Given independent idle and combat keyframes in the source graph.
  const document = new Document();
  const buffer = document.createBuffer();
  const node = document.createNode('animal');
  document.createScene().addChild(node);
  for (const [name, value] of [
    ['Idle', 1],
    ['Attack', 100],
  ] as const) {
    const input = document
      .createAccessor(`${name}-time`, buffer)
      .setType('SCALAR')
      .setArray(new Float32Array([0, value]));
    const output = document
      .createAccessor(`${name}-motion`, buffer)
      .setType('VEC3')
      .setArray(new Float32Array([0, 0, 0, 0, value, 0]));
    const sampler = document.createAnimationSampler().setInput(input).setOutput(output);
    const channel = document
      .createAnimationChannel()
      .setTargetNode(node)
      .setTargetPath('translation')
      .setSampler(sampler);
    document.createAnimation(name).addSampler(sampler).addChannel(channel);
  }
  // When the non-peaceful clip is removed from the shipped inventory.
  await optimizeWildlife(document, 'squirrel');
  // Then its detached samplers cannot retain unused binary payload.
  expect(
    document
      .getRoot()
      .listAnimations()
      .map((animation) => animation.getName()),
  ).toEqual(['Idle']);
  expect(
    document
      .getRoot()
      .listAccessors()
      .map((accessor) => accessor.getName())
      .sort(),
  ).toEqual(['Idle-motion', 'Idle-time']);
});
