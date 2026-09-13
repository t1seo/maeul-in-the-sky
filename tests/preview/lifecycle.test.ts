import { describe, expect, it } from 'vitest';
import { createPreviewServer, startPreviewServer } from '../../src/preview/server.js';

describe('C09-cache-timeout server lifecycle', () => {
  it('leaves no listener when shutdown races with startup', async () => {
    // Given a server whose asynchronous bind has just started.
    const handle = createPreviewServer({ port: 0, token: '' });
    const starting = handle.listen();
    // When shutdown starts before the listening callback.
    const stopping = handle.close();
    try {
      await starting;
      await stopping;
      // Then no late listener survives shutdown.
      expect(handle.server.listening).toBe(false);
    } finally {
      await new Promise<void>((resolve) => {
        handle.server.close(() => resolve());
        handle.server.closeAllConnections();
      });
    }
  });
  it('closes safely when never started', async () => {
    // Given a configured server without a listener.
    const handle = createPreviewServer({ port: 0, token: '' });
    // When close is called twice.
    await handle.close();
    await handle.close();
    // Then subsequent starts are rejected without a resource leak.
    await expect(handle.listen()).rejects.toMatchObject({ code: 'shutdown' });
  });
  it('preserves bind failure when a port is already occupied', async () => {
    // Given an active loopback listener.
    const first = await startPreviewServer({ port: 0, token: '' });
    try {
      // When a second server requests the occupied address.
      const pending = startPreviewServer({ port: first.port, token: '' });
      // Then the OS bind error reaches the caller.
      await expect(pending).rejects.toMatchObject({ code: 'EADDRINUSE' });
    } finally {
      await first.close();
    }
  });
});
