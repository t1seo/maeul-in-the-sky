import { Vector3, type PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { TourModel } from '../types.js';
import type { GroundPoint, TourGround } from './ground.js';
import { bindTourInput } from './input.js';

export type TourMode = 'orbit' | 'walk';

export function createDirector(
  camera: PerspectiveCamera,
  canvas: HTMLCanvasElement,
  model: TourModel,
  ground: TourGround,
  changed: () => void,
  initiallyReduced: boolean,
) {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = !initiallyReduced;
  controls.dampingFactor = 0.08;
  controls.minDistance = 3;
  controls.maxDistance = 360;
  controls.maxPolarAngle = Math.PI * 0.485;
  controls.target.set(0, 0, 0);
  let mode: TourMode = 'orbit';
  let reduced = initiallyReduced;
  let index = Math.max(
    0,
    model.stops.findIndex((stop) => stop.id === 'summer'),
  );
  const homeIndex = index;
  const facing = new Vector3();
  const heading = (): number => {
    camera.getWorldDirection(facing);
    return Math.atan2(-facing.x, -facing.z);
  };
  let touring = false;
  let held = 0;
  let yaw = 0;
  let pitch = 0;
  let flight: {
    readonly from: Vector3;
    readonly to: Vector3;
    readonly aimFrom: Vector3;
    readonly aimTo: Vector3;
    progress: number;
  } | null = null;
  const stop = (): void => {
    touring = false;
    flight = null;
    input.clear();
    if (mode === 'walk') {
      mode = 'orbit';
      controls.target
        .copy(camera.position)
        .add(camera.getWorldDirection(new Vector3()).multiplyScalar(6));
      controls.target.y = 0;
      controls.enabled = true;
      camera.position.y = Math.max(camera.position.y, 2.5);
    }
    changed();
  };
  const gesture = (): void => {
    touring = false;
    flight = null;
    changed();
  };
  const input = bindTourInput(canvas, {
    walking: () => mode === 'walk',
    stop,
    gesture,
    look: (dx, dy) => {
      yaw -= dx * 0.004;
      pitch = Math.max(-1.1, Math.min(1.1, pitch - dy * 0.004));
    },
  });
  const transition = (position: Vector3, target: Vector3, instant = false): void => {
    mode = 'orbit';
    controls.enabled = true;
    input.clear();
    if (reduced || instant) {
      flight = null;
      camera.position.copy(position);
      controls.target.copy(target);
      controls.update();
    } else {
      flight = {
        from: camera.position.clone(),
        to: position,
        aimFrom: controls.target.clone(),
        aimTo: target,
        progress: 0,
      };
    }
    changed();
  };
  const go = (next: number, instant = false): void => {
    const destination = model.stops[next];
    if (!destination) return;
    index = next;
    held = 0;
    const { x, z } = destination.position;
    transition(new Vector3(x + 12, 12, z + 21), new Vector3(x, 0.8, z), instant);
  };
  go(index, true);
  return {
    update: (seconds: number): void => {
      const dt = Math.min(seconds, 0.05);
      if (mode === 'walk') {
        const direction = input.movement();
        yaw -= Math.max(-1, Math.min(1, direction.turn)) * dt * 1.8;
        const length = Math.max(1, Math.hypot(direction.forward, direction.right));
        const speed = (dt * 3.2) / length;
        const next = ground.move(camera.position, {
          x: (-Math.sin(yaw) * direction.forward + Math.cos(yaw) * direction.right) * speed,
          z: (-Math.cos(yaw) * direction.forward - Math.sin(yaw) * direction.right) * speed,
        });
        camera.position.set(next.x, 1.55, next.z);
        camera.rotation.set(pitch, yaw, 0, 'YXZ');
        return;
      }
      if (flight) {
        flight.progress = Math.min(1, flight.progress + dt / 2.4);
        const t = flight.progress * flight.progress * (3 - 2 * flight.progress);
        camera.position.lerpVectors(flight.from, flight.to, t);
        camera.position.y += Math.sin(t * Math.PI) * 5;
        controls.target.lerpVectors(flight.aimFrom, flight.aimTo, t);
        if (flight.progress === 1) flight = null;
      } else if (touring && !reduced) {
        held += dt;
        const offset = camera.position.clone().sub(controls.target);
        offset.applyAxisAngle(new Vector3(0, 1, 0), dt * 0.045);
        camera.position.copy(controls.target).add(offset);
        if (held > 8) go((index + 1) % model.stops.length);
      }
      controls.update();
    },
    goToStop: (next: number): void => {
      touring = false;
      go(next);
    },
    startTour: (): void => {
      stop();
      touring = true;
      go(index);
      changed();
    },
    stop,
    home: (): void => {
      stop();
      go(homeIndex);
    },
    overview: (): void => {
      stop();
      const center = (model.bounds.minX + model.bounds.maxX) / 2;
      const span = model.bounds.maxX - model.bounds.minX;
      const distance = Math.max(
        40,
        span / (2 * Math.tan((camera.fov * Math.PI) / 360) * Math.min(camera.aspect, 1.8)),
      );
      const position = new Vector3(center + span * 0.1, distance * 0.82, 12 + distance * 0.84);
      const target = new Vector3(center, -1, 12);
      controls.maxDistance = Math.max(360, position.distanceTo(target) * 1.2);
      camera.far = Math.max(1400, controls.maxDistance * 2);
      camera.updateProjectionMatrix();
      transition(position, target);
    },
    walk: (): boolean => {
      const standing = ground.nearest({ x: controls.target.x + 1, z: controls.target.z + 3 });
      if (!standing) return false;
      stop();
      mode = 'walk';
      controls.enabled = false;
      yaw = Math.atan2(standing.x - controls.target.x, standing.z - controls.target.z);
      pitch = 0;
      camera.position.set(standing.x, 1.55, standing.z);
      camera.rotation.set(pitch, yaw, 0, 'YXZ');
      changed();
      return true;
    },
    move: input.touch,
    turn: input.turn,
    teleport: (point: GroundPoint): boolean => {
      const standing = ground.landing(point);
      if (!standing) return false;
      const direction = heading();
      const tilt = mode === 'walk' ? pitch : 0;
      stop();
      mode = 'walk';
      controls.enabled = false;
      yaw = direction;
      pitch = tilt;
      camera.position.set(standing.x, 1.55, standing.z);
      camera.rotation.set(pitch, yaw, 0, 'YXZ');
      let nearest = Infinity;
      for (const [next, stop] of model.stops.entries()) {
        const distance = Math.hypot(stop.position.x - standing.x, stop.position.z - standing.z);
        if (distance >= nearest) continue;
        nearest = distance;
        index = next;
      }
      changed();
      return true;
    },
    setReduced: (value: boolean): void => {
      reduced = value;
      controls.enableDamping = !value;
      if (value) {
        stop();
      }
    },
    inspect: () => ({ mode, stopIndex: index, touring, heading: heading() }),
    dispose: (): void => {
      input.dispose();
      controls.dispose();
    },
  };
}

export type TourDirector = ReturnType<typeof createDirector>;
