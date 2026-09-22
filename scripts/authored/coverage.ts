import { ASSET_CATALOG } from '../../src/themes/terrain/assets/catalog.js';
import { EPIC_CATALOG } from '../../src/themes/terrain/epics/catalog.js';
import { createTourAsset } from '../../src/tour/assets/catalog.js';
import { wildlifeSpecies } from '../../src/tour/wildlife/catalog.js';
import type { AuthoredMapping } from '../../src/tour/authored/types.js';
import type { TourPlacement } from '../../src/tour/types.js';
import { AuthoredInventoryError, type InventoryModel } from './inventory.js';
import { hybridReason, reviewedRetainedReason } from './coverage-reasons.js';

const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
const VARIANTS = [0, 1, 2] as const;
const PROCEDURAL_REASONS: Readonly<Record<string, string>> = {
  waves: 'Water ripples follow the generated shoreline and shared animation clock.',
  smoke: 'Smoke remains an ambient effect tied to the generated village.',
  fireflies: 'Fireflies remain luminous seasonal particles rather than opaque static models.',
  cherryPetals: 'Petals preserve the seasonal decorative effect.',
  fallenLeaves: 'Ground leaves retain their seasonal scatter and color.',
  leafSwirl: 'Swirling leaves preserve the seasonal decorative effect.',
  rainPuddle: 'The wet surface retains its local ground placement and material.',
  puddle: 'The wet surface retains its local ground placement and material.',
  frozenPond: 'Ice and its surrounding bank preserve the frozen-water identity.',
  icicle: 'Icicles retain their winter placement and ice material.',
  snowdrift: 'Snow banks remain fitted to the generated ground.',
  canal: 'The canal retains its water surface and architectural banks.',
  swimmingPool: 'The pool retains its water surface and rim.',
  ricePaddy: 'Terraced rice beds retain their irrigation water, shoots and field borders.',
  riceTerrace: 'Korean rice terraces retain their irrigation water, shoots and field borders.',
  kimchiGarden: 'Cabbage and radish beds retain their Korean household-garden identity.',
  jangseung:
    'The carved Korean village guardians retain their distinctive faces and paired composition.',
  sotdae: 'The Korean bird-topped village poles retain their distinctive form and symbolism.',
  onggi: 'Korean fermentation jars retain their rounded glazed forms and raised storage platform.',
};

export type CoverageEntry = {
  readonly id: string;
  readonly label: string;
  readonly kind: 'ordinary' | 'wonder';
  readonly status: 'authored' | 'hybrid' | 'retained';
  readonly reason: string;
  readonly models: readonly { readonly file: string; readonly node?: string }[];
};

export const GENERATED_COVERAGE = [
  {
    id: 'terrain',
    status: 'retained',
    reason:
      'Contribution dates, land edges, elevation and snow are generated from the Calendar data.',
  },
  {
    id: 'water',
    status: 'retained',
    reason:
      'Water surfaces, waterfalls and ripples retain the generated shoreline and animated flow.',
  },
  {
    id: 'grass',
    status: 'retained',
    reason:
      'Instanced tapered grass follows ground cells, animal clearings and the coherent wind field.',
  },
  {
    id: 'particles',
    status: 'retained',
    reason: 'Petals, fireflies and seasonal particles remain animated effects.',
  },
  {
    id: 'paths',
    status: 'retained',
    reason:
      'Path pieces follow the dated neighborhood routes and preserve safe walking over water.',
  },
  {
    id: 'shore-pebbles',
    status: 'retained',
    reason:
      'Small instanced stones follow each generated shoreline; they are separate from authored catalog rocks.',
  },
  {
    id: 'meadow-flowers',
    status: 'retained',
    reason:
      'Small generated flower accents share the grass distribution and wind; catalog flower assets are audited separately.',
  },
] as const;

function placement(
  id: string,
  variant: number,
  season: TourPlacement['season'],
  kind: TourPlacement['kind'],
): TourPlacement {
  return {
    kind,
    season,
    position: { x: 0, y: 0, z: 0 },
    source: {
      id: `coverage:${id}`,
      catalogId: id,
      anchorDate: '2026-06-01',
      week: 0,
      day: 0,
      cx: 0,
      cy: 0,
      footprint: { x: 0, y: 0, width: 1, height: 1 },
      drawOrder: 0,
      variant,
      animated: false,
    },
  };
}

