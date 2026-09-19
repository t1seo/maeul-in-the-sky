import { expect, it } from 'vitest';
import { createActivityRequest } from '../../src/api/activity.js';

it.each([
  ['reversed', '2024-02-01T00:00:00Z', '2024-01-01T00:00:00Z'],
  ['fourteen months', '2024-01-01T00:00:00Z', '2025-02-01T00:00:00Z'],
  ['impossible date', '2024-02-30T00:00:00Z', '2024-03-01T00:00:00Z'],
  ['non-UTC date', '2024-01-01T00:00:00+09:00', '2024-02-01T00:00:00Z'],
  ['unsupported year', '0000-01-01T00:00:00Z', '0000-12-31T00:00:00Z'],
  ['excess precision', '2024-01-01T00:00:00.0001Z', '2024-02-01T00:00:00Z'],
])('bounds %s ranges before constructing a GraphQL request', (_name, from, to) => {
  // Given an invalid or excessive range.
  // When / Then no unbounded or malformed query can be built.
  expect(() => createActivityRequest(from, to)).toThrow('Invalid GitHub API request configuration');
});

it.each(['0001', '0099', '9999'])('constructs year %s months without a 1900 offset', (year) => {
  // Given a supported year including the historical JavaScript constructor edge.
  // When UTC month intersections are constructed.
  const request = createActivityRequest(`${year}-01-01T00:00:00Z`, `${year}-12-31T23:59:59.999Z`);
  // Then every bounded month retains its original year, including December's endpoint.
  expect(request.months).toHaveLength(12);
  expect(request.months.every((month) => month.month.startsWith(year))).toBe(true);
  expect(request.months.at(-1)?.to).toBe(`${year}-12-31T23:59:59.999Z`);
});
