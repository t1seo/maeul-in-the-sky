import { expect, it } from 'vitest';
import { createLatestRequestGate } from '../../../src/world/data/requests.js';

it('discards a late response when a newer world has already loaded', async () => {
  const gate = createLatestRequestGate();
  let resolveOld: (value: string) => void = () => undefined;
  const pending = new Promise<string>((resolve) => {
    resolveOld = resolve;
  });
  const old = gate.run(() => pending);
  const rejected = expect(old).rejects.toMatchObject({ code: 'stale' });

  expect(await gate.run(async () => 'new-world')).toBe('new-world');
  resolveOld('old-world');

  await rejected;
});

it('cancels an operation even when its producer ignores the signal', async () => {
  const gate = createLatestRequestGate();
  const pending = gate.run(async () => 'unwanted-world');
  gate.cancel();
  await expect(pending).rejects.toMatchObject({ code: 'cancelled' });
});
