import { afterEach, expect, test, vi } from 'vitest';
import { fetchPreview, localCapability } from '../../../src/demo/local-client.js';
import { settingsFixture } from '../fixtures.js';
import { historySnapshot } from './harness.js';

afterEach(() => vi.restoreAllMocks());
const local = new URL('http://127.0.0.1:4317/');

test.each([
  ['https://example.com/demo', false],
  ['https://localhost/demo', false],
])('keeps remote pages offline at %s', async (url) => {
  const fetch = vi.spyOn(window, 'fetch');
  expect(await localCapability(new URL(url))).toMatchObject({
    available: false,
    message: expect.stringContaining('never contacts localhost'),
  });
  await expect(fetchPreview(settingsFixture(), new URL(url))).rejects.toMatchObject({
    code: 'local_only',
  });
  expect(fetch).not.toHaveBeenCalled();
});

test.each([
  [Response.json({}, { status: 404 }), 'not a running Maeul'],
  [Response.json({ status: 'other' }), 'did not identify'],
  [Response.json({ status: 'ok', capabilities: { github: false } }), 'GITHUB_TOKEN'],
  [Response.json({ status: 'ok', capabilities: { github: true } }), 'token stays on the server'],
])(
  'identifies the local service and capability from its health response %#',
  async (response, message) => {
    const fetch = vi.spyOn(window, 'fetch').mockResolvedValue(response);
    const result = await localCapability(local);
    expect(result.message).toContain(message);
    expect(result.available).toBe(message === 'token stays on the server');
    expect(String(fetch.mock.lastCall?.[0])).toBe('http://127.0.0.1:4317/api/health');
  },
);

test('offers imports when local health checks cannot connect', async () => {
  vi.spyOn(window, 'fetch').mockRejectedValue(new TypeError('Connection refused'));
  const result = await localCapability(local);
  expect(result).toEqual({
    available: false,
    message: 'Local preview is unavailable: TypeError. You can still import a snapshot.',
  });
});

test('reports the HTTP status when an upstream failure has no structured error', async () => {
  vi.spyOn(window, 'fetch').mockResolvedValue(Response.json({ proxy: 'down' }, { status: 502 }));
  await expect(fetchPreview(settingsFixture(), local)).rejects.toMatchObject({
    code: 'invalid_response',
    message: 'The local service returned HTTP 502.',
  });
});

test('omits an unspecified year and validates returned contribution history', async () => {
  const settings = settingsFixture();
  const { year: _year, ...rolling } = settings;
  const snapshot = historySnapshot();
  const fetch = vi.spyOn(window, 'fetch').mockResolvedValue(Response.json({ snapshot }));
  expect(await fetchPreview(rolling, local)).toEqual(snapshot);
  expect(JSON.parse(String(fetch.mock.lastCall?.[1]?.body))).not.toHaveProperty('year');
  fetch.mockResolvedValue(Response.json({ snapshot: { kind: 'maeul-snapshot' } }));
  await expect(fetchPreview(settings, local)).rejects.toThrow();
});
