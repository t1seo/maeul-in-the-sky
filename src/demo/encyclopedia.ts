import { EPIC_CATALOG } from '../browser.js';
import type { TerrainMetadata } from '../core/scene-types.js';
import { button, click, dialog, html, textNode } from './dom.js';

const thresholdLabels = {
  level100: 'Contribution intensity',
  richness: 'Landscape richness',
  total: 'Total contributions',
  longestStreak: 'Longest streak',
} as const;

export function updateEncyclopedia(metadata: TerrainMetadata): void {
  const discovered = new Set(metadata.wonders.map((wonder) => wonder.catalogId));
  html('wonder-count').textContent = `${discovered.size} / ${EPIC_CATALOG.length} discovered`;
  const modal = dialog('wonder-dialog');
  const cards = EPIC_CATALOG.map((entry) => {
    const discoveries = metadata.wonders.filter((wonder) => wonder.catalogId === entry.id);
    const card = textNode('button', '', 'wonder-card');
    card.type = 'button';
    card.dataset.catalogId = entry.id;
    card.dataset.discovered = String(discoveries.length > 0);
    card.append(
      textNode('small', `${entry.tier} · ${discoveries.length ? 'Discovered' : 'Locked'}`),
      textNode('strong', entry.displayName),
    );
    card.addEventListener('click', () => {
      html('wonder-title').textContent = entry.displayName;
      const details = html('wonder-details');
      details.replaceChildren(textNode('p', entry.description));
      details.append(textNode('p', `${entry.tier} · ${entry.category}`));
      details.append(
        textNode(
          'h3',
          discoveries.length ? 'Found in this village' : 'Still waiting to be discovered',
        ),
      );
      if (!discoveries.length)
        details.append(
          textNode(
            'p',
            'This Wonder has no placement in the current Contribution Calendar. Meeting its gates makes a day eligible; spacing, landscape, and deterministic selection also matter.',
          ),
        );
      for (const discovery of discoveries) {
        details.append(textNode('p', `${discovery.anchorDate} · ${discovery.explanation}`));
        const thresholds = document.createElement('ul');
        for (const threshold of discovery.thresholds) {
          thresholds.append(
            textNode(
              'li',
              `${thresholdLabels[threshold.metric]}: ${threshold.current} / ${threshold.required} required · ${threshold.achieved ? 'met' : 'not met'}`,
              threshold.achieved ? 'threshold-met' : 'threshold-locked',
            ),
          );
        }
        details.append(thresholds);
      }
      details.append(textNode('h3', 'Eligibility'));
      details.append(
        textNode(
          'p',
          `Level at least ${entry.gate.minLevel}/99; landscape richness at least ${entry.gate.minRichness}. ${entry.gate.statsDescription}. Base selection chance ${(entry.gate.baseChance * 100).toFixed(1)}% before selection rules.`,
        ),
      );
      modal.onclose = () => card.focus();
      modal.showModal();
      button('close-wonder').focus();
    });
    return card;
  });
  html('wonder-list').replaceChildren(...cards);
}

export function setupEncyclopedia(): void {
  click('close-wonder', () => dialog('wonder-dialog').close());
}
