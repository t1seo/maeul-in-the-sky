import type { BrowserContext } from '@playwright/test';

export function browserEnvironment(input: NodeJS.ProcessEnv): Record<string, string> {
  const output: Record<string, string> = { TZ: 'UTC', LANG: 'en_US.UTF-8' };
  for (const key of ['PATH', 'HOME', 'TMPDIR', 'TMP', 'TEMP', 'SystemRoot', 'WINDIR']) {
    const value = input[key];
    if (value) output[key] = value;
  }
  return output;
}

export function isCaptureRequestAllowed(url: string, method: string, origin: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      method === 'GET' &&
      parsed.origin === origin &&
      parsed.protocol === 'http:' &&
      parsed.username === '' &&
      parsed.password === '' &&
      !parsed.pathname.startsWith('/api/')
    );
  } catch {
    return false;
  }
}

export async function restrictCaptureNetwork(context: BrowserContext, origin: string) {
  const rejected: string[] = [];
  await context.route('**/*', async (route) => {
    const request = route.request();
    if (isCaptureRequestAllowed(request.url(), request.method(), origin)) await route.continue();
    else {
      rejected.push('A browser request outside the local static assets was blocked.');
      await route.abort('blockedbyclient');
    }
  });
  await context.routeWebSocket('**/*', (socket) => {
    rejected.push('A browser WebSocket request was blocked.');
    socket.close();
  });
  return {
    assertOffline(): void {
      if (rejected.length) throw new Error(rejected.join(' '));
    },
  };
}
