import type { Material, Vector4 } from 'three';

type WindShader = Pick<Parameters<Material['onBeforeCompile']>[0], 'vertexShader' | 'uniforms'>;
export type WindUniforms = {
  readonly forestTime: { value: number };
  readonly forestSettings: { readonly value: Vector4 };
};

const FIELD = `
uniform float forestTime;
uniform vec4 forestSettings;
void forestField(vec3 p, out vec3 offset, out mat3 jacobian) {
  float strength = forestSettings.x;
  float bend = forestSettings.y;
  float flutter = forestSettings.z;
  float h = clamp(p.y - 0.015, 0.0, forestSettings.w);
  float flex = h * h / (h + bend);
  float slope = h * (h + 2.0 * bend) / ((h + bend) * (h + bend));
  slope *= step(0.015, p.y) * (1.0 - step(forestSettings.w + 0.015, p.y));
  vec3 phase = vec3(
    dot(p.xz, vec2(0.085, 0.11)) - forestTime * 0.85,
    dot(p.xz, vec2(0.045, -0.03)) + forestTime * 1.2,
    p.z * 0.08 + forestTime * 0.61
  );
  float gust = 0.72 + 0.28 * sin(phase.x);
  float sway = 0.4 + 0.5 * sin(phase.y) + 0.25 * sin(phase.z);
  float flow = gust * sway;
  float flowX = 0.28 * cos(phase.x) * 0.085 * sway + gust * 0.5 * cos(phase.y) * 0.045;
  float flowZ = 0.28 * cos(phase.x) * 0.11 * sway
    + gust * (-0.015 * cos(phase.y) + 0.02 * cos(phase.z));
  float detail = forestTime * 3.7 + dot(p.xz, vec2(1.4, 1.1));
  float crosswind = dot(p.xz, vec2(0.19, -0.12)) - forestTime * 0.5;
  vec2 breeze = strength * vec2(flow, 0.33 * flow + 0.15 * sin(crosswind))
    + flutter * vec2(sin(detail), 0.4 * cos(detail * 1.23));
  vec2 detailSlope = flutter * vec2(cos(detail), -0.492 * sin(detail * 1.23));
  vec2 dx = strength * vec2(flowX, 0.33 * flowX + 0.0285 * cos(crosswind))
    + detailSlope * 1.4;
  vec2 dz = strength * vec2(flowZ, 0.33 * flowZ - 0.018 * cos(crosswind))
    + detailSlope * 1.1;
  offset = vec3(breeze.x, 0.0, breeze.y) * flex;
  jacobian = mat3(
    vec3(1.0 + dx.x * flex, 0.0, dx.y * flex),
    vec3(breeze.x * slope, 1.0, breeze.y * slope),
    vec3(dz.x * flex, 0.0, 1.0 + dz.y * flex)
  );
}
`;

const SAMPLE = `
  mat4 forestWorldMatrix = modelMatrix;
  #ifdef USE_INSTANCING
    forestWorldMatrix *= instanceMatrix;
  #endif
  mat3 forestToLocal = inverse(mat3(forestWorldMatrix));
  vec3 forestOffset;
  mat3 forestJacobian;
  forestField((forestWorldMatrix * vec4(position, 1.0)).xyz, forestOffset, forestJacobian);
`;

const NORMAL = `
  mat3 forestCofactor = mat3(
    cross(forestJacobian[1], forestJacobian[2]),
    cross(forestJacobian[2], forestJacobian[0]),
    cross(forestJacobian[0], forestJacobian[1])
  );
  objectNormal = transpose(mat3(forestWorldMatrix)) * forestCofactor
    * transpose(forestToLocal) * objectNormal;
`;

export function applyForestWindShader(shader: WindShader, uniforms: WindUniforms): void {
  Object.assign(shader.uniforms, uniforms);
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', `#include <common>\n${FIELD}`)
    .replace('void main() {', `void main() {\n${SAMPLE}`)
    .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>\n${NORMAL}`)
    .replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\ntransformed += forestToLocal * forestOffset;',
    );
}
