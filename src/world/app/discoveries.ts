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
      `${available.length}개의 장소 중 ${available.filter((place) => seen.has(place.id)).length}곳을 찾았습니다.${fresh.length ? ` 지난 방문 뒤 ${fresh.length}개의 새 장소가 생겼어요.` : ' 장소를 찾아가면 나의 발견 기록에 남습니다.'}`;
    const target = html('discovery-list');
    target.replaceChildren(
      ...visible.map((place) => {
        const node = card(place.title, place.description);
        node.append(
          text(
            'small',
            `${place.availableFrom} · ${seen.has(place.id) ? '찾아간 장소' : '아직 만나지 않은 풍경'}`,
          ),
        );
        node.append(
          cardButton('이 장소 찾아가기', async () => {
            session.update({ selectedId: place.entityId });
            session.focus({ kind: 'entity', entityId: place.entityId });
            await records.markDiscovery(scene, place.id);
            dialog('discovery-dialog').close();
            status(`${place.title}을 발견 기록에 남겼습니다.`);
          }),
        );
        return node;
      }),
    );
    if (!visible.length)
      empty(target, '지금 조건에 맞는 장소가 없습니다. 다른 도감 보기나 날짜를 선택해 보세요.');
    await records.recordVisit(scene, view.cursorDate);
  };
  select('discovery-filter').addEventListener('change', () => action(refresh), { signal });
  return { refresh };
}
