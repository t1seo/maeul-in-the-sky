export type ActivityMonth = {
  readonly month: string;
  readonly from: string;
  readonly to: string;
  readonly commits: number;
  readonly pullRequests: number;
  readonly issues: number;
  readonly reviews: number;
  readonly repositories: number;
  readonly restricted: number;
};

export type ActivityBreakdown = {
  readonly source: 'github-contributions';
  readonly from: string;
  readonly to: string;
  readonly months: readonly ActivityMonth[];
};
