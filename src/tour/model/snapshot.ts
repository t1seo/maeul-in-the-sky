import { parseSnapshot, snapshotToContributionData } from '../../core/settings/parse.js';
import { prepareTerrainScene } from '../../themes/terrain/scene/prepare.js';
import type { TourModel } from '../types.js';
import { buildTourModel } from './build.js';
import { assertTourDates } from './capacity.js';

export function parseTourSnapshot(value: unknown): TourModel {
  const snapshot = parseSnapshot(value);
  assertTourDates(snapshot.weeks.flatMap((week) => week.days.map((day) => day.date)));
  return buildTourModel(
    prepareTerrainScene(snapshotToContributionData(snapshot), snapshot.settings),
  );
}
