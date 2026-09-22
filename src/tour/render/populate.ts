import { CircleGeometry, Group, InstancedMesh, MeshBasicMaterial, Color } from 'three';
import { createTourAsset } from '../assets/index.js';
import type { TourModel } from '../types.js';
import type { GroundCollider } from '../navigation/ground.js';
import type { GeometryResources } from '../../world/three/geometry/resources.js';
import { transform } from '../../world/three/geometry/placements.js';
import { createBatches } from './batches.js';
import { addScenery } from './scenery.js';
import type { ForestWind } from './wind.js';
import { vegetationWind } from './vegetation.js';
import type { WildlifeLibrary } from '../wildlife/library.js';
import { createWildlifePopulation } from '../wildlife/population.js';

export function populateVillage(
  model: TourModel,
  resources: GeometryResources,
  wind?: ForestWind,
  wildlife?: WildlifeLibrary,
) {
  const root = new Group();
  const batches = createBatches(resources, wind);
  const animals = createWildlifePopulation(model, wildlife);
  resources.instance(animals);
  const colliders: GroundCollider[] = [];
  const shadows = new InstancedMesh(
    resources.geometry(new CircleGeometry(1, 20)),
    resources.material(
      new MeshBasicMaterial({
        color: '#253d32',
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
      }),
    ),
    model.placements.length,
  );
  resources.instance(shadows);
  for (const [index, placement] of model.placements.entries()) {
    const { source, position, season } = placement;
    const asset = createTourAsset(source.catalogId, source.variant, season);
    if (asset.collider) colliders.push({ x: position.x, z: position.z, ...asset.collider });
    for (const part of animals.placements.has(source.id) ? [] : asset.recipe.parts) {
      const hsl = new Color(part.color).getHSL({ h: 0, s: 0, l: 0 });
      const glow = part.roughness <= 0.5 && hsl.h > 0.04 && hsl.h < 0.19 && hsl.s > 0.25;
      batches.add(
        part,
        asset.recipe.key,
        position,
        asset.scale,
        source.id,
        glow,
        vegetationWind(source.catalogId),
      );
    }
    const radius = asset.collider ? Math.max(asset.collider.halfX, asset.collider.halfZ) : 0.3;
    shadows.setMatrixAt(
      index,
      transform(
        { x: position.x, y: 0.012, z: position.z },
        { x: -Math.PI / 2, y: 0, z: 0 },
        { x: radius * 1.3, y: radius * 1.1, z: 1 },
      ),
    );
  }
  root.add(shadows, addScenery(model, batches, resources, wind), batches.finish(), animals.root);
  const identities = new Map([...batches.identities, ...animals.identities]);
  return { root, colliders, identities, glows: batches.glows, animals };
}
