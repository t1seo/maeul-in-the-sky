import { describe, expect, it, vi } from 'vitest';
import {
  BoxGeometry,
  Group,
  InstancedMesh,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  Points,
  Sprite,
  SpriteMaterial,
  Texture,
} from 'three';
import { disposeObjectTree } from '../../../src/world/three/resources.js';

describe('Three resource disposal', () => {
  it('releases shared geometry, material and texture exactly once', () => {
    const texture = new Texture();
    const geometry = new BoxGeometry();
    const material = new MeshStandardMaterial({ map: texture });
    const root = new Group();
    root.add(
      new Mesh(geometry, [material, material]),
      new Points(geometry, material),
      new LineSegments(geometry, material),
      new Sprite(new SpriteMaterial({ map: texture })),
    );
    const geometryDispose = vi.spyOn(geometry, 'dispose');
    const materialDispose = vi.spyOn(material, 'dispose');
    const textureDispose = vi.spyOn(texture, 'dispose');
    disposeObjectTree(root);
    expect(geometryDispose).toHaveBeenCalledTimes(1);
    expect(materialDispose).toHaveBeenCalledTimes(1);
    expect(textureDispose).toHaveBeenCalledTimes(1);
    expect(root.children).toHaveLength(0);
  });

  it('releases instancing buffers and leaves shared live textures intact for export clones', () => {
    const texture = new Texture();
    const material = new MeshStandardMaterial({ map: texture });
    const instance = new InstancedMesh(new BoxGeometry(), material, 2);
    const root = new Group().add(instance);
    const instanceDispose = vi.spyOn(instance, 'dispose');
    const textureDispose = vi.spyOn(texture, 'dispose');
    disposeObjectTree(root, false);
    expect(instanceDispose).toHaveBeenCalledTimes(1);
    expect(textureDispose).not.toHaveBeenCalled();
  });
});
