import { afterEach, expect, test } from 'vitest';
import { showDay } from '../../../src/demo/day-details.js';
import { prepareTerrainScene } from '../../../src/themes/terrain/scene/prepare.js';
import { terrainMetadata } from '../../../src/themes/terrain/scene/metadata.js';
import { calendarFixture } from '../../themes/terrain/scene/fixtures.js';

afterEach(() => {
  document.body.replaceChildren();
});

test('shows supplied activity when inspecting a date and clears it for legacy metadata', () => {
  // Given: the demo reuses one detail element across current and old prepared data.
  const scene = prepareTerrainScene(calendarFixture('2025-03-10', 12, 1));
  const metadata = terrainMetadata(scene);
  const cell = metadata.cells.find((cell) => cell.date === scene.toDate);
  expect(cell).toBeDefined();
  if (!cell) return;
  const target = document.createElement('output');
  document.body.append(target);
  // When: the demo selects a day with twelve observed positive dates.
  showDay(target, cell, metadata);
  // Then: the visible explanation and data fields expose the actual level and source history.
  expect(target.textContent).toContain(
    'Consistency 2/3 (12 active days in trailing 28 days; 12 supplied)',
  );
  expect(target.dataset.consistencyTier).toBe('2');
  expect(target.dataset.consistencyActiveDays).toBe('12');
  expect(target.dataset.consistencyObservedDays).toBe('12');
  const { consistency: _consistency, rewardTier: _reward, ...legacy } = cell;
  showDay(target, legacy, metadata);
  expect(target.textContent).not.toContain('Consistency');
  expect(target.dataset.consistencyTier).toBeUndefined();
  expect(target.dataset.consistencyActiveDays).toBeUndefined();
  expect(target.dataset.consistencyObservedDays).toBeUndefined();
});
