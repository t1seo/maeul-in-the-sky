/* global document */

const searchFilter = document.querySelector('#search-filter');
const seasonFilter = document.querySelector('#season-filter');
const familyFilter = document.querySelector('#family-filter');
const styleFilter = document.querySelector('#style-filter');
const resultCount = document.querySelector('#result-count');
const emptyState = document.querySelector('#empty-state');
const clearFilters = document.querySelector('#clear-filters');
const modeButtons = [...document.querySelectorAll('[data-mode]')];
const cards = [...document.querySelectorAll('[data-catalog-card]')];

function selectedValue(control) {
  return control?.value ?? 'all';
}

function searchValue() {
  return searchFilter?.value.trim().toLocaleLowerCase('en-US') ?? '';
}

function updateResults() {
  const season = selectedValue(seasonFilter);
  const family = selectedValue(familyFilter);
  const style = selectedValue(styleFilter);
  const query = searchValue();
  let visibleCount = 0;

  for (const card of cards) {
    const matchesSeason =
      season === 'all' || card.dataset.season === 'all' || card.dataset.season === season;
    const matchesFamily = family === 'all' || card.dataset.family === family;
    const matchesStyle = style === 'all' || card.dataset.style === style;
    const matchesQuery = (card.dataset.search ?? '').includes(query);
    const visible = matchesSeason && matchesFamily && matchesStyle && matchesQuery;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  }

  if (resultCount) resultCount.textContent = `Showing ${visibleCount} of ${cards.length} entries`;
  if (emptyState) emptyState.hidden = visibleCount !== 0;
}

function setMode(mode) {
  document.documentElement.dataset.mode = mode;
  for (const button of modeButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
  }
  for (const card of cards) {
    const use = card.querySelector('use');
    const key = card.dataset.key;
    if (use && key) use.setAttribute('href', `catalog-sprite-${mode}.svg#${key}`);
  }
}

for (const control of [searchFilter, seasonFilter, familyFilter, styleFilter]) {
  control?.addEventListener('input', updateResults);
}
for (const button of modeButtons) {
  button.addEventListener('click', () => {
    if (button.dataset.mode) setMode(button.dataset.mode);
  });
}
clearFilters?.addEventListener('click', () => {
  if (searchFilter) searchFilter.value = '';
  for (const control of [seasonFilter, familyFilter, styleFilter]) {
    if (control) control.value = 'all';
  }
  updateResults();
  searchFilter?.focus();
});

updateResults();
