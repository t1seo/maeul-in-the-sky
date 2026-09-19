import { createWorldDocument, serializeWorldDocument } from '../data/index.js';
import type { WorldDocumentV1 } from '../data/index.js';
import { downloadBlob, downloadText } from '../../demo/downloads.js';
import type { WorldSession } from './session.js';
import { click, status } from './dom.js';
import { atmosphereLabel, dateLabel } from './presentation.js';
import { WorldAppError } from './errors.js';
import { sourcePeriod } from './incoming.js';

const WIDTH = 1600;
const IMAGE_HEIGHT = 1000;
const FOOTER = 160;

function caption(document: WorldDocumentV1): readonly [string, string, string] {
  return [
    `${document.scene.username}’s Sky World`,
    `${dateLabel(document.view.cursorDate)} · ${atmosphereLabel(document.view, document.scene)}`,
    `${document.sourceSnapshot.source.kind === 'sample' ? 'Sample records' : document.sourceSnapshot.source.kind === 'github' ? 'GitHub contributions' : 'Imported records'} · ${sourcePeriod(document)} · MAEUL IN THE SKY`,
  ];
}

async function postcard(image: Blob, document: WorldDocumentV1): Promise<Blob> {
  const bitmap = await createImageBitmap(image);
  try {
    const canvas = window.document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = IMAGE_HEIGHT + FOOTER;
    const context = canvas.getContext('2d');
    if (!context)
      throw new WorldAppError(
        'capture',
        'Could not create a PNG. Please save the landscape as SVG.',
      );
    context.fillStyle = '#f6f4ec';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, WIDTH, IMAGE_HEIGHT);
    context.fillStyle = '#293e39';
    context.textAlign = 'center';
    const [title, atmosphere, source] = caption(document);
    context.font = '30px Georgia, serif';
    context.fillText(title, WIDTH / 2, IMAGE_HEIGHT + 47, WIDTH - 80);
    context.font = '18px sans-serif';
    context.fillText(atmosphere, WIDTH / 2, IMAGE_HEIGHT + 84, WIDTH - 80);
    context.fillStyle = '#697569';
    context.font = '14px sans-serif';
    context.fillText(source, WIDTH / 2, IMAGE_HEIGHT + 119, WIDTH - 80);
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

async function mapPostcard(current: WorldDocumentV1): Promise<Blob> {
  const { mountMap } = await import('../map/index.js');
  const host = document.createElement('div');
  const renderer = mountMap(
    host,
    current.scene,
    { ...current.view, motion: 'off' },
    {
      onSelect: () => {},
      onViewChange: () => {},
      onError: (error) => {
        throw error;
      },
    },
  );
  try {
    const image = await renderer.capture({ format: 'svg', width: WIDTH, height: IMAGE_HEIGHT });
    const parsed = new DOMParser().parseFromString(await image.text(), 'image/svg+xml');
    const source = parsed.documentElement;
    if (parsed.querySelector('parsererror'))
      throw new WorldAppError('capture', 'Could not save the map as SVG.');
    const namespace = 'http://www.w3.org/2000/svg';
    const root = document.createElementNS(namespace, 'svg');
    root.setAttribute('xmlns', namespace);
    root.setAttribute('viewBox', `0 0 ${WIDTH} ${IMAGE_HEIGHT + FOOTER}`);
    root.setAttribute('width', String(WIDTH));
    root.setAttribute('height', String(IMAGE_HEIGHT + FOOTER));
    const background = document.createElementNS(namespace, 'rect');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', '#f6f4ec');
    source.setAttribute('x', '0');
    source.setAttribute('y', '0');
    source.setAttribute('width', String(WIDTH));
    source.setAttribute('height', String(IMAGE_HEIGHT));
    root.append(background, document.importNode(source, true));
    for (const [index, line] of caption(current).entries()) {
      const label = document.createElementNS(namespace, 'text');
      label.setAttribute('x', String(WIDTH / 2));
      label.setAttribute('y', String(IMAGE_HEIGHT + 47 + index * 36));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', String(index === 0 ? 30 : index === 1 ? 18 : 14));
      label.setAttribute('font-family', index === 0 ? 'Georgia, serif' : 'sans-serif');
      label.setAttribute('fill', '#293e39');
      label.textContent = line;
      root.append(label);
    }
    return new Blob([new XMLSerializer().serializeToString(root)], { type: 'image/svg+xml' });
  } finally {
    renderer.dispose();
  }
}

export function setupExports(session: WorldSession, signal: AbortSignal): void {
  const filename = () =>
    `maeul-world-${session.current().scene.username}-${session.current().view.cursorDate}`;
  const deliver = async (pending: Promise<Blob>, name: string, message: string): Promise<void> => {
    try {
      const image = await pending;
      if (signal.aborted) return;
      downloadBlob(image, name);
      status(message);
    } catch (error) {
      if (!signal.aborted) throw error;
    }
  };
  click(
    'export-world',
    () => {
      const current = session.current();
      const document = createWorldDocument({
        scene: current.scene,
        sourceSnapshot: current.sourceSnapshot,
        repositoryData: current.repositoryData,
        view: current.view,
      });
      downloadText(serializeWorldDocument(document), `${filename()}.json`);
      status('Saved the records, layout and current view as a world file.');
    },
    signal,
  );
  click(
    'export-svg',
    async () => {
      const current = session.current();
      const name = filename();
      await deliver(
        mapPostcard(current),
        `${name}.svg`,
        'Saved the selected date’s map as an SVG postcard.',
      );
    },
    signal,
  );
  click(
    'export-png',
    async () => {
      const renderer = session.renderer.current();
      if (!renderer)
        throw new WorldAppError(
          'initializing',
          'You can take a photo once the landscape is ready.',
        );
      const current = session.current();
      const name = filename();
      const image = renderer
        .capture({ format: 'png', width: WIDTH, height: IMAGE_HEIGHT })
        .then((image) => postcard(image, current));
      await deliver(
        image,
        `${name}.png`,
        'Saved the current view, date and atmosphere as a PNG postcard.',
      );
    },
    signal,
  );
  click(
    'export-glb',
    async () => {
      const renderer = session.renderer.current();
      if (!renderer?.exportModel)
        throw new WorldAppError('unsupported', 'Switch to 3D walk to save the model.');
      const name = filename();
      await deliver(
        renderer.exportModel(),
        `${name}.glb`,
        'Saved this landscape as a GLB model. A world file also includes records and replay settings.',
      );
    },
    signal,
  );
}
