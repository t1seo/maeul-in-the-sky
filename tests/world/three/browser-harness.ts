import { afterEach, expect, vi, type TestContext } from 'vitest';
import type {
  WorldRenderer,
  WorldRendererCallbacks,
} from '../../../src/world/model/renderer-types.js';
import type { WorldScene, WorldView } from '../../../src/world/model/types.js';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { defaultWorldView } from '../../../src/world/model/index.js';
import { mountThree } from '../../../src/world/three/index.js';

const hosts: HTMLElement[] = [];
const mounted: WorldRenderer[] = [];
afterEach(() => {
  for (const renderer of mounted.splice(0)) renderer.dispose();
  for (const host of hosts.splice(0)) host.remove();
  vi.restoreAllMocks();
});

export async function openThree(
  view: Partial<WorldView> = {},
  callbacks: Partial<WorldRendererCallbacks> = {},
  world: WorldScene = TINY_WORLD_SCENE,
) {
  const host = document.createElement('div');
  host.style.cssText = 'width:800px;height:500px';
  document.body.append(host);
  hosts.push(host);
  const port = await mountThree(
    host,
    world,
    { ...defaultWorldView(world), motion: 'off', ...view },
    {
      onSelect() {},
      onViewChange() {},
      onError(error) {
        throw error;
      },
      ...callbacks,
    },
  );
  mounted.push(port);
  const canvas = host.querySelector('canvas');
  if (!canvas) throw new TypeError('Expected a mounted Three canvas');
  return { host, port, canvas };
}

export async function browserFrames(count = 3) {
  for (let index = 0; index < count; index++)
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

export async function expectSamePng(before: Blob, after: Blob, context: TestContext) {
  const bytes = await Promise.all([before.arrayBuffer(), after.arrayBuffer()]);
  const hashes = await Promise.all(
    bytes.map(async (data) =>
      Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', data)), (value) =>
        value.toString(16).padStart(2, '0'),
      ).join(''),
    ),
  );
  if (hashes[0] !== hashes[1])
    for (const [index, body] of bytes.entries())
      await context.annotate(`PNG ${index === 0 ? 'before' : 'after'}`, {
        body: new Uint8Array(body),
        contentType: 'image/png',
      });
  expect(hashes[1]).toBe(hashes[0]);
}

export const ACTOR_SCENE: WorldScene = {
  ...TINY_WORLD_SCENE,
  routes: [
    {
      id: 'walk',
      kind: 'walk',
      nodeIds: [],
      points: [
        { x: 0, y: 0.5, z: 0 },
        { x: 1, y: 0.5, z: 0 },
      ],
      length: 1,
      visibleFrom: '2024-02-28',
      loop: false,
    },
  ],
  actors: [
    {
      id: 'walker',
      kind: 'resident',
      modelKey: 'tree',
      routeId: 'walk',
      speed: 0.5,
      phase: 0,
      visibleFrom: '2024-02-28',
    },
  ],
};
