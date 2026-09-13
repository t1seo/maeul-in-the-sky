import { escapeMarkup } from './markup.js';
import { paddedViewBox, serializeViewBox } from './render.js';
import type { CatalogFamilyCounts, CatalogRecord } from './types.js';

function cardMarkup(record: CatalogRecord): string {
  const key = `${record.kind}-${record.id}`;
  const titleId = `title-${key}`;
  const descriptionId = `description-${key}`;
  const viewBox = serializeViewBox(paddedViewBox(record.bounds));
  return `<article class="catalog-card" data-catalog-card data-catalog-id="${escapeMarkup(record.id)}" data-key="${escapeMarkup(key)}" data-family="${record.family}" data-style="${record.style}" data-season="${record.season}" data-search="${escapeMarkup([record.id, record.displayName, record.description, record.family, record.style, record.season, record.category].join(' ').toLocaleLowerCase('en-US'))}" aria-labelledby="${titleId}" aria-describedby="${descriptionId}">
  <div class="art-frame"><svg class="catalog-art" viewBox="${viewBox}" role="img" aria-label="${escapeMarkup(record.displayName)} preview"><use href="catalog-sprite-dark.svg#${escapeMarkup(key)}"></use></svg></div>
  <div class="card-copy"><p class="eyebrow">${record.family} · ${record.season}</p><h2 id="${titleId}">${escapeMarkup(record.displayName)}</h2><code>${escapeMarkup(record.id)}</code><p id="${descriptionId}">${escapeMarkup(record.description)}</p></div>
</article>`;
}

export function renderCatalogPage(
  records: readonly CatalogRecord[],
  familyCounts: CatalogFamilyCounts,
): string {
  const ordinaryCount = records.filter((record) => record.kind === 'asset').length;
  const wonderCount = records.filter((record) => record.kind === 'wonder').length;
  const cards = records.map(cardMarkup).join('\n');
  return `<!doctype html>
<html lang="en" data-mode="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Browse every original Maeul in the Sky asset and Wonder.">
  <title>Asset atlas · Maeul in the Sky</title>
  <link rel="stylesheet" href="catalog.css">
  <script src="catalog.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#catalog-grid">Skip to catalog</a>
  <header class="masthead">
    <a class="back-link" href="../">← Demo</a>
    <p class="kicker">Maeul field guide · registry edition</p>
    <h1>Every small thing<br>in the sky.</h1>
    <p class="lede">Explore the original trees, buildings, and landmarks that bring each village to life. Find a favorite by season, style, or name.</p>
    <dl class="totals" aria-label="Registry totals"><div><dt>Ordinary</dt><dd><strong>${ordinaryCount}</strong></dd></div><div><dt>Wonders</dt><dd><strong>${wonderCount}</strong></dd></div><div><dt>Korean originals</dt><dd><strong>${familyCounts.korean}</strong></dd></div></dl>
  </header>
  <main>
    <form class="catalog-controls" id="catalog-controls" role="search">
      <div class="control"><label for="search-filter">Find an asset</label><input id="search-filter" type="search" autocomplete="off" placeholder="Try hanok or forest"></div>
      <div class="control"><label for="season-filter">Season</label><select id="season-filter"><option value="all">All seasons</option><option value="winter">Winter</option><option value="spring">Spring</option><option value="summer">Summer</option><option value="autumn">Autumn</option></select></div>
      <div class="control"><label for="family-filter">Family</label><select id="family-filter"><option value="all">All families</option><option value="nature">Nature (${familyCounts.nature})</option><option value="building">Buildings (${familyCounts.building})</option><option value="decoration">Decorations (${familyCounts.decoration})</option><option value="wonder">Wonders (${familyCounts.wonder})</option><option value="korean">Korean (${familyCounts.korean})</option></select></div>
      <div class="control"><label for="style-filter">Style</label><select id="style-filter"><option value="all">All styles</option><option value="classic">Classic</option><option value="korean">Korean</option><option value="wonder">Wonder</option></select></div>
      <fieldset class="mode-switch"><legend>Lighting</legend><button type="button" data-mode="dark" aria-pressed="true">Dark</button><button type="button" data-mode="light" aria-pressed="false">Light</button></fieldset>
    </form>
    <div class="result-line"><p id="result-count" role="status" aria-live="polite">Showing ${records.length} of ${records.length} entries</p><p>Season filters include year-round assets.</p></div>
    <section class="catalog-grid" id="catalog-grid" aria-label="Asset catalog">${cards}</section>
    <section class="empty-state" id="empty-state" hidden aria-live="polite"><p class="empty-mark" aria-hidden="true">∅</p><h2>No catalog entries match</h2><p>That combination has no registered artwork. Clear the filters to return to the full village.</p><button type="button" id="clear-filters">Clear filters</button></section>
  </main>
  <footer><p>Generated from the same typed registries used by Maeul in the Sky.</p><a href="catalog.json">Download catalog JSON</a></footer>
</body>
</html>
`;
}
