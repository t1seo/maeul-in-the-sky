import { createHash } from 'node:crypto';
import { expect, it } from 'vitest';
import { assertModelBytes, parseModelManifest } from '../../scripts/authored/inventory.js';
import { fixtureGlb } from './authored-inventory-fixture.js';

it.each([
  { label: 'external buffer', buffers: [{ byteLength: 4, uri: 'https://example.com/data.bin' }] },
  { label: 'external image', images: [{ bufferView: 0, uri: 'https://example.com/image.png' }] },
  { label: 'external decoder', extensionsRequired: ['KHR_draco_mesh_compression'] },
])('rejects $label when a GLB would require another download', (extra) => {
  const bytes = fixtureGlb({ asset: { version: '2.0' }, buffers: [{ byteLength: 4 }], ...extra });
  const model = {
    relativeFile: 'nature/fixture.glb',
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
  expect(() => assertModelBytes(bytes, model)).toThrow(/embed every resource/u);
});

it('rejects a missing named submodel when a collection is referenced', () => {
  const bytes = fixtureGlb({
    asset: { version: '2.0' },
    buffers: [{ byteLength: 4 }],
    nodes: [{ name: 'Oak' }],
  });
  const model = {
    relativeFile: 'nature/fixture.glb',
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    node: 'Pine',
  };
  expect(() => assertModelBytes(bytes, model)).toThrow('Missing named node Pine');
});

it('rejects malformed source provenance when a manifest lacks an original checksum', () => {
  const value = {
    version: 1,
    models: [
      {
        id: 'fixture',
        file: 'fixture.glb',
        bytes: 100,
        sha256: 'a'.repeat(64),
        source: {
          creator: 'Author',
          modelUrl: 'https://example.com/model',
          downloadUrl: 'https://example.com/model.glb',
          license: 'CC0-1.0',
          licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
          licenseFile: 'licenses/CC0-1.0.txt',
          sha256: 'not-a-digest',
        },
        modifications: ['Repacked.'],
      },
    ],
  };
  expect(() => parseModelManifest(value, 'nature')).toThrow(/nature\/manifest\.json/u);
});
