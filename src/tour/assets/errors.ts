export class TourAssetError extends Error {
  override readonly name = 'TourAssetError';

  constructor(
    readonly reason: 'unknown-catalog-id' | 'invalid-variant' | 'empty-recipe',
    readonly catalogId: string,
    readonly variant: number,
  ) {
    super(`Cannot construct tour asset ${catalogId}: ${reason} (${variant})`);
  }
}
