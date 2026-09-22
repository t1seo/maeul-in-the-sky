const REVIEWED = [
  {
    ids: ['bambooThicket'],
    reason:
      'The reviewed external bamboo has cut stems without branches or leaves; the existing leafy thicket preserves the recognizable plant form.',
  },
  {
    ids: ['robinBird'],
    reason:
      'The reviewed external robin models did not provide a clear visual improvement over the existing recognizable bird; the original model is retained.',
  },
  {
    ids: ['hut', 'choga'],
    reason:
      'The researched Korean thatched model is an open shed, not a choga dwelling; the existing house silhouette is retained.',
  },
  {
    ids: ['pavilion', 'shrine', 'watermill', 'koreanWatermill'],
    reason:
      'The selected licensed collections have no suitable Korean pavilion or watermill equivalent; the existing architectural identity is retained.',
  },
  {
    ids: ['hanokEstate', 'manor'],
    reason:
      'The researched side-wing roof has visible defects, and a single main house cannot preserve the estate courtyard composition.',
  },
  {
    ids: ['library', 'clocktower', 'cathedral', 'bakery'],
    reason:
      'Selected finished buildings lack the defining library, clock, cathedral or bakery features; an unrelated house is not substituted.',
  },
  {
    ids: ['churchWinter'],
    reason:
      'The selected church has a shared texture atlas without a separate roof material; the original correctly fitted snow treatment is retained.',
  },
  {
    ids: ['hayMaze'],
    reason: 'A single external hay bale would not preserve the maze composition.',
  },
  {
    ids: ['eiffelTower'],
    reason:
      'The verified candidate remains about 2.4 MiB and 48,000 triangles after safe simplification; the existing landmark is retained within the selected model budget.',
  },
  {
    ids: ['log', 'woodpile', 'driftwood', 'firewood', 'stump', 'signpost', 'dock', 'bridge'],
    reason:
      'The reviewed Kenney kit has no suitable finished equivalent; assembling generic planks would not establish a better complete model.',
  },
] as const;

const REASONS: Readonly<Record<string, string | undefined>> = Object.fromEntries(
  REVIEWED.flatMap((entry) => entry.ids.map((id) => [id, entry.reason])),
);

export function reviewedRetainedReason(id: string, label: string): string {
  return (
    REASONS[id] ??
    `No suitable semantic match for ${label} was selected from the audited licensed collections; the existing design is retained.`
  );
}

export function hybridReason(id: string): string {
  if (['houseWinter', 'houseBWinter', 'barnWinter'].includes(id))
    return 'An external building supplies the structure while original winter details preserve the snowy variant.';
  if (id === 'campfire' || id === 'torch')
    return 'An external holder or fire pit is combined with the original luminous flame details.';
  if (id === 'iceCreamCart')
    return 'An external vendor cart is combined with the original ice-cream display so the catalog identity remains visible.';
  if (id === 'fountain' || id === 'frozenFountain')
    return 'An external fountain is combined with fitted water or ice surfaces and the appropriate seasonal flow details.';
  if (
    [
      'appleTree',
      'oliveTree',
      'lemonTree',
      'orangeTree',
      'pearTree',
      'peachTree',
      'berryBush',
      'orchard',
    ].includes(id)
  )
    return 'External trees or bushes replace the vegetation while original fruit and field details retain the productive-garden identity.';
  if (['tidePools', 'lotusPond', 'frozenPond', 'willowPond'].includes(id))
    return 'External rocks replace selected banks while the original water or ice, flowers and remaining pond vegetation stay in place.';
  if (['rock', 'boulder', 'snowCoveredRock', 'alpineRocks'].includes(id))
    return 'External rock geometry is combined with original ground, snow or vegetation details where the variant needs them.';
  if (['wildflowerPatch', 'wildflowerMeadow', 'flowerBed', 'park'].includes(id))
    return 'External flowers and grass replace the planting while the original fitted meadow ground remains.';
  return 'Licensed external models replace selected forms; original components preserve the specific composite identity and its seasonal details.';
}
