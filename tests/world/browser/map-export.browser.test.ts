import { afterEach, expect, it, vi } from 'vitest';
import { mountMap } from '../../../src/world/map/index.js';
import { captureMap, MapCaptureError } from '../../../src/world/map/capture.js';
import { mapScene, mapView } from '../map/fixtures.js';

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});
const options = { format: 'png' as const, width: 320, height: 220 };

it('rejects oversized and fractional capture dimensions without allocating a bitmap', async () => {
  const create = vi.spyOn(URL, 'createObjectURL');
  await expect(
    captureMap(mapScene, mapView, { ...options, width: 8192, height: 8192 }),
  ).rejects.toMatchObject({ reason: 'dimensions' });
  await expect(captureMap(mapScene, mapView, { ...options, width: 1.5 })).rejects.toMatchObject({
    reason: 'dimensions',
  });
  expect(create).not.toHaveBeenCalled();
});

it('reports unavailable canvas support and always revokes the temporary SVG URL', async () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  const revoke = vi.spyOn(URL, 'revokeObjectURL');
  await expect(captureMap(mapScene, mapView, options)).rejects.toMatchObject({ reason: 'canvas' });
  expect(revoke).toHaveBeenCalledTimes(1);
});

it('reports a PNG encoder failure without leaving a pending export', async () => {
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(null));
  await expect(captureMap(mapScene, mapView, options)).rejects.toBeInstanceOf(MapCaptureError);
});

it('propagates decoding failures with context and cleans up their URL', async () => {
  const cause = new DOMException('Failed to decode', 'EncodingError');
  vi.spyOn(HTMLImageElement.prototype, 'decode').mockRejectedValue(cause);
  const revoke = vi.spyOn(URL, 'revokeObjectURL');
  await expect(captureMap(mapScene, mapView, options)).rejects.toMatchObject({
    reason: 'decode',
    cause,
  });
  expect(revoke).toHaveBeenCalledTimes(1);
});

it('does not silently replace an unknown decoder failure', async () => {
  const failure = Symbol('decoder failure');
  vi.spyOn(HTMLImageElement.prototype, 'decode').mockRejectedValue(failure);
  await expect(captureMap(mapScene, mapView, options)).rejects.toBe(failure);
});

it('rejects capture after disposal while repeated disposal and stale updates remain harmless', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const callbacks = { onSelect: vi.fn(), onViewChange: vi.fn(), onError: vi.fn() };
  const map = mountMap(host, mapScene, mapView, callbacks);
  map.dispose();
  map.dispose();
  map.update({ ...mapView, lighting: 'night' });
  map.focus({ kind: 'world' });
  await expect(map.capture(options)).rejects.toMatchObject({ reason: 'disposed' });
  expect(host.childElementCount).toBe(0);
  expect(callbacks.onViewChange).not.toHaveBeenCalled();
});
