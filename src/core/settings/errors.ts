export type ValidationIssue = {
  readonly path: string;
  readonly message: string;
};

export class InputValidationError extends Error {
  readonly name = 'InputValidationError';
  readonly code = 'INVALID_INPUT';

  constructor(readonly issues: readonly ValidationIssue[]) {
    super(issues.map((issue) => `${issue.path}: ${issue.message}`).join('; '));
  }
}
