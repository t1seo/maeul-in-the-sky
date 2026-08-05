export function resolveActionUsername(
  input: string,
  repositoryOwner: string | undefined,
  actor: string | undefined,
): string {
  return input.trim() || repositoryOwner?.trim() || actor?.trim() || '';
}
