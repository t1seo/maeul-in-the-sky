import { afterEach, expect, test, vi } from 'vitest';
import { copyOrDownload, pngBlob } from '../../../src/demo/downloads.js';
import { captureDownloads, downloadAt } from './harness.js';

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="5"><rect width="3" height="3" fill="red"/></svg>';
afterEach(() => vi.restoreAllMocks());

test.each([true, false])(
  'renders real PNG at twice the dimensions with light=%s background',
  async (light) => {
    const revoked = vi.spyOn(URL, 'revokeObjectURL');
    const blob = await pngBlob(svg, 10, 5, light);
    const bitmap = await createImageBitmap(blob);
    try {
      expect(blob.type).toBe('image/png');
      expect([bitmap.width, bitmap.height]).toEqual([20, 10]);
      const canvas = document.createElement('canvas');
      canvas.width = 20;
      canvas.height = 10;
      const context = canvas.getContext('2d');
      if (!context) throw new TypeError('Chromium canvas is unavailable');
      context.drawImage(bitmap, 0, 0);
      expect([...context.getImageData(19, 9, 1, 1).data]).toEqual(
        light ? [255, 255, 255, 255] : [13, 17, 23, 255],
      );
      expect([...context.getImageData(0, 0, 1, 1).data]).toEqual([255, 0, 0, 255]);
      expect(revoked).toHaveBeenCalledTimes(1);
    } finally {
      bitmap.close();
    }
  },
);

test('reports unavailable canvas and releases its temporary SVG URL', async () => {
  const revoked = vi.spyOn(URL, 'revokeObjectURL');
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  await expect(pngBlob(svg, 10, 5, false)).rejects.toThrow('PNG export needs canvas support');
  expect(revoked).toHaveBeenCalledTimes(1);
});

test('reports encoding failure and releases its temporary SVG URL', async () => {
  const revoked = vi.spyOn(URL, 'revokeObjectURL');
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(null));
  await expect(pngBlob(svg, 10, 5, true)).rejects.toThrow('Could not create the PNG');
  expect(revoked).toHaveBeenCalledTimes(1);
});

test('releases a temporary SVG URL when image decoding rejects malformed input', async () => {
  const revoked = vi.spyOn(URL, 'revokeObjectURL');
  await expect(pngBlob('<broken>', 10, 5, false)).rejects.toThrow();
  expect(revoked).toHaveBeenCalledTimes(1);
});

test('downloads the exact text when clipboard permissions are denied and revokes the download URL', async () => {
  const capture = captureDownloads();
  vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
    new DOMException('Denied', 'NotAllowedError'),
  );
  const revoke = vi.spyOn(URL, 'revokeObjectURL');
  vi.useFakeTimers();
  try {
    expect(await copyOrDownload('My settings', 'settings.txt', 'text/plain')).toContain(
      'Clipboard unavailable',
    );
    const blob = await downloadAt(capture.downloads, 'settings.txt');
    expect(await blob.text()).toBe('My settings');
    expect(blob.type).toBe('text/plain');
    vi.advanceTimersByTime(1000);
    expect(revoke).toHaveBeenCalledTimes(1);
    expect(document.querySelector('a[download]')).toBeNull();
  } finally {
    vi.useRealTimers();
    capture.stop();
  }
});
