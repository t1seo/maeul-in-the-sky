import type { SnapshotV1 } from '../../core/snapshot-types.js';
import { serializeSnapshot } from '../../core/settings/serialize.js';
import { html, select } from './dom.js';

export function setupVersionSelection(
  currentSnapshot: () => SnapshotV1,
  signal: AbortSignal,
  navigate: (url: string) => void = (url) => window.location.assign(url),
): void {
  const picker = select('world-version');
  const message = html('world-version-status');
  const reset = (): void => {
    picker.value = 'world';
    message.hidden = true;
    message.textContent = '';
  };
  const fail = (reason: string): void => {
    message.hidden = false;
    message.textContent = `${reason} 지금 세계는 그대로 유지됩니다.`;
  };
  reset();
  picker.addEventListener(
    'change',
    () => {
      const version = picker.value;
      reset();
      if (version === 'world') return;
      if (version !== 'current' && version !== 'classic') {
        fail('보기 버전을 다시 선택해 주세요.');
        return;
      }
      let serialized: string;
      try {
        serialized = serializeSnapshot(currentSnapshot());
      } catch {
        fail('기여 기록을 전달할 수 없습니다. 올바른 기록을 가져온 뒤 다시 선택해 주세요.');
        return;
      }
      try {
        window.sessionStorage.setItem('maeul-demo-transfer', serialized);
        navigate(`../?renderer=${version}`);
      } catch {
        fail('SVG 버전을 열지 못했습니다. 브라우저 저장 공간을 확인한 뒤 다시 선택해 주세요.');
      }
    },
    { signal },
  );
}
