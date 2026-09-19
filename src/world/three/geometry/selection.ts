import { Mesh, MeshStandardMaterial, TorusGeometry } from 'three';
import type { Group } from 'three';
import type { WorldFrame, WorldView } from '../../model/types.js';
import type { GeometryResources } from './resources.js';

export function createSelection(
  content: Group,
  resources: GeometryResources,
): (frame: WorldFrame, view: WorldView) => void {
  const mesh = new Mesh(
    resources.geometry(new TorusGeometry(0.46, 0.028, 4, 32)),
    resources.material(
      new MeshStandardMaterial({
        color: '#fff2ac',
        emissive: '#d6ab58',
        emissiveIntensity: 0.45,
        roughness: 0.65,
      }),
    ),
  );
  mesh.name = 'selection';
  mesh.userData = { exportExclude: true };
  mesh.rotation.x = -Math.PI / 2;
  mesh.visible = false;
  content.add(mesh);
  return (frame, view) => {
    const day = frame.days.find(
      (entry) => entry.id === view.selectedId || entry.tileId === view.selectedId,
    );
    const tile = day ? frame.terrain.tiles.find((entry) => entry.id === day.tileId) : undefined;
    const entity = frame.entities.find((entry) => entry.id === view.selectedId);
    const actor = frame.actors.find((entry) => entry.id === view.selectedId);
    const position = tile?.position ?? entity?.position ?? actor?.position;
    mesh.visible = position !== undefined;
    if (position) {
      mesh.position.set(position.x, position.y + (tile?.activityHeight ?? 0) + 0.065, position.z);
      const size = tile?.size ?? 1;
      mesh.scale.setScalar(size);
    }
  };
}