export function createCoverage(mapping: AuthoredMapping) {
  const entries: CoverageEntry[] = [...ASSET_CATALOG, ...EPIC_CATALOG].map((catalog) => {
    const kind = catalog.style === 'wonder' ? 'wonder' : 'ordinary';
    const animal = wildlifeSpecies(catalog.id);
    if (animal)
      return {
        id: catalog.id,
        label: catalog.displayName,
        kind,
        status: 'authored',
        reason:
          'Uses a licensed external animal model; species scale, dated identity and any flock or school composition are applied by the tour.',
        models: [{ file: `${animal}.glb` }],
      };
    const definitions = SEASONS.flatMap((season) =>
      VARIANTS.map((variant) =>
        mapping(
          placement(catalog.id, variant, season, kind === 'wonder' ? 'wonder' : 'asset'),
          createTourAsset(catalog.id, variant, season),
        ),
      ),
    );
    const models = new Map<string, { readonly file: string; readonly node?: string }>();
    for (const definition of definitions)
      for (const part of definition?.parts ?? [])
        models.set(`${part.file}:${part.node ?? ''}`, {
          file: part.file,
          ...(part.node ? { node: part.node } : {}),
        });
    const status =
      models.size === 0
        ? 'retained'
        : definitions.some((definition) => !definition || definition.retainedParts.length > 0)
          ? 'hybrid'
          : 'authored';
    const retained =
      PROCEDURAL_REASONS[catalog.id] ?? reviewedRetainedReason(catalog.id, catalog.displayName);
    const reason =
      status === 'retained'
        ? retained
        : status === 'hybrid'
          ? hybridReason(catalog.id)
          : 'The procedural model is replaced by licensed external geometry with dated placement and seasonal variants preserved.';
    return {
      id: catalog.id,
      label: catalog.displayName,
      kind,
      status,
      reason,
      models: [...models.values()],
    };
  });
  return {
    version: 1 as const,
    testedSeasons: SEASONS,
    testedVariants: VARIANTS,
    catalog: entries,
    generated: GENERATED_COVERAGE,
  };
}

export type CoverageReport = ReturnType<typeof createCoverage>;

export function verifyCoverage(report: CoverageReport, models: readonly InventoryModel[]): void {
  if (
    report.catalog.length !== 240 ||
    new Set(report.catalog.map((entry) => entry.id)).size !== 240
  )
    throw new AuthoredInventoryError(
      'coverage.json',
      'Expected all 210 ordinary and 30 Wonder IDs exactly once',
    );
  for (const entry of report.catalog) {
    for (const reference of entry.models) {
      if (!models.some((model) => model.relativeFile === reference.file))
        throw new AuthoredInventoryError(entry.id, `No provenance manifest for ${reference.file}`);
    }
  }
}

export function coverageMarkdown(report: CoverageReport): string {
  const counts = ['authored', 'hybrid', 'retained']
    .map(
      (status) => `${report.catalog.filter((entry) => entry.status === status).length} ${status}`,
    )
    .join(' · ');
  const rows = report.catalog.map(
    (entry) =>
      `| ${entry.id} | ${entry.kind} | ${entry.status} | ${entry.models.map((model) => `${model.file}${model.node ? `#${model.node}` : ''}`).join(', ') || '—'} | ${entry.reason} |`,
  );
  return `# Tour asset coverage\n\n${counts}. All 210 ordinary IDs and 30 Wonders are audited across three variants and four seasons. Authored means external geometry; hybrid retains original components; retained means the existing design or generated effect remains. This ledger describes the 3D tour only. Calendar SVG artwork is unchanged.\n\n| Catalog ID | Kind | Status | External models | Reason |\n| --- | --- | --- | --- | --- |\n${rows.join('\n')}\n\n## Generated scenery\n\n${report.generated.map((entry) => `- **${entry.id}** (${entry.status}): ${entry.reason}`).join('\n')}\n`;
}
