import type { WorldDocumentV1 } from './types.js';
import { parseWorldSourceUrl } from './urls.js';

export type WorldVisit = {
  readonly home: WorldDocumentV1;
  readonly document: WorldDocumentV1;
  readonly publicSourceUrl?: string;
};

export function beginVisit(
  home: WorldDocumentV1,
  document: WorldDocumentV1,
  publicSourceUrl?: string,
): WorldVisit {
  return {
    home,
    document,
    ...(publicSourceUrl === undefined
      ? {}
      : { publicSourceUrl: parseWorldSourceUrl(publicSourceUrl) }),
  };
}

export function returnFromVisit(visit: WorldVisit): WorldDocumentV1 {
  return visit.home;
}
