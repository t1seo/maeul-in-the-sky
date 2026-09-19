import { Box3, Vector3 } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Vec3, WorldView } from '../model/types.js';
import { fitCameraToBounds, worldCameraFrame } from './camera-fit.js';

export function createCameraRig(
  canvas: HTMLCanvasElement,
  bounds: Box3,
  initial: WorldView['camera'],
  initialAspect: number,
) {
  const camera = worldCameraFrame(bounds, initialAspect);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.autoRotate = false;
  controls.minZoom = 0.35;
  controls.maxZoom = 18;
  controls.minPolarAngle = 0.15;
  controls.maxPolarAngle = Math.PI / 2 - 0.06;
  controls.screenSpacePanning = true;
  controls.zoomToCursor = true;
  controls.cursor.copy(bounds.getCenter(new Vector3()));
  controls.maxTargetRadius = bounds.getSize(new Vector3()).length() * 1.5;
  controls.listenToKeyEvents(canvas);
  let aspect = initialAspect;
  let halfHeight = camera.top;

  function apply(next: WorldView['camera']) {
    camera.position.set(next.position.x, next.position.y, next.position.z);
    controls.target.set(next.target.x, next.target.y, next.target.z);
    const offset = camera.position.clone().sub(controls.target);
    const safeDistance = Math.max(8, bounds.getSize(new Vector3()).length() * 1.6);
    if (offset.length() < safeDistance) {
      if (offset.lengthSq() === 0) offset.set(1, 1, 1);
      camera.position.copy(controls.target).add(offset.normalize().multiplyScalar(safeDistance));
    }
    camera.zoom = Math.max(controls.minZoom, Math.min(controls.maxZoom, next.zoom));
    camera.lookAt(controls.target);
    camera.updateProjectionMatrix();
    controls.update();
  }

  function read(): WorldView['camera'] {
    return {
      position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
      target: { x: controls.target.x, y: controls.target.y, z: controls.target.z },
      zoom: camera.zoom,
    };
  }

  function focus(next: Box3) {
    const target = next.getCenter(new Vector3());
    const offset = camera.position.clone().sub(controls.target);
    camera.position.copy(target).add(offset);
    controls.target.copy(target);
    const fitting = camera.clone();
    fitCameraToBounds(fitting, next, aspect);
    camera.zoom = Math.max(controls.minZoom, Math.min(controls.maxZoom, halfHeight / fitting.top));
    camera.updateProjectionMatrix();
    controls.update();
  }

  function resize(nextAspect: number) {
    aspect = nextAspect;
    halfHeight = worldCameraFrame(bounds, aspect).top;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.updateProjectionMatrix();
  }

  function follow(position: Vec3) {
    const delta = new Vector3(position.x, position.y + 0.5, position.z).sub(controls.target);
    camera.position.add(delta);
    controls.target.add(delta);
    camera.lookAt(controls.target);
  }

  function isNavigationKey(event: KeyboardEvent): boolean {
    const rotates = event.ctrlKey || event.metaKey || event.shiftKey;
    return (
      controls.enabled &&
      Object.values(controls.keys).includes(event.code) &&
      (rotates ? controls.enableRotate : controls.enablePan)
    );
  }

  apply(initial);
  return {
    camera,
    controls,
    apply,
    read,
    focus,
    resize,
    follow,
    isNavigationKey,
    dispose: () => controls.dispose(),
  };
}
