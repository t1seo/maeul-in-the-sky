import { afterEach, describe, expect, it } from 'vitest';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { assertTourAssets } from '../../scripts/smoke/tour.js';
import { authoredPackageFixture } from './authored-inventory-fixture.js';

const cleanup: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});

describe('packaged authored model inventory', () => {
  it('verifies all three manifests when models live in separate local collections', async () => {
    // Given wildlife, nature and village collections in a real package directory.
    const fixture = await authoredPackageFixture();
    cleanup.push(fixture.close);
    // When the packaged tour inventory is inspected.
    const inspect = () => assertTourAssets(fixture.directory);
    // Then nested authored collections are verified without a fixed eight-animal list.
    expect(inspect).not.toThrow();
  });

  it('rejects an altered nested model when its recorded checksum is stale', async () => {
    // Given a complete package with a corrupted nature model.
    const fixture = await authoredPackageFixture();
    cleanup.push(fixture.close);
    const file = join(fixture.models, 'nature/fixture.glb');
    const bytes = await readFile(file);
    bytes[bytes.length - 1] ^= 1;
    await writeFile(file, bytes);
    // When the package inventory is inspected.
    const inspect = () => assertTourAssets(fixture.directory);
    // Then the corrupted asset is identified before publication.
    expect(inspect).toThrow(/nature\/fixture\.glb.*checksum/iu);
  });

  it('rejects a missing nested license when its model is redistributed', async () => {
    // Given a model whose promised license text is absent.
    const fixture = await authoredPackageFixture();
    cleanup.push(fixture.close);
    await rm(join(fixture.models, 'village/licenses/CC0-1.0.txt'));
    // When the package inventory is inspected.
    const inspect = () => assertTourAssets(fixture.directory);
    // Then publication cannot silently omit an asset license.
    expect(inspect).toThrow(/village\/licenses\/CC0-1\.0\.txt/u);
  });

  it('rejects an unlisted GLB when a model is copied without provenance', async () => {
    // Given a binary in the package that is absent from every manifest.
    const fixture = await authoredPackageFixture();
    cleanup.push(fixture.close);
    await writeFile(join(fixture.models, 'village/uncredited.glb'), 'uncredited');
    // When the package inventory is inspected.
    const inspect = () => assertTourAssets(fixture.directory);
    // Then the missing provenance is explicit.
    expect(inspect).toThrow(/uncredited\.glb.*manifest/iu);
  });

  it('rejects a traversal path when a manifest points outside its collection', async () => {
    // Given untrusted manifest data with an escaping relative file.
    const fixture = await authoredPackageFixture();
    cleanup.push(fixture.close);
    await writeFile(
      join(fixture.models, 'nature/manifest.json'),
      JSON.stringify({ version: 1, models: [{ ...fixture.model, file: '../fixture.glb' }] }),
    );
    // When the package inventory is inspected.
    const inspect = () => assertTourAssets(fixture.directory);
    // Then path validation fails before opening the target.
    expect(inspect).toThrow(/nature\/manifest\.json/iu);
  });

  it('rejects a missing source notice when the published credits link to it', async () => {
    const fixture = await authoredPackageFixture();
    cleanup.push(fixture.close);
    await writeFile(
      join(fixture.models, 'CREDITS.md'),
      '# Credits\n\n[Original license notice](licenses/missing-source-notice.txt)\n',
    );
    expect(() => assertTourAssets(fixture.directory)).toThrow(/missing-source-notice\.txt/u);
  });
});
