import {
  ACESFilmicToneMapping,
  Box3,
  CylinderGeometry,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  PCFShadowMap,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { WorldModelFamily } from '../../../../src/world/model/geometry-types.js';
import { createModelRecipe } from '../../../../src/world/model/recipes/index.js';
import { VARIANTS } from './families.js';
import { createRecipeObject } from './three-model.js';

const GROUPS = {
  nature: [
    'conifer',
    'broadleaf',
    'bamboo',
    'willow',
    'grove',
    'meadow',
    'reeds',
    'rocks',
    'pond',
    'orchard',
    'rice-terrace',
  ],
  buildings: [
    'hanok',
    'choga',
    'house',
    'barn',
    'market',
    'tower',
    'library',
    'pavilion',
    'pagoda',
    'monument',
  ],
  life: [
    'station',
    'dock',
    'courtyard',
    'pier',
    'stair',
    'train',
    'ferry',
    'deer',
    'resident',
    'lanterns',
    'harvest',
    'blossoms',
    'snow-lights',
  ],
} as const satisfies Readonly<Record<string, readonly WorldModelFamily[]>>;

const groups = new Map<string, readonly WorldModelFamily[]>(Object.entries(GROUPS));
const params = new URLSearchParams(location.search);
const group = params.get('group') ?? 'nature';
const families = groups.get(group) ?? GROUPS.nature;
const rear = params.get('angle') === 'rear';
const width = 1080;
const cellHeight = 260;
const height = families.length * cellHeight;
const renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(width, height);
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
renderer.setClearColor('#e4ebe4');
renderer.setScissorTest(true);

const heading = document.createElement('h1');
heading.textContent = `Maeul miniature recipes · ${group} · ${rear ? 'rear' : 'front'}`;
const stage = document.createElement('main');
stage.style.cssText = `position:relative;width:${width}px;height:${height}px`;
stage.append(renderer.domElement);
document.body.append(heading, stage);

for (const [row, family] of families.entries()) {
  const models = VARIANTS.map((variant) => ({
    recipe: createModelRecipe(family, variant),
    ...createRecipeObject(createModelRecipe(family, variant)),
  }));
  const familyBounds = new Box3();
  for (const model of models) familyBounds.union(new Box3().setFromObject(model.group, true));
  familyBounds.expandByPoint(new Vector3(-0.55, 0, -0.55));
  familyBounds.expandByPoint(new Vector3(0.55, 0, 0.55));
  const center = familyBounds.getCenter(new Vector3());
  const extent = familyBounds.getSize(new Vector3());
  const viewHeight = Math.max(1.3, Math.hypot(extent.x, extent.y, extent.z) * 0.91);
  const halfWidth = (viewHeight * (width / 3)) / cellHeight / 2;
  const camera = new OrthographicCamera(
    -halfWidth,
    halfWidth,
    viewHeight / 2,
    -viewHeight / 2,
    0.1,
    20,
  );
  camera.position.copy(center).add(new Vector3(rear ? -2.5 : 2.5, 2.1, rear ? -3.2 : 3.2));
  camera.lookAt(center);
  for (const [column, model] of models.entries()) {
    const scene = new Scene();
    scene.add(new HemisphereLight('#f9f3dd', '#879b87', 2.2));
    const sun = new DirectionalLight('#fff4da', 3.3);
    sun.position.set(-2, 5, 3);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -1;
    sun.shadow.camera.right = 1;
    sun.shadow.camera.top = 2;
    sun.shadow.camera.bottom = -1;
    sun.shadow.normalBias = 0.015;
    scene.add(sun, model.group);
    const ground = new Mesh(
      new CylinderGeometry(0.54, 0.54, 0.038, 48),
      new MeshStandardMaterial({ color: '#c4d0b3', roughness: 1 }),
    );
    ground.position.y = -0.023;
    ground.receiveShadow = true;
    scene.add(ground);
    renderer.setViewport(
      (column * width) / 3,
      height - (row + 1) * cellHeight,
      width / 3,
      cellHeight,
    );
    renderer.setScissor(
      (column * width) / 3,
      height - (row + 1) * cellHeight,
      width / 3,
      cellHeight,
    );
    renderer.render(scene, camera);
    const label = document.createElement('div');
    label.textContent = `${model.recipe.key} · ${model.recipe.parts.length} parts`;
    label.style.cssText = `position:absolute;left:${(column * width) / 3 + 18}px;top:${(row + 1) * cellHeight - 30}px;color:#394a45;font:13px monospace`;
    stage.append(label);
    model.dispose();
    ground.geometry.dispose();
    ground.material.dispose();
    sun.shadow.dispose();
  }
}
document.documentElement.dataset.ready = 'true';
document.documentElement.dataset.models = String(families.length * 3);
const webglVersion: unknown = renderer.getContext().getParameter(renderer.getContext().VERSION);
document.documentElement.dataset.webgl =
  typeof webglVersion === 'string' ? webglVersion : 'unknown';
window.addEventListener('pagehide', () => renderer.dispose(), { once: true });
