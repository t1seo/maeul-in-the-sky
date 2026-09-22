import type { InventoryModel } from './inventory.js';

function escape(value: string): string {
  return value.replace(
    /[&<>"']/gu,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ??
      character,
  );
}

function title(model: InventoryModel): string {
  return (
    model.source.originalTitle ??
    (model.id === 'squirrel'
      ? 'Chipmunk'
      : model.id.replace(/[-_]/gu, ' ').replace(/^./u, (letter) => letter.toUpperCase()))
  );
}

function markdownText(value: string): string {
  return value.replace(/[[\]<>|]/gu, (character) => `\\${character}`).replace(/\r?\n/gu, ' ');
}

export function creditsMarkdown(models: readonly InventoryModel[]): string {
  const sections = models.map((model) => {
    const source = model.source;
    const names = model.nodes?.map((node) => markdownText(node.name)).join(', ');
    const evidence = source.licenseEvidence
      ? `${markdownText(source.licenseEvidence)}${source.licenseEvidenceUrl ? ` [License evidence](${source.licenseEvidenceUrl}).` : ''}\n\n`
      : '';
    return `## ${markdownText(title(model))}\n\n**${markdownText(source.creator)}** · [Original model](${source.modelUrl}) · [${source.license}](${source.licenseUrl}) · [Local license text](${model.relativeLicenseFile})\n\nTour file: [${model.relativeFile}](${model.relativeFile}). Provenance: [${model.manifest}](${model.manifest}).\n\n${names ? `Included models: ${names}.\n\n` : ''}${source.disclosure ? `${markdownText(source.disclosure)}\n\n` : ''}${evidence}Modifications by the Maeul in the Sky contributors:\n\n${model.modifications.map((change) => `- ${markdownText(change)}`).join('\n')}\n`;
  });
  return `# 3D asset credits\n\nThese models are redistributed with the Maeul in the Sky tour. Their Creative Commons licenses are separate from Maeul's software license. Original creators do not endorse this project. Exact original download URLs and SHA-256 digests are recorded in each linked provenance manifest.\n\n[Full catalog coverage](coverage.md) lists every authored, hybrid and retained tour asset, including generated scenery.\n\n${sections.join('\n')}\n## Historical source notices\n\nThe five original Quaternius Ultimate Animated Animals models retain the creator's historical [CC0 pack notice](licenses/Quaternius-ultimate-pack.txt). The [2018 farm pack publication](https://opengameart.org/content/lowpoly-animated-farm-animal-pack) also identifies its CC0 license. These historical files are not licensed under the terms of a different, newer pack.\n`;
}

function modelItem(model: InventoryModel): string {
  const source = model.source;
  return `<li id="model-${escape(model.key.replaceAll('/', '-'))}">
<strong>${escape(title(model))}</strong>
<span>By <a href="${escape(source.modelUrl)}" rel="noreferrer">${escape(source.creator)}</a> · <a href="${escape(source.licenseUrl)}" rel="noreferrer">${escape(source.license)}</a> · <a href="./models/${escape(model.relativeLicenseFile)}">License text</a></span>
<span>Tour model: ${escape(model.relativeFile)} · <a href="./models/${escape(model.manifest)}">Source and file checksums</a></span>
${model.nodes ? `<span>Included models: ${model.nodes.map((node) => escape(node.name)).join(', ')}</span>` : ''}
${source.disclosure ? `<p>${escape(source.disclosure)}</p>` : ''}
${source.licenseEvidence ? `<p>${escape(source.licenseEvidence)}${source.licenseEvidenceUrl ? ` <a href="${escape(source.licenseEvidenceUrl)}" rel="noreferrer">License evidence</a>` : ''}</p>` : ''}
<details><summary>Adaptations for the tour</summary><ul>${model.modifications.map((change) => `<li>${escape(change)}</li>`).join('')}</ul></details>
</li>`;
}

export function creditsHtml(models: readonly InventoryModel[]): string {
  const groups = [
    { directory: '', label: 'Wildlife' },
    { directory: 'nature/', label: 'Trees, plants and rocks' },
    { directory: 'village/', label: 'Village buildings, props and landmarks' },
  ] as const;
  const sections = groups.map(({ directory, label }, index) => {
    const selected = models.filter((model) =>
      directory ? model.relativeFile.startsWith(directory) : !model.relativeFile.includes('/'),
    );
    return `<section aria-labelledby="collection-${index}"><div class="section-heading"><h2 id="collection-${index}">${label}</h2></div><ul class="sources">${selected.map(modelItem).join('\n')}</ul></section>`;
  });
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#e8eddf" />
<meta name="description" content="Original creators, source models and open licenses used in Maeul's 3D village tour." />
<title>3D asset credits · Maeul</title>
<link rel="stylesheet" href="./credits.css" />
</head>
<body><main>
<a class="back-link" href="./"><span aria-hidden="true">←</span> Back to the village</a>
<header><p class="eyebrow">MAEUL · MODELS AND SOURCES</p><h1>3D asset credits</h1><p class="intro">The models used by the village tour, with their original creators and open licenses.</p><p><a href="./models/coverage.md">View the complete asset coverage</a> to see which models are external, combined with existing details, or retained.</p></header>
${sections.join('\n')}
<footer><p>The models retain their own licenses, separate from Maeul's software license. The original creators do not endorse this project. Model adaptations are by the Maeul in the Sky contributors.</p><nav aria-label="Full attribution and license files"><a href="./models/CREDITS.md">Full attribution</a><a href="./models/coverage.json">Catalog coverage data</a><a href="./models/licenses/Quaternius-ultimate-pack.txt">Historical Quaternius CC0 notice</a><a href="./models/licenses/CC-BY-3.0.txt">CC BY 3.0 text</a><a href="./models/licenses/CC0-1.0.txt">CC0 1.0 text</a></nav></footer>
</main></body></html>\n`;
}
