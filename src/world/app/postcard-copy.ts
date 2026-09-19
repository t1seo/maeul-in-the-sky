import type { WorldDocumentV1 } from '../data/types.js';
import { sourcePeriod } from './incoming.js';
import { atmosphereLabel, dateLabel } from './presentation.js';

function sourceLabel(document: WorldDocumentV1): string {
  switch (document.sourceSnapshot.source.kind) {
    case 'sample':
      return 'Sample records';
    case 'github':
      return 'GitHub contributions';
    case 'import':
      return 'Imported records';
  }
}

export function postcardCaption(document: WorldDocumentV1): readonly [string, string, string] {
  return [
    `${document.scene.username}’s Sky World`,
    `${dateLabel(document.view.cursorDate)} · ${atmosphereLabel(document.view, document.scene)}`,
    `${sourceLabel(document)} · ${sourcePeriod(document)} · MAEUL IN THE SKY`,
  ];
}

export function profilePostcardCopy(document: WorldDocumentV1) {
  const observed = document.scene.days.filter(
    (day) => day.kind === 'observed' && day.date <= document.view.cursorDate,
  );
  const total = observed.reduce((sum, day) => sum + (day.kind === 'observed' ? day.count : 0), 0);
  const active = observed.filter((day) => day.kind === 'observed' && day.count > 0).length;
  const number = new Intl.NumberFormat('en-US');
  return {
    title: `${document.scene.username}’s four-season sky`,
    stats: `${number.format(total)} contributions · ${number.format(active)} active / ${number.format(observed.length)} observed ${observed.length === 1 ? 'day' : 'days'}`,
    source: `${sourceLabel(document)} · ${sourcePeriod(document)} · View ${document.view.cursorDate} · MAEUL IN THE SKY`,
    legendNote: 'Seasonal scenery',
    legend: [
      { label: 'Spring', color: '#d493ac' },
      { label: 'Summer', color: '#669a73' },
      { label: 'Autumn', color: '#cc8956' },
      { label: 'Winter', color: '#8bafc7' },
    ],
  };
}
