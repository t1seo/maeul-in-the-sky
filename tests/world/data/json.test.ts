import { expect, it } from 'vitest';
import { readBoundedText, readWorldJson } from '../../../src/world/data/json.js';

it('counts encoded bytes instead of characters at the JSON boundary', () => {
  const text = JSON.stringify({ title: '한글' });
  expect(() => readWorldJson(text, text.length)).toThrowError(/limit/);
  expect(readWorldJson(text, new TextEncoder().encode(text).length)).toEqual({ title: '한글' });
});

it('rejects malformed and circular JSON with friendly typed errors', () => {
  expect(() => readWorldJson('{')).toThrowError(/JSON/);
  const circular: { child?: unknown } = {};
  circular.child = circular;
  expect(() => readWorldJson(circular)).toThrowError(/JSON/);
});

it('enforces streamed body limits when content length is absent', async () => {
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(11));
    },
    cancel() {
      cancelled = true;
    },
  });
  await expect(readBoundedText(stream, 10)).rejects.toMatchObject({ code: 'too_large' });
  expect(cancelled).toBe(true);
});

it('cancels a stalled response stream without waiting for another chunk', async () => {
  const stream = new ReadableStream<Uint8Array>();
  const controller = new AbortController();
  const text = readBoundedText(stream, 100, controller.signal);
  controller.abort();
  await expect(text).rejects.toMatchObject({ code: 'cancelled' });
});

it('decodes a multibyte character split across response chunks', async () => {
  const bytes = new TextEncoder().encode('한');
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes.subarray(0, 1));
      controller.enqueue(bytes.subarray(1));
      controller.close();
    },
  });
  expect(await readBoundedText(stream, 3)).toBe('한');
});
