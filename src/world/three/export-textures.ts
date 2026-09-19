import { CanvasTexture, DataTexture, Mesh, RGBAFormat, type Group } from 'three';
import { ThreeRendererError } from './errors.js';

export function prepareExportTextures(content: Group): void {
  const prepared = new Map<DataTexture, CanvasTexture>();
  content.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      for (const key of Object.keys(material)) {
        const value: unknown = Reflect.get(material, key);
        if (!(value instanceof DataTexture)) continue;
        let converted = prepared.get(value);
        if (!converted) {
          converted = convertTexture(value);
          prepared.set(value, converted);
          value.dispose();
        }
        Reflect.set(material, key, converted);
      }
    }
  });
}

function convertTexture(source: DataTexture): CanvasTexture {
  const { data, width, height } = source.image;
  if (
    source.format !== RGBAFormat ||
    !(data instanceof Uint8Array || data instanceof Uint8ClampedArray)
  ) {
    throw new ThreeRendererError('export', 'This model texture requires RGBA byte pixels.');
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context)
    throw new ThreeRendererError('export', 'The browser could not prepare model textures.');
  context.putImageData(new ImageData(new Uint8ClampedArray(data), width, height), 0, 0);
  const result = new CanvasTexture(canvas);
  result.name = source.name;
  result.mapping = source.mapping;
  result.channel = source.channel;
  result.wrapS = source.wrapS;
  result.wrapT = source.wrapT;
  result.magFilter = source.magFilter;
  result.minFilter = source.minFilter;
  result.anisotropy = source.anisotropy;
  result.format = source.format;
  result.type = source.type;
  result.colorSpace = source.colorSpace;
  result.offset.copy(source.offset);
  result.repeat.copy(source.repeat);
  result.center.copy(source.center);
  result.rotation = source.rotation;
  result.matrixAutoUpdate = source.matrixAutoUpdate;
  result.matrix.copy(source.matrix);
  result.generateMipmaps = source.generateMipmaps;
  result.premultiplyAlpha = source.premultiplyAlpha;
  result.flipY = source.flipY;
  result.unpackAlignment = source.unpackAlignment;
  return result;
}
