import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Mesh,
  ShaderMaterial,
  DoubleSide,
} from 'three';
import type { TourModel } from '../types.js';
import type { GeometryResources } from '../../world/three/geometry/resources.js';

export function createWater(model: TourModel, resources: GeometryResources) {
  const positions: number[] = [];
  const coordinates: number[] = [];
  const falls: number[] = [];
  const quad = (points: readonly (readonly number[])[], fall: boolean): void => {
    for (const i of [0, 1, 2, 0, 2, 3]) {
      positions.push(...points[i]);
      coordinates.push(i === 1 || i === 2 ? 1 : 0, i >= 2 ? 1 : 0);
      falls.push(Number(fall));
    }
  };
  for (const cell of model.cells.filter((cell) => cell.surface === 'water')) {
    const { x, z } = cell;
    quad(
      [
        [x - 2, 0.015, z + 2],
        [x + 2, 0.015, z + 2],
        [x + 2, 0.015, z - 2],
        [x - 2, 0.015, z - 2],
      ],
      false,
    );
  }
  for (const fall of model.falls) {
    const { x, z } = fall.position;
    const dx = fall.edge === 'left' ? 0.95 : 0;
    const dz = fall.edge === 'right' ? 0.95 : 0;
    quad(
      [
        [x - dx, 0.03, z - dz],
        [x + dx, 0.03, z + dz],
        [x + dx, -fall.drop, z + dz],
        [x - dx, -fall.drop, z - dz],
      ],
      true,
    );
  }
  const geometry = resources.geometry(new BufferGeometry());
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(coordinates, 2));
  geometry.setAttribute('fall', new Float32BufferAttribute(falls, 1));
  const uniforms = {
    time: { value: 0 },
    shade: { value: new Color('#529fa5') },
    gleam: { value: new Color('#d8e5c2') },
  };
  const material = resources.material(
    new ShaderMaterial({
      uniforms,
      side: DoubleSide,
      transparent: true,
      depthWrite: false,
      vertexShader: `attribute float fall; varying vec3 p; varying vec2 st; varying float waterfall;
      void main(){ p=position; st=uv; waterfall=fall; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform float time; uniform vec3 shade; uniform vec3 gleam;
      varying vec3 p; varying vec2 st; varying float waterfall;
      void main(){
        float ripple=sin(p.z*6.+sin(p.x*.8+time*.4)*2.4-time*.8);
        float light=pow(max(0.,ripple),32.)*smoothstep(.3,.95,sin(p.x*1.3+time*.2));
        float flow=sin(st.x*83.+sin(st.x*27.)*2.+sin(st.y*4.-time*3.)*.35);
        float streak=smoothstep(.65,.98,flow)*(.65+.35*sin(st.y*9.-time*5.));
        float foam=waterfall*(streak*.5+pow(1.-st.y,12.)*.3);
        vec3 color=mix(shade,gleam,light*.25*(1.-waterfall)+foam);
        float alpha=mix(.92,.66+foam*.25,waterfall);
        gl_FragColor=vec4(color,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    }),
  );
  const mesh = new Mesh(geometry, material);
  mesh.renderOrder = 2;
  mesh.name = 'River and sky falls';
  return {
    mesh,
    update: (time: number): void => {
      uniforms.time.value = time;
    },
    night: (night: boolean): void => {
      uniforms.shade.value.set(night ? '#225563' : '#529fa5');
      uniforms.gleam.value.set(night ? '#95ccc3' : '#d8e5c2');
    },
  };
}
