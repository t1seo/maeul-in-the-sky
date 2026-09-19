import { Box3, BoxGeometry, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { expect, test } from 'vitest';
import { visibleGeometryBounds } from '../../../src/world/three/camera-fit.js';
import { createWorldGeometry } from '../../../src/world/three/geometry/index.js';
import { buildWorld, defaultWorldView, frameWorld } from '../../../src/world/model/index.js';
import { TINY_WORLD_INPUT } from '../../../src/world/model/fixture.js';

test('an unselected seasonal world is framed by its islands instead of the hidden origin ring', () => {
  const scene = buildWorld({
    ...TINY_WORLD_INPUT,
    settings: { ...TINY_WORLD_INPUT.settings, layout: 'seasonal' },
  });
  const view = defaultWorldView(scene);
  const geometry = createWorldGeometry(scene);
  try {
    geometry.update(frameWorld(scene, view), view);
    const bounds = visibleGeometryBounds(geometry.content);
    expect(scene.bounds.min.x).toBeGreaterThan(200);
    expect(bounds.min.x).toBeGreaterThan(200);
    expect(bounds.getSize(new Vector3()).x).toBeLessThan(30);
  } finally {
    geometry.dispose();
  }
});

test('camera framing ignores hidden subtrees and transient decorations but includes visible height', () => {
  const geometry = new BoxGeometry(2, 4, 2);
  const material = new MeshBasicMaterial();
  const content = new Group();
  const visible = new Mesh(geometry, material);
  visible.position.set(300, 12, 0);
  const hidden = new Group();
  hidden.visible = false;
  hidden.add(new Mesh(geometry, material));
  const decoration = new Mesh(geometry, material);
  decoration.userData = { exportExclude: true };
  content.add(visible, hidden, decoration);
  try {
    expect(visibleGeometryBounds(content)).toEqual(
      new Box3(new Vector3(299, 10, -1), new Vector3(301, 14, 1)),
    );
  } finally {
    geometry.dispose();
    material.dispose();
  }
});
