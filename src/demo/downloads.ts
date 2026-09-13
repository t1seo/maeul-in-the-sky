export class ImageExportError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadText(text: string, filename: string, type = 'application/json'): void {
  downloadBlob(new Blob([text], { type }), filename);
}

export async function copyOrDownload(
  text: string,
  filename: string,
  type: string,
): Promise<string> {
  try {
    await navigator.clipboard.writeText(text);
    return 'Copied to clipboard.';
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    downloadText(text, filename, type);
    return `Clipboard unavailable. Downloaded ${filename} instead.`;
  }
}

export async function pngBlob(
  svg: string,
  width: number,
  height: number,
  light: boolean,
): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const context = canvas.getContext('2d');
    if (!context)
      throw new ImageExportError('PNG export needs canvas support. Download the SVG instead.');
    context.fillStyle = light ? '#ffffff' : '#0d1117';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) =>
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new ImageExportError('Could not create the PNG. Download the SVG instead.'));
      }, 'image/png'),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
