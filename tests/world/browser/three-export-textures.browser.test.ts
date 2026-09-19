import { afterEach, expect, it, vi } from 'vitest';
import {
  BoxGeometry,
  CanvasTexture,
  DataTexture,
  FloatType,
  Group,
  Mesh,
  MeshStandardMaterial,
  RGBAFormat,
  RepeatWrapping,
  SRGBColorSpace,
} from 'three';
import { flattenVisibleContent } from '../../../src/world/three/export-content.js';
import { prepareExportTextures } from '../../../src/world/three/export-textures.js';
import { disposeObjectTree } from '../../../src/world/three/resources.js';

afterEach(() => vi.restoreAllMocks());

it('converts export-only normal pixels to a browser image while retaining live texture data', () => {
  const data = new Uint8Array([128, 145, 255, 255]);
  const texture = new DataTexture(data, 1, 1, RGBAFormat);
  texture.offset.set(0.2, 0.4);
  texture.repeat.set(3, 5);
  texture.rotation = 0.3;
  texture.wrapS = RepeatWrapping;
  texture.colorSpace = SRGBColorSpace;
  const content = new Group().add(
    new Mesh(new BoxGeometry(), [new MeshStandardMaterial({ map: texture, normalMap: texture })]),
  );
  const copy = flattenVisibleContent(content);
  prepareExportTextures(copy);
  const mesh = copy.children[0];
  if (
    !(mesh instanceof Mesh) ||
    !Array.isArray(mesh.material) ||
    !(mesh.material[0] instanceof MeshStandardMaterial)
  )
    throw new TypeError('Expected exported material');
  const image: unknown = mesh.material[0].normalMap?.image;
  expect(image).toBeInstanceOf(HTMLCanvasElement);
  if (!(image instanceof HTMLCanvasElement)) throw new TypeError('Expected browser image source');
  expect([...(image.getContext('2d')?.getImageData(0, 0, 1, 1).data ?? [])]).toEqual([...data]);
  expect(texture.image.data).toBe(data);
  expect(mesh.material[0].normalMap).toBeInstanceOf(CanvasTexture);
  expect(mesh.material[0].normalMap).toBe(mesh.material[0].map);
  expect(mesh.material[0].normalMap?.offset.toArray()).toEqual([0.2, 0.4]);
  expect(mesh.material[0].normalMap?.repeat.toArray()).toEqual([3, 5]);
  expect(mesh.material[0].normalMap).toMatchObject({
    rotation: 0.3,
    wrapS: RepeatWrapping,
    colorSpace: SRGBColorSpace,
    flipY: false,
  });
  disposeObjectTree(copy);
  disposeObjectTree(content);
});

it('reports unsupported floating pixels and unavailable 2D encoding', () => {
  const texture = new DataTexture(new Float32Array(4), 1, 1, RGBAFormat, FloatType);
  const material = new MeshStandardMaterial({ map: texture });
  const content = new Group().add(new Mesh(new BoxGeometry(), material));
  expect(() => prepareExportTextures(content)).toThrow(expect.objectContaining({ code: 'export' }));
  texture.dispose();
  material.map = new DataTexture(new Uint8Array(4), 1, 1, RGBAFormat);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  expect(() => prepareExportTextures(content)).toThrow(expect.objectContaining({ code: 'export' }));
  disposeObjectTree(content);
});
