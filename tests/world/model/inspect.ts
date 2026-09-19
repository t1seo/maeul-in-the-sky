import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { deepStrictEqual } from 'node:assert';
import {
  buildWorld,
  defaultWorldView,
  frameWorld,
  parseWorldScene,
} from '../../../src/world/model/index.js';
import { inputFor, sequence } from './helpers.js';

const directory = '.orca/world-expansion/evidence/model';
await mkdir(directory, { recursive: true });
const rows = [];
for (const layout of ['archipelago', 'island'] as const) {
  const records = sequence('2024-09-19', 366).map(
    ([date], index) => [date, [0, 1, 5, 10, 25, 50][index % 6]] as const,
  );
  const input = inputFor(records, 2025);
  const scene = buildWorld({ ...input, settings: { ...input.settings, layout } });
  const json = JSON.stringify(scene);
  const path = `${directory}/${layout}-rolling-scene.json`;
  await writeFile(path, json);
  const unknownScene: unknown = JSON.parse(await readFile(path, 'utf8'));
  const restored = parseWorldScene(unknownScene);
  deepStrictEqual(restored, scene);
  const view = { ...defaultWorldView(restored), cursorDate: '2025-03-15', elapsedSeconds: 48.25 };
  const frame = frameWorld(restored, view);
  deepStrictEqual(frame.actors, frameWorld(restored, { ...view, motion: 'off' }).actors);
  rows.push({
    layout,
    bytes: Buffer.byteLength(json),
    months: new Set(scene.days.map((day) => day.monthKey)).size,
    observedDays: scene.days.filter((day) => day.kind === 'observed').length,
    tiles: scene.terrain.tiles.length,
    entities: scene.entities.length,
    recipes: scene.modelRecipes.length,
    routes: scene.routes.length,
    actors: scene.actors.length,
    cutoff: view.cursorDate,
    stats: frame.stats,
    roundtrip: true,
  });
}
await writeFile(`${directory}/serialized-inspection.json`, `${JSON.stringify(rows, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
