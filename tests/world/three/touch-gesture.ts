import type { Page } from '@playwright/test';

export async function touchOrbitAndPinch(
  page: Page,
  box: { x: number; y: number; width: number; height: number },
) {
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 });
  function point(id: number, x: number, y: number) {
    return { id, x: box.x + box.width * x, y: box.y + box.height * y };
  }
  try {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [point(1, 0.5, 0.5)],
    });
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [point(1, 0.7, 0.58)],
    });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [point(1, 0.42, 0.5), point(2, 0.58, 0.5)],
    });
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [point(1, 0.35, 0.5), point(2, 0.65, 0.5)],
    });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } finally {
    await session.detach();
  }
}
