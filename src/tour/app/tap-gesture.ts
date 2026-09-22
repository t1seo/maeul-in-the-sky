type TapPoint = { readonly id: number; readonly x: number; readonly y: number };

export function createTapGesture() {
  let active: TapPoint | null = null;
  let distance = 0;
  const cancel = (): void => {
    active = null;
    distance = 0;
  };
  const move = (point: TapPoint): void => {
    if (active?.id !== point.id) return;
    distance += Math.hypot(point.x - active.x, point.y - active.y);
    active = point;
  };
  return {
    start: (point: TapPoint): void => {
      if (active) {
        cancel();
        return;
      }
      active = point;
      distance = 0;
    },
    move,
    finish: (point: TapPoint): boolean => {
      if (active?.id !== point.id) return false;
      move(point);
      const isTap = distance <= 6;
      cancel();
      return isTap;
    },
    cancel,
  };
}

export function pointerPoint(event: PointerEvent): TapPoint {
  return { id: event.pointerId, x: event.clientX, y: event.clientY };
}
