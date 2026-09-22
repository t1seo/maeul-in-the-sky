import { BufferGeometry, Color, Float32BufferAttribute, Points, ShaderMaterial } from 'three';
import { seededRandom } from '../../utils/math.js';
import type { TourModel } from '../types.js';
import type { GeometryResources } from '../../world/three/geometry/resources.js';

export function createParticles(model: TourModel, resources: GeometryResources) {
  const positions: number[] = [];
  const colors: number[] = [];
  const random = seededRandom(277);
  for (const effect of model.scene.consistencyEffects ?? []) {
    const color = new Color(
      {
        springPetals: '#f5b6c9',
        summerFireflies: '#ffe595',
        autumnLeaves: '#d19a51',
        winterFrost: '#edf5ef',
      }[effect.kind],
    );
    for (let index = 0; index < effect.particles.length; index++) {
      positions.push(
        effect.week * 4 + (random() - 0.5) * 9,
        0.6 + random() * 4,
        effect.day * 4 + (random() - 0.5) * 6,
      );
      colors.push(color.r, color.g, color.b);
    }
  }
  const geometry = resources.geometry(new BufferGeometry());
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  const time = { value: 0 };
  const material = resources.material(
    new ShaderMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      uniforms: { time },
      vertexShader: `uniform float time; varying vec3 tint; void main(){ tint=color; vec3 p=position;
      p.x+=sin(time*.4+p.z)*.4; p.y+=sin(time*.7+p.x)*.25;
      vec4 mv=modelViewMatrix*vec4(p,1.); gl_PointSize=clamp(65./-mv.z,1.,7.); gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 tint; void main(){float d=length(gl_PointCoord-.5); if(d>.5)discard; gl_FragColor=vec4(tint,.85);
      #include <colorspace_fragment>
      }`,
    }),
  );
  const points = new Points(geometry, material);
  return {
    points,
    update: (elapsed: number): void => {
      time.value = elapsed;
    },
  };
}
