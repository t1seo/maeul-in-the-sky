import { serializeSnapshot } from '../core/settings/serialize.js';
import type { SnapshotV1 } from '../core/snapshot-types.js';
import type { TerrainRenderResult } from '../core/scene-types.js';
import type { ColorMode } from '../core/types.js';
import { click, status } from './dom.js';
import { downloadBlob, downloadText, pngBlob } from './downloads.js';
import { renderOptions, staticSnapshotSvg } from './preview.js';
import type { DemoRenderer } from './renderers.js';

export function setupSceneDownloads(
  current: () => {
    readonly snapshot: SnapshotV1;
    readonly output: TerrainRenderResult;
    readonly mode: ColorMode;
    readonly renderer: DemoRenderer;
  },
): void {
  click('download-svg', () => {
    const { output, mode } = current();
    downloadText(output[mode], `maeul-in-the-sky-${mode}.svg`, 'image/svg+xml');
  });
  click('download-snapshot', () => {
    const { snapshot } = current();
    downloadText(serializeSnapshot(snapshot), `maeul-${snapshot.username}-${snapshot.year}.json`);
  });
  click('download-png', async () => {
    const { snapshot, mode, renderer } = current();
    const dimensions = renderOptions(snapshot.settings);
    const blob = await pngBlob(
      staticSnapshotSvg(snapshot, mode, renderer),
      dimensions.width,
      dimensions.height,
      mode === 'light',
    );
    downloadBlob(blob, `maeul-in-the-sky-${mode}.png`);
    status('Downloaded a complete static PNG at 2× resolution.');
  });
}
