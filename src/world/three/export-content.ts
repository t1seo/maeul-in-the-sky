import {
  Color,
  Group,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  Texture,
  type BufferGeometry,
} from 'three';

export function flattenVisibleContent(content: Group): Group {
  const root = new Group();
  root.name = 'Maeul world';
  const geometries = new Map<BufferGeometry, BufferGeometry>();
  const materials = new Map<string, Material>();
  const textures = new Map<Texture, Texture>();
  const color = new Color();
  const local = new Matrix4();
  content.updateMatrixWorld(true);

  function cloneMaterial(original: Material, tint: Color) {
    const key = `${original.uuid}:${tint.r}:${tint.g}:${tint.b}`;
    const existing = materials.get(key);
    if (existing) return existing;
    const cloned = original.clone();
    for (const key of Object.keys(cloned)) {
      const value: unknown = Reflect.get(cloned, key);
      if (!(value instanceof Texture)) continue;
      const texture = textures.get(value) ?? value.clone();
      textures.set(value, texture);
      Reflect.set(cloned, key, texture);
    }
    if ('color' in cloned && cloned.color instanceof Color) cloned.color.multiply(tint);
    materials.set(key, cloned);
    return cloned;
  }

  function addMesh(source: Mesh, matrix: Matrix4, tint: Color, name: string) {
    let geometry = geometries.get(source.geometry);
    if (!geometry) {
      geometry = source.geometry.clone();
      geometries.set(source.geometry, geometry);
    }
    const material = Array.isArray(source.material)
      ? source.material.map((item) => cloneMaterial(item, tint))
      : cloneMaterial(source.material, tint);
    const mesh = new Mesh(geometry, material);
    mesh.name = name;
    mesh.matrixAutoUpdate = false;
    mesh.matrix.copy(matrix);
    mesh.userData = { ...source.userData, instanceIds: undefined };
    root.add(mesh);
  }

  content.traverseVisible((object) => {
    for (let ancestor = object; ;) {
      if (ancestor.userData.exportExclude === true) return;
      if (!ancestor.parent || ancestor === content) break;
      ancestor = ancestor.parent;
    }
    if (object instanceof InstancedMesh) {
      const ids: unknown = object.userData.instanceIds;
      for (let index = 0; index < object.count; index++) {
        object.getMatrixAt(index, local);
        color.setRGB(1, 1, 1);
        if (object.instanceColor) object.getColorAt(index, color);
        const id: unknown = Array.isArray(ids) ? ids[index] : undefined;
        addMesh(
          object,
          new Matrix4().multiplyMatrices(object.matrixWorld, local),
          color,
          typeof id === 'string' ? id : `${object.name || 'part'}-${index}`,
        );
      }
    } else if (object instanceof Mesh) {
      addMesh(object, object.matrixWorld, color.setRGB(1, 1, 1), object.name);
    }
  });
  root.updateMatrixWorld(true);
  return root;
}
