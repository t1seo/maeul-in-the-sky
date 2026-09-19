import { describe, expect, it, vi } from 'vitest';
import { browserFrames, openThree } from '../three/browser-harness.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { ThreeRendererError } from '../../../src/world/three/errors.js';

describe('Three export failure handling', () => {
  it('surfaces GLB exporter failures without destroying the active world', async () => {
    const { port } = await openThree();
    if (!port.exportModel) throw new TypeError('Expected GLB exporter');
    const parse = vi.spyOn(GLTFExporter.prototype, 'parseAsync').mockResolvedValue({});
    await expect(port.exportModel()).rejects.toMatchObject({ code: 'export' });
    parse.mockRejectedValue(new Error('Exporter could not encode'));
    await expect(port.exportModel()).rejects.toMatchObject({
      code: 'export',
      cause: expect.any(Error),
    });
    const error = new ThreeRendererError('export', 'Encoding cancelled');
    parse.mockRejectedValue(error);
    await expect(port.exportModel()).rejects.toBe(error);
    parse.mockRestore();
    await expect(port.exportModel()).resolves.toBeInstanceOf(Blob);
  });
  it('rejects unsupported dimensions and SVG while preserving the live view', async () => {
    const { port, canvas } = await openThree();
    const initialSize = [canvas.width, canvas.height];
    for (const options of [
      { format: 'svg', width: 100, height: 100 },
      { format: 'png', width: 0, height: 100 },
      { format: 'png', width: 32.5, height: 100 },
      { format: 'png', width: 100, height: 4097 },
    ] as const)
      await expect(port.capture(options)).rejects.toMatchObject({ code: 'capture' });
    expect([canvas.width, canvas.height]).toEqual(initialSize);
    await expect(port.capture({ format: 'png', width: 64, height: 64 })).resolves.toBeInstanceOf(
      Blob,
    );
  });

  it('recovers from browser PNG encoding failure', async () => {
    const { port, canvas } = await openThree();
    const initialSize = [canvas.width, canvas.height];
    const encode = vi.spyOn(canvas, 'toBlob').mockImplementation((callback) => callback(null));
    await expect(port.capture({ format: 'png', width: 200, height: 150 })).rejects.toMatchObject({
      code: 'capture',
    });
    expect([canvas.width, canvas.height]).toEqual(initialSize);
    encode.mockImplementation(() => {
      throw new DOMException('Tainted capture', 'SecurityError');
    });
    await expect(port.capture({ format: 'png', width: 200, height: 150 })).rejects.toMatchObject({
      code: 'capture',
      cause: expect.any(DOMException),
    });
    encode.mockRestore();
    await expect(port.capture({ format: 'png', width: 64, height: 64 })).resolves.toBeInstanceOf(
      Blob,
    );
  });

  it('rejects concurrent photos and does not render after disposal during encoding', async () => {
    const { port, canvas } = await openThree();
    let encode: BlobCallback | undefined;
    vi.spyOn(canvas, 'toBlob').mockImplementation((callback) => {
      encode = callback;
    });
    const first = port.capture({ format: 'png', width: 120, height: 80 });
    await expect(port.capture({ format: 'png', width: 60, height: 40 })).rejects.toMatchObject({
      code: 'capture',
    });
    port.dispose();
    const stopped = canvas.dataset.frames;
    if (!encode) throw new TypeError('Expected pending PNG encode');
    encode(new Blob(['photo'], { type: 'image/png' }));
    await expect(first).rejects.toMatchObject({ code: 'disposed' });
    await browserFrames();
    expect(canvas.dataset.frames).toBe(stopped);
    expect(canvas.isConnected).toBe(false);
    await expect(port.exportModel?.()).rejects.toMatchObject({ code: 'disposed' });
  });
});
