import { MeshStandardMaterial } from 'three';
import type { BufferGeometry, Material, Texture } from 'three';

export class GeometryResources {
  private readonly geometries = new Set<BufferGeometry>();
  private readonly materials = new Set<Material>();
  private readonly textures = new Set<Texture>();
  private readonly instances = new Set<{ dispose: () => void }>();
  private readonly sharedMaterials = new Map<string, MeshStandardMaterial>();

  geometry<T extends BufferGeometry>(geometry: T): T {
    this.geometries.add(geometry);
    return geometry;
  }

  material<T extends Material>(material: T): T {
    this.materials.add(material);
    return material;
  }

  texture<T extends Texture>(texture: T): T {
    this.textures.add(texture);
    return texture;
  }

  instance(instance: { dispose: () => void }): void {
    this.instances.add(instance);
  }

  standard(roughness: number, opacity: number, glow = false): MeshStandardMaterial {
    const key = `${roughness}:${opacity}:${glow}`;
    const cached = this.sharedMaterials.get(key);
    if (cached) return cached;
    const material = this.material(
      new MeshStandardMaterial({
        color: '#ffffff',
        roughness,
        metalness: 0,
        opacity,
        transparent: opacity < 1,
        depthWrite: opacity === 1,
        emissive: glow ? '#ffbd6c' : '#000000',
        emissiveIntensity: 0,
      }),
    );
    this.sharedMaterials.set(key, material);
    return material;
  }

  dispose(): void {
    for (const instance of this.instances) instance.dispose();
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
    for (const texture of this.textures) texture.dispose();
    this.instances.clear();
    this.geometries.clear();
    this.materials.clear();
    this.textures.clear();
    this.sharedMaterials.clear();
  }
}
