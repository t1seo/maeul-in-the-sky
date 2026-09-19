import type { WorldInput } from '../../../src/world/model/types.js';
import { inputFor, sequence } from './helpers.js';

export function circleInput(input = inputFor(sequence('2024-01-01', 366, 25))): WorldInput {
  return { ...input, settings: { ...input.settings, layout: 'seasonal-circle' } };
}
