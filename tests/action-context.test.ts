import { describe, expect, it } from 'vitest';

import { resolveActionUsername } from '../src/action-context.js';

describe('resolveActionUsername', () => {
  it('prefers an explicit username', () => {
    expect(resolveActionUsername('chosen-user', 'repository-owner', 'workflow-actor')).toBe(
      'chosen-user',
    );
  });

  it('uses the repository owner before the workflow actor', () => {
    expect(resolveActionUsername('', 'repository-owner', 'workflow-actor')).toBe(
      'repository-owner',
    );
  });

  it('keeps the actor as a fallback outside a repository context', () => {
    expect(resolveActionUsername('', undefined, 'workflow-actor')).toBe('workflow-actor');
  });
});
