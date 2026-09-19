import { describe, expect, it } from 'vitest';
import { browserEnvironment, isCaptureRequestAllowed } from '../../scripts/profile/security.js';

describe('profile capture isolation', () => {
  it('passes only browser operating-system settings, never inherited credentials or proxies', () => {
    expect(
      browserEnvironment({
        PATH: '/bin',
        HOME: '/home/runner',
        GITHUB_TOKEN: 'secret',
        GH_TOKEN: 'secret',
        INPUT_GITHUB_TOKEN: 'secret',
        AWS_SECRET_ACCESS_KEY: 'secret',
        HTTPS_PROXY: 'http://proxy.invalid',
        NODE_OPTIONS: '--inspect',
        LD_PRELOAD: '/tmp/injection',
      }),
    ).toEqual({ PATH: '/bin', HOME: '/home/runner', TZ: 'UTC', LANG: 'en_US.UTF-8' });
  });

  it('permits only read-only shipped assets on the exact owned loopback origin', () => {
    const origin = 'http://127.0.0.1:4318';
    expect(isCaptureRequestAllowed(`${origin}/world/app.js`, 'GET', origin)).toBe(true);
    for (const [url, method] of [
      ['https://raw.githubusercontent.com/user/repo/main/world.json', 'GET'],
      ['http://127.0.0.1:4319/world/', 'GET'],
      [`${origin}/api/health`, 'GET'],
      [`${origin}/api/preview`, 'POST'],
      [`${origin}/world/`, 'POST'],
      ['file:///etc/passwd', 'GET'],
      ['invalid', 'GET'],
    ])
      expect(isCaptureRequestAllowed(url, method, origin)).toBe(false);
  });
});
