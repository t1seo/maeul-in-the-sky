import type { WorldCaptureOptions } from '../model/renderer-types.js';
import type { WorldScene, WorldView } from '../model/types.js';
import { renderMapSvg } from './render.js';

export class MapCaptureError extends Error {
  readonly name = 'MapCaptureError';
  constructor(
    readonly reason: 'dimensions' | 'canvas' | 'decode' | 'disposed',
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

export async function captureMap(
  scene: WorldScene,
  view: WorldView,
  options: WorldCaptureOptions,
): Promise<Blob> {
  if (
    ![options.width, options.height].every(
      (size) => Number.isInteger(size) && size > 0 && size <= 8192,
    ) ||
    options.width * options.height > 16_777_216
  ) {
    throw new MapCaptureError(
      'dimensions',
      'Choose positive whole dimensions up to 8192 pixels and 16 megapixels.',
    );
  }
  const svg = new Blob([renderMapSvg(scene, view, options)], {
    type: 'image/svg+xml;charset=utf-8',
  });
  if (options.format === 'svg') return svg;
  const url = URL.createObjectURL(svg);
  try {
    const picture = new Image();
    picture.src = url;
    await picture.decode();
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const context = canvas.getContext('2d');
    if (!context)
      throw new MapCaptureError('canvas', 'This browser cannot create the postcard canvas.');
    context.drawImage(picture, 0, 0, options.width, options.height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new MapCaptureError('canvas', 'The postcard could not be encoded.')),
        'image/png',
      );
    });
  } catch (error) {
    if (error instanceof MapCaptureError) throw error;
    if (error instanceof Error)
      throw new MapCaptureError('decode', 'The SVG postcard could not be rasterized.', {
        cause: error,
      });
    throw error;
  } finally {
    URL.revokeObjectURL(url);
  }
}
