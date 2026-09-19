import { Group, Mesh, MeshStandardMaterial } from 'three';
import type { ModelRecipe } from '../../../../src/world/model/geometry-types.js';
import { createPrimitiveGeometry } from '../../../../src/world/three/geometry/primitives.js';

export function createRecipeObject(recipe: ModelRecipe): {
  readonly group: Group;
  readonly dispose: () => void;
} {
  const group = new Group();
  const meshes = recipe.parts.map((part) => {
    const mesh = new Mesh(
      createPrimitiveGeometry(part.primitive, recipe.key),
      new MeshStandardMaterial({ color: part.color, roughness: part.roughness }),
    );
    mesh.position.set(part.position.x, part.position.y, part.position.z);
    mesh.rotation.set(part.rotation.x, part.rotation.y, part.rotation.z);
    mesh.scale.set(part.size.x, part.size.y, part.size.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  });
  return {
    group,
    dispose: () => {
      for (const mesh of meshes) {
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
      group.clear();
    },
  };
}
