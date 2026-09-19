import type { ImportedWorlds, WorldDocumentV1 } from '../data/index.js';

export function prepareIncoming(incoming: ImportedWorlds): ImportedWorlds {
  if (incoming.kind === 'world') return incoming;
  return {
    ...incoming,
    documents: incoming.documents.map((document) => {
      const latest = document.scene.days.filter((day) => day.kind === 'observed').at(-1);
      return latest
        ? { ...document, view: { ...document.view, cursorDate: latest.date } }
        : document;
    }),
  };
}

export function sourcePeriod(document: WorldDocumentV1): string {
  const dates = document.sourceSnapshot.weeks
    .flatMap((week) => week.days.map((day) => day.date))
    .sort();
  const first = dates[0];
  return first ? `${first} — ${dates.at(-1)}` : 'No observed dates';
}
