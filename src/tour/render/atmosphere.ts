import {
  BackSide,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  type Scene,
} from 'three';
import { seededRandom } from '../../utils/math.js';
import { transform } from '../../world/three/geometry/placements.js';
import type { GeometryResources } from '../../world/three/geometry/resources.js';
import type { TourModel } from '../types.js';

export type TourLighting = 'day' | 'golden' | 'night';
const THEMES = {
  day: {
    zenith: '#90bdcb',
    horizon: '#e9eedb',
    sky: '#d9eee6',
    ground: '#7c8462',
    sun: '#fff6d2',
    intensity: 3,
    ambient: 2.5,
    cloud: '#f3f2de',
  },
  golden: {
    zenith: '#87aebb',
    horizon: '#e4dec9',
    sky: '#e0e6d9',
    ground: '#85745d',
    sun: '#ffdeb0',
    intensity: 3.2,
    ambient: 2.3,
    cloud: '#f3e6cf',
  },
  night: {
    zenith: '#0e2035',
    horizon: '#3d6070',
    sky: '#88aabc',
    ground: '#354a60',
    sun: '#a6c3df',
    intensity: 1.3,
    ambient: 1.35,
    cloud: '#456277',
  },
} as const;

export function createAtmosphere(scene: Scene, model: TourModel, resources: GeometryResources) {
  const uniforms = { zenith: { value: new Color() }, horizon: { value: new Color() } };
  const skyMaterial = resources.material(
    new ShaderMaterial({
      side: BackSide,
      depthWrite: false,
      uniforms,
      vertexShader:
        'varying vec3 direction; void main(){direction=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: `uniform vec3 zenith; uniform vec3 horizon; varying vec3 direction;
      void main(){float h=normalize(direction).y; gl_FragColor=vec4(mix(horizon,zenith,smoothstep(-.18,.65,h)),1.);
      #include <colorspace_fragment>
      }`,
    }),
  );
  const sky = new Mesh(resources.geometry(new SphereGeometry(700, 24, 16)), skyMaterial);
  sky.frustumCulled = false;
  scene.add(sky);
  const ambient = new HemisphereLight('#ffffff', '#666666', 2);
  const sun = new DirectionalLight('#fff0cc', 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -34;
  sun.shadow.camera.right = 34;
  sun.shadow.camera.top = 34;
  sun.shadow.camera.bottom = -34;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 150;
  sun.shadow.bias = -0.00025;
  sun.shadow.normalBias = 0.03;
  scene.add(ambient, sun, sun.target);
  const random = seededRandom(401);
  const cloudMaterial = resources.material(
    new MeshStandardMaterial({ color: '#f6eddc', roughness: 1, flatShading: false }),
  );
  const clouds = new InstancedMesh(
    resources.geometry(new SphereGeometry(1, 20, 12)),
    cloudMaterial,
    56,
  );
  resources.instance(clouds);
  for (let i = 0; i < 56; i++) {
    const cluster = Math.floor(i / 7);
    const x = (cluster / 7) * (model.bounds.maxX + 100) - 50 + random() * 15;
    const z = cluster % 2 === 0 ? -65 - random() * 15 : 65 + random() * 25;
    clouds.setMatrixAt(
      i,
      transform(
        { x, y: -10 + random() * 8, z },
        { x: 0, y: 0, z: 0 },
        { x: 4 + random() * 5, y: 2.5 + random() * 3.5, z: 4 + random() * 4 },
      ),
    );
  }
  scene.add(clouds);
  const starPositions: number[] = [];
  for (let i = 0; i < 250; i++) {
    const angle = random() * Math.PI * 2;
    const y = 25 + random() * 200;
    starPositions.push(Math.cos(angle) * 300 + model.bounds.maxX / 2, y, Math.sin(angle) * 300);
  }
  const starsGeometry = resources.geometry(new BufferGeometry());
  starsGeometry.setAttribute('position', new Float32BufferAttribute(starPositions, 3));
  const stars = new Points(
    starsGeometry,
    resources.material(new PointsMaterial({ color: '#fff4d1', size: 0.7, sizeAttenuation: true })),
  );
  scene.add(stars);
  return {
    set: (mode: TourLighting): void => {
      const theme = THEMES[mode];
      uniforms.zenith.value.set(theme.zenith);
      uniforms.horizon.value.set(theme.horizon);
      ambient.color.set(theme.sky);
      ambient.groundColor.set(theme.ground);
      ambient.intensity = theme.ambient;
      sun.color.set(theme.sun);
      sun.intensity = theme.intensity;
      cloudMaterial.color.set(theme.cloud);
      scene.fog = new Fog(theme.horizon, 95, 340);
      stars.visible = mode === 'night';
    },
    update: (position: Vector3): void => {
      sky.position.copy(position);
      if (scene.fog instanceof Fog) {
        scene.fog.near = Math.max(95, position.y * 1.8);
        scene.fog.far = Math.max(340, scene.fog.near + 300);
      }
      sun.target.position.set(position.x, 0, Math.min(24, Math.max(0, position.z)));
      sun.position.copy(sun.target.position).add(new Vector3(-25, 45, 22));
    },
    dispose: (): void => {
      sun.shadow.dispose();
    },
  };
}
