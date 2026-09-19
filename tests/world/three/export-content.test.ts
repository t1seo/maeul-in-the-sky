import { describe, expect, it } from 'vitest';
import {
  BoxGeometry,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  Texture,
} from 'three';
import { flattenVisibleContent } from '../../../src/world/three/export-content.js';

describe('portable 3D export geometry', () => {
  it('expands every visible instance with its world transform and color', () => {
    const content = new Group();
    content.position.set(10, 2, 4);
    const material = new MeshStandardMaterial({ color: '#ffffff' });
    const batch = new InstancedMesh(new BoxGeometry(), material, 3);
    batch.count = 2;
    batch.setMatrixAt(0, new Matrix4().makeTranslation(1, 0, 0));
    batch.setMatrixAt(1, new Matrix4().makeTranslation(3, 0, 0));
    batch.setColorAt(0, new Color('#f08040'));
    batch.setColorAt(1, new Color('#5fa080'));
    batch.userData.instanceIds = ['first-tree', 'second-tree'];
    content.add(batch);

    const exported = flattenVisibleContent(content);

    expect(exported.children).toHaveLength(2);
    const positions = exported.children.map((mesh) =>
      new Vector3().setFromMatrixPosition(mesh.matrix).toArray(),
    );
    expect(positions).toEqual([
      [11, 2, 4],
      [13, 2, 4],
    ]);
    expect(exported.children.map((mesh) => mesh.name)).toEqual(['first-tree', 'second-tree']);
    const first = exported.children[0];
    expect(first).toBeInstanceOf(Mesh);
    if (!(first instanceof Mesh) || !(first.material instanceof MeshStandardMaterial))
      throw new TypeError('Expected export mesh');
    expect(first.material.color.getHexString()).toBe('f08040');
    expect(first.geometry).not.toBe(batch.geometry);
    expect(material.color.getHexString()).toBe('ffffff');
  });

  it('excludes hidden replay entities and preserves ordinary mesh depth', () => {
    const content = new Group();
    const visible = new Mesh(new BoxGeometry(2, 4, 6), new MeshStandardMaterial());
    const future = new Group();
    future.visible = false;
    future.add(new Mesh(new BoxGeometry(), new MeshStandardMaterial()));
    content.add(visible, future);

    const exported = flattenVisibleContent(content);

    expect(exported.children).toHaveLength(1);
    const mesh = exported.children[0];
    if (!(mesh instanceof Mesh)) throw new TypeError('Expected visible mesh');
    mesh.geometry.computeBoundingBox();
    expect(mesh.geometry.boundingBox?.getSize(new Vector3()).toArray()).toEqual([2, 4, 6]);
  });

  it('omits selection and helper subtrees explicitly excluded from model exports', () => {
    const content = new Group();
    const helper = new Group();
    helper.userData.exportExclude = true;
    helper.add(new Mesh(new BoxGeometry(), new MeshStandardMaterial()));
    const selection = new Mesh(new BoxGeometry(), new MeshStandardMaterial());
    selection.userData.exportExclude = true;
    content.add(helper, selection, new Mesh(new BoxGeometry(), new MeshStandardMaterial()));

    expect(flattenVisibleContent(content).children).toHaveLength(1);
  });

  it('retains multi-material meshes and names anonymous instances without colors', () => {
    const material = new MeshStandardMaterial({ color: '#507050' });
    const content = new Group();
    const source = new BoxGeometry();
    const batch = new InstancedMesh(source, [material, material], 1);
    batch.setMatrixAt(0, new Matrix4());
    content.add(batch, new Mesh(source, material));
    const cloned = flattenVisibleContent(content);
    const mesh = cloned.children[0];
    expect(mesh?.name).toBe('part-0');
    if (!(mesh instanceof Mesh) || !Array.isArray(mesh.material))
      throw new TypeError('Expected material array');
    expect(mesh.material).toHaveLength(2);
    expect(mesh.material[0]).toBe(mesh.material[1]);
    expect(mesh.material[0]).not.toBe(material);
  });

  it('freezes animated material texture transforms for asynchronous export', () => {
    const texture = new Texture();
    texture.offset.set(0.2, 0.4);
    const content = new Group().add(
      new Mesh(new BoxGeometry(), new MeshStandardMaterial({ map: texture })),
    );
    const exported = flattenVisibleContent(content);
    const mesh = exported.children[0];
    if (!(mesh instanceof Mesh) || !(mesh.material instanceof MeshStandardMaterial))
      throw new TypeError('Expected exported material');
    texture.offset.x = 0.8;
    expect(mesh.material.map).not.toBe(texture);
    expect(mesh.material.map?.offset.x).toBe(0.2);
  });
});
