import { Document, NodeIO } from '@gltf-transform/core';

export async function authoredFixtureBytes(): Promise<ArrayBuffer> {
  const document = new Document();
  const buffer = document.createBuffer();
  const positions = document
    .createAccessor()
    .setType('VEC3')
    .setArray(new Float32Array([-1, 0, 0, 1, 0, 0, 0, 2, 0]))
    .setBuffer(buffer);
  const normals = document
    .createAccessor()
    .setType('VEC3')
    .setArray(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]))
    .setBuffer(buffer);
  const material = document.createMaterial('Foliage');
  const mesh = document
    .createMesh()
    .addPrimitive(
      document
        .createPrimitive()
        .setAttribute('POSITION', positions)
        .setAttribute('NORMAL', normals)
        .setMaterial(material),
    );
  document
    .createScene()
    .addChild(document.createNode('Oak').setMesh(mesh))
    .addChild(document.createNode('Birch').setMesh(mesh).setTranslation([10, 0, 0]));
  return new Uint8Array(await new NodeIO().writeBinary(document)).buffer;
}
