import { describe, expect, it } from 'vitest';
import { buildWorld, defaultWorldView, frameWorld } from '../../../src/world/model/index.js';
import { inputFor, sequence } from './helpers.js';

describe('dated rewards and festivals', () => {
  it.each([
    [4, 5, 1],
    [11, 12, 2],
    [19, 20, 3],
  ])('crosses %i to %i active days at tier %i on that day only', (before, after, tier) => {
    const scene = buildWorld(inputFor(sequence('2024-03-01', after, 1)));
    const startsOn = `2024-03-${String(after).padStart(2, '0')}`;
    const prior = `2024-03-${String(before).padStart(2, '0')}`;
    const view = defaultWorldView(scene);
    expect(scene.days.find((day) => day.date === startsOn)).toMatchObject({
      consistency: { tier, activeDays: after, complete: false },
    });
    const events = scene.events.filter(
      (event) => event.evidence.kind === 'consistency' && event.evidence.activeDays === after,
    );
    expect(events).toHaveLength(1);
    expect(events[0]?.startsOn).toBe(startsOn);
    expect(frameWorld(scene, { ...view, cursorDate: prior }).events).not.toContainEqual(events[0]);
    expect(frameWorld(scene, { ...view, cursorDate: startsOn }).events).toContainEqual(events[0]);
  });

  it('uses 28 calendar days and reports missing coverage instead of counting missing activity', () => {
    const input = inputFor([...sequence('2024-03-01', 4), ['2024-03-29', 1]], 2024);
    const scene = buildWorld(input);
    expect(scene.days.find((day) => day.date === '2024-03-29')).toMatchObject({
      consistency: { activeDays: 4, observedDays: 4, tier: 0, complete: false },
    });
  });

  it('counts prior context in consistency but never in world statistics', () => {
    const input = inputFor([['2024-03-01', 2]], 2024, { from: '2024-03-01', to: '2024-03-31' });
    const contextDays = sequence('2024-02-26', 4).map(([date, count]) => ({
      date,
      count,
      level: 0 as const,
    }));
    const scene = buildWorld({ ...input, contextDays });
    expect(scene.days[0]).toMatchObject({ consistency: { activeDays: 5, tier: 1 } });
    expect(frameWorld(scene, defaultWorldView(scene)).stats).toMatchObject({
      totalContributions: 2,
      observedDays: 1,
    });
  });

  it('retains earned settlement after rest and gates discoveries with their source date', () => {
    const scene = buildWorld(inputFor([...sequence('2024-03-01', 20, 50), ['2024-03-21', 0]]));
    const before = frameWorld(scene, { ...defaultWorldView(scene), cursorDate: '2024-03-20' });
    const after = frameWorld(scene, { ...defaultWorldView(scene), cursorDate: '2024-03-21' });
    expect(after.entities).toEqual(before.entities);
    expect(before.discoveries.every((discovery) => discovery.availableFrom <= '2024-03-20')).toBe(
      true,
    );
    expect(before.entities.some((entity) => entity.kind === 'wonder')).toBe(true);
  });

  it('uses publication dates for repository release memorials without invented contribution attribution', () => {
    const input = inputFor([['2024-05-01', 2]]);
    const scene = buildWorld({
      ...input,
      repositories: [
        {
          id: '123',
          fullName: 'village/project',
          url: 'https://github.com/village/project',
          description: 'A public project',
          createdAt: '2024-01-01T00:00:00Z',
          retrievedAt: '2024-12-31T00:00:00Z',
          visibility: 'public',
          coverage: { complete: true },
          releases: [
            {
              id: '789',
              tag: 'v1',
              url: 'https://github.com/village/project/releases/tag/v1',
              publishedAt: '2024-05-02T12:00:00Z',
            },
          ],
        },
      ],
    });
    const view = defaultWorldView(scene);
    expect(
      frameWorld(scene, { ...view, cursorDate: '2024-05-01' }).entities.some(
        (entity) => entity.kind === 'release',
      ),
    ).toBe(false);
    expect(
      frameWorld(scene, { ...view, cursorDate: '2024-05-02' }).entities.find(
        (entity) => entity.kind === 'release',
      ),
    ).toMatchObject({ repoId: '123', releaseId: '789', visibleFrom: '2024-05-02' });
    expect(frameWorld(scene, view).stats.totalContributions).toBe(2);
  });

  it('shifts calendar seasons in the south while override remains presentation only', () => {
    const input = inputFor(sequence('2024-03-01', 5));
    const north = buildWorld(input);
    const south = buildWorld({ ...input, settings: { ...input.settings, hemisphere: 'south' } });
    const view = { ...defaultWorldView(north), cursorDate: '2024-03-05' };
    expect(frameWorld(north, view).season).toBe('spring');
    expect(frameWorld(south, view).season).toBe('autumn');
    expect(frameWorld(north, { ...view, seasonOverride: 'winter' }).season).toBe('winter');
    expect(north.events.find((event) => event.evidence.kind === 'consistency')?.kind).toBe(
      'blossoms',
    );
    expect(south.events.find((event) => event.evidence.kind === 'consistency')?.kind).toBe(
      'harvest',
    );
  });
});
