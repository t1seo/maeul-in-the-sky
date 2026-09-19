export type PublicReleaseRecord = {
  readonly id: string;
  readonly tag: string;
  readonly name?: string;
  readonly url: string;
  readonly publishedAt: string;
};

export type PublicRepoRecord = {
  readonly id: string;
  readonly fullName: string;
  readonly url: string;
  readonly description: string | null;
  readonly primaryLanguage?: string | null;
  readonly createdAt: string;
  readonly visibility: 'public';
  readonly stars?: number;
  readonly releases: readonly PublicReleaseRecord[];
  readonly retrievedAt: string;
  readonly coverage: {
    readonly complete: boolean;
    readonly truncatedReason?: string;
  };
};
