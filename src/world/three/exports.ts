import {
  Vector2,
  type Group,
  type OrthographicCamera,
  type Scene,
  type WebGLRenderer,
} from 'three';
import type { WorldCaptureOptions } from '../model/renderer-types.js';
import { ThreeRendererError } from './errors.js';
import { flattenVisibleContent } from './export-content.js';
import { disposeObjectTree } from './resources.js';
import { prepareExportTextures } from './export-textures.js';

export async function capturePng(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: OrthographicCamera,
  options: WorldCaptureOptions,
  lifecycle: {
    readonly active: () => boolean;
    readonly prepare: (camera: OrthographicCamera) => void;
  },
): Promise<Blob> {
  const { width, height } = options;
  if (
    options.format !== 'png' ||
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > 4096 ||
    height > 4096
  ) {
    throw new ThreeRendererError('capture', 'Choose PNG dimensions between 1 and 4096 pixels.');
  }
  const size = renderer.getSize(new Vector2());
  const pixelRatio = renderer.getPixelRatio();
  const photo = camera.clone();
  photo.right = (photo.top * width) / height;
  photo.left = -photo.right;
  photo.updateProjectionMatrix();
  try {
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    lifecycle.prepare(photo);
    renderer.render(scene, photo);
    return await new Promise<Blob>((resolve, reject) => {
      renderer.domElement.toBlob((blob) => {
        if (!lifecycle.active())
          reject(
            new ThreeRendererError('disposed', 'The 3D view closed before the photo was ready.'),
          );
        else if (blob) resolve(blob);
        else reject(new ThreeRendererError('capture', 'The browser could not encode this photo.'));
      }, 'image/png');
    });
  } catch (error) {
    if (error instanceof ThreeRendererError) throw error;
    throw new ThreeRendererError('capture', 'The photo could not be captured.', { cause: error });
  } finally {
    if (lifecycle.active()) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(size.x, size.y, false);
      lifecycle.prepare(camera);
      renderer.render(scene, camera);
    }
  }
}

export async function exportGlb(content: Group): Promise<Blob> {
  const exported = flattenVisibleContent(content);
  try {
    prepareExportTextures(exported);
    const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
    const result = await new GLTFExporter().parseAsync(exported, {
      binary: true,
      onlyVisible: true,
    });
    if (!(result instanceof ArrayBuffer))
      throw new ThreeRendererError('export', 'The model exporter did not return GLB data.');
    return new Blob([result], { type: 'model/gltf-binary' });
  } catch (error) {
    if (error instanceof ThreeRendererError) throw error;
    throw new ThreeRendererError('export', 'The 3D model could not be exported.', { cause: error });
  } finally {
    disposeObjectTree(exported);
  }
}
