import { Box3, OrthographicCamera, Vector3 } from 'three';

export function worldCameraFrame(bounds: Box3, aspect: number): OrthographicCamera {
  const camera = new OrthographicCamera();
  camera.position.set(0.8, 1, 1);
  camera.lookAt(0, 0, 0);
  fitCameraToBounds(camera, bounds, aspect);
  return camera;
}

export function fitCameraToBounds(
  camera: OrthographicCamera,
  bounds: Box3,
  aspect: number,
): Vector3 {
  const center = bounds.getCenter(new Vector3());
  const distance = Math.max(8, bounds.getSize(new Vector3()).length() * 1.6);
  const direction = camera.getWorldDirection(new Vector3()).negate();
  camera.position.copy(center).addScaledVector(direction, distance);
  camera.lookAt(center);
  camera.near = 0.05;
  camera.far = distance * 6;
  camera.zoom = 1;
  camera.updateMatrixWorld(true);
  let halfHeight = 1;
  for (const x of [bounds.min.x, bounds.max.x])
    for (const y of [bounds.min.y, bounds.max.y])
      for (const z of [bounds.min.z, bounds.max.z]) {
        const point = new Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse);
        halfHeight = Math.max(halfHeight, Math.abs(point.y), Math.abs(point.x) / aspect);
      }
  camera.top = halfHeight * 1.18;
  camera.bottom = -camera.top;
  camera.right = camera.top * aspect;
  camera.left = -camera.right;
  camera.updateProjectionMatrix();
  return center;
}
