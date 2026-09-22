export type GroundPoint = { readonly x: number; readonly z: number };
export type GroundCollider = GroundPoint & { readonly halfX: number; readonly halfZ: number };
type GroundCell = GroundPoint & { readonly surface: string };

function segmentDistance(point: GroundPoint, a: GroundPoint, b: GroundPoint): number {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const length = dx * dx + dz * dz;
  const t =
    length === 0
      ? 0
      : Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.z - a.z) * dz) / length));
  return Math.hypot(point.x - a.x - t * dx, point.z - a.z - t * dz);
}

export function createGround(
  cells: readonly GroundCell[],
  paths: readonly (readonly GroundPoint[])[],
  colliders: readonly GroundCollider[],
) {
  const tiles = new Map(
    cells.map((cell) => [`${Math.round(cell.x / 4)},${Math.round(cell.z / 4)}`, cell]),
  );
  const onGround = (point: GroundPoint): boolean => {
    const cell = tiles.get(`${Math.floor((point.x + 2) / 4)},${Math.floor((point.z + 2) / 4)}`);
    if (!cell) return false;
    if (cell.surface !== 'water') return true;
    return paths.some((path) =>
      path.some((end, i) => i > 0 && segmentDistance(point, path[i - 1], end) < 0.58),
    );
  };
  const canStand = (point: GroundPoint): boolean =>
    [
      [0, 0],
      [-0.22, 0],
      [0.22, 0],
      [0, -0.22],
      [0, 0.22],
    ].every(([x, z]) => onGround({ x: point.x + x, z: point.z + z })) &&
    !colliders.some(
      (box) =>
        Math.abs(point.x - box.x) < box.halfX + 0.22 &&
        Math.abs(point.z - box.z) < box.halfZ + 0.22,
    );
  const nearest = (point: GroundPoint): GroundPoint | null => {
    if (canStand(point)) return point;
    const ordered = [...cells].sort(
      (a, b) => Math.hypot(a.x - point.x, a.z - point.z) - Math.hypot(b.x - point.x, b.z - point.z),
    );
    for (const cell of ordered) {
      for (const [x, z] of [
        [0, 0],
        [1.4, 1.4],
        [-1.4, 1.4],
        [1.4, -1.4],
        [-1.4, -1.4],
        [0, 1.4],
        [1.4, 0],
      ]) {
        const candidate = { x: cell.x + x, z: cell.z + z };
        if (canStand(candidate)) return candidate;
      }
    }
    return null;
  };
  const move = (start: GroundPoint, delta: GroundPoint): GroundPoint => {
    let point = start;
    const steps = Math.max(1, Math.ceil(Math.hypot(delta.x, delta.z) / 0.12));
    for (let step = 0; step < Math.min(steps, 1000); step++) {
      const x = { x: point.x + delta.x / steps, z: point.z };
      if (canStand(x)) point = x;
      const z = { x: point.x, z: point.z + delta.z / steps };
      if (canStand(z)) point = z;
    }
    return point;
  };
  return { canStand, nearest, move };
}

export type TourGround = ReturnType<typeof createGround>;
