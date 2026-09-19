import type { WorldDocumentV1 } from '../data/types.js';
import { WorldAppError } from './errors.js';
import { postcardCaption, profilePostcardCopy } from './postcard-copy.js';

export const POSTCARD_WIDTH = 1600;
export const POSTCARD_IMAGE_HEIGHT = 1000;
export const POSTCARD_FOOTER = 160;

function drawProfileFooter(context: CanvasRenderingContext2D, document: WorldDocumentV1): void {
  const copy = profilePostcardCopy(document);
  const night = document.view.lighting === 'night';
  const center = POSTCARD_WIDTH / 2;
  context.textAlign = 'center';
  context.fillStyle = night ? '#edf2ee' : '#293e39';
  context.font = '600 28px MaeulProfile, sans-serif';
  context.fillText(copy.title, center, POSTCARD_IMAGE_HEIGHT + 37, POSTCARD_WIDTH - 80);
  context.font = '18px MaeulProfile, sans-serif';
  context.fillText(copy.stats, center, POSTCARD_IMAGE_HEIGHT + 68, POSTCARD_WIDTH - 80);
  context.fillStyle = night ? '#afc4c9' : '#697569';
  context.font = '14px MaeulProfile, sans-serif';
  context.fillText(copy.source, center, POSTCARD_IMAGE_HEIGHT + 96, POSTCARD_WIDTH - 80);
  context.textAlign = 'left';
  const start = center - 375;
  context.fillText(copy.legendNote, start, POSTCARD_IMAGE_HEIGHT + 132);
  context.font = '16px MaeulProfile, sans-serif';
  for (const [index, entry] of copy.legend.entries()) {
    const x = start + 180 + index * 145;
    context.fillStyle = entry.color;
    context.beginPath();
    context.arc(x, POSTCARD_IMAGE_HEIGHT + 126, 6, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = night ? '#edf2ee' : '#293e39';
    context.fillText(entry.label, x + 17, POSTCARD_IMAGE_HEIGHT + 132);
  }
}

export async function postcard(image: Blob, document: WorldDocumentV1): Promise<Blob> {
  const bitmap = await createImageBitmap(image);
  try {
    const canvas = window.document.createElement('canvas');
    canvas.width = POSTCARD_WIDTH;
    canvas.height = POSTCARD_IMAGE_HEIGHT + POSTCARD_FOOTER;
    const context = canvas.getContext('2d');
    if (!context)
      throw new WorldAppError(
        'capture',
        'Could not create a PNG. Please save the landscape as SVG.',
      );
    const profile = document.scene.settings.layout === 'seasonal-circle';
    context.fillStyle = profile && document.view.lighting === 'night' ? '#101d2e' : '#f6f4ec';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, POSTCARD_WIDTH, POSTCARD_IMAGE_HEIGHT);
    if (profile) drawProfileFooter(context, document);
    else {
      context.fillStyle = '#293e39';
      context.textAlign = 'center';
      const [title, atmosphere, source] = postcardCaption(document);
      context.font = '30px Georgia, serif';
      context.fillText(title, POSTCARD_WIDTH / 2, POSTCARD_IMAGE_HEIGHT + 47, POSTCARD_WIDTH - 80);
      context.font = '18px sans-serif';
      context.fillText(
        atmosphere,
        POSTCARD_WIDTH / 2,
        POSTCARD_IMAGE_HEIGHT + 84,
        POSTCARD_WIDTH - 80,
      );
      context.fillStyle = '#697569';
      context.font = '14px sans-serif';
      context.fillText(
        source,
        POSTCARD_WIDTH / 2,
        POSTCARD_IMAGE_HEIGHT + 119,
        POSTCARD_WIDTH - 80,
      );
    }
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new WorldAppError('capture', 'Could not save the PNG. Please use SVG.')),
        'image/png',
      );
    });
  } finally {
    bitmap.close();
  }
}
