import { frameWorld } from '../model/index.js';
import type { WorldLocalRecords } from '../data/index.js';
import type { WorldSession } from './session.js';
import { action, card, cardButton, dialog, empty, html, select, status, text } from './dom.js';

export function setupDiscoveries(
  session: WorldSession,
  records: WorldLocalRecords,
  signal: AbortSignal,
) {
  let revision = 0;
  const refresh = async (): Promise<void> => {
    const ticket = ++revision;
    const { scene, view } = session.current();
    const [journal, fresh] = await Promise.all([
      records.readDiscoveries(scene.worldId),
      records.newSinceVisit(scene, view.cursorDate),
    ]);
    if (signal.aborted || ticket !== revision || session.current().scene !== scene) return;
    const available = frameWorld(scene, view).discoveries;
    const seen = new Set(journal.entries.map((entry) => entry.discoveryId));
    const filter = select('discovery-filter').value;
    const visible = available.filter((place) =>
      filter === 'visited' ? seen.has(place.id) : filter === 'new' ? !seen.has(place.id) : true,
    );
    html('discovery-note').textContent =
      `Discovered ${available.filter((place) => seen.has(place.id)).length} of ${available.length} ${available.length === 1 ? 'place' : 'places'}.${fresh.length ? ` ${fresh.length} new ${fresh.length === 1 ? 'place has' : 'places have'} appeared since your last visit.` : ' Visit a place to add it to your discovery journal.'}`;
    const target = html('discovery-list');
    target.replaceChildren(
      ...visible.map((place) => {
        const node = card(place.title, place.description);
        node.append(
          text(
            'small',
            `${place.availableFrom} · ${seen.has(place.id) ? 'Visited' : 'Not yet discovered'}`,
          ),
        );
        node.append(
          cardButton('Visit this place', async () => {
            session.update({ selectedId: place.entityId });
            session.focus({ kind: 'entity', entityId: place.entityId });
            await records.markDiscovery(scene, place.id);
            dialog('discovery-dialog').close();
            status(`Added ${place.title} to your discovery journal.`);
          }),
        );
        return node;
      }),
    );
    if (!visible.length)
      empty(target, 'No places match this view. Choose another journal filter or date.');
    await records.recordVisit(scene, view.cursorDate);
  };
  select('discovery-filter').addEventListener('change', () => action(refresh), { signal });
  return { refresh };
}
