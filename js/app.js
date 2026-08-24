(() => {
  'use strict';

  const DATA_PATH = 'data/leeds-green-spaces.geojson';
  const DEFAULT_VIEW = { center: [53.8008, -1.5491], zoom: 11 };
  const state = {
    allFeatures: [],
    filteredFeatures: [],
    selectedCategory: 'all',
    query: '',
    map: null,
    geoJsonLayer: null,
    searchTimer: null,
    mapMode: 'category',
    activeFeature: null,
  };

  const $ = (selector) => document.querySelector(selector);

  const elements = {
    map: $('#map'),
    categoryFilter: $('#category-filter'),
    searchInput: $('#search-input'),
    resetButton: $('#reset-view'),
    visibleCount: $('#visible-count'),
    categoryCount: $('#category-count'),
    areaTotal: $('#area-total'),
    dataStatus: $('#data-status'),
    mapError: $('#map-error'),
    resultLabel: $('#result-label'),
    categoryChart: $('#category-chart'),
    largestList: $('#largest-list'),
    mapKeyLabel: $('#map-key-label'),
    modeButtons: document.querySelectorAll('[data-map-mode]'),
  };

  const safeText = (value, fallback = 'Not available') => {
    if (value === null || value === undefined || String(value).trim() === '') {
      return fallback;
    }
    return String(value);
  };

  const escapeHtml = (value) => safeText(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const formatArea = (value) => {
    const area = Number(value);
    return Number.isFinite(area) && area > 0 ? `${area.toLocaleString('en-GB', { maximumFractionDigits: 1 })} ha` : 'Not available';
  };

  const hasValidGeometry = (feature) => {
    const geometry = feature?.geometry;
    return Boolean(geometry?.type && geometry.coordinates);
  };

  const featureStyle = {
    color: '#1d3d2d',
    weight: 1.2,
    fillColor: '#2f5b45',
    fillOpacity: 0.55,
    opacity: 0.9,
  };

  const highlightedStyle = {
    color: '#9a5a24',
    weight: 2,
    fillColor: '#d58a45',
    fillOpacity: 0.75,
  };

  function setStatus(message) {
    if (elements.dataStatus) elements.dataStatus.textContent = message;
  }

  function showMapError() {
    if (elements.mapError) elements.mapError.hidden = false;
  }

  function hideMapError() {
    if (elements.mapError) elements.mapError.hidden = true;
  }

  function createPopup(feature) {
    const properties = feature.properties || {};
    return `
      <div class="popup-title">${escapeHtml(properties.name)}</div>
      <div class="popup-row"><span>Type</span><strong>${escapeHtml(properties.category)}</strong></div>
      <div class="popup-row"><span>Recorded area</span><strong>${escapeHtml(formatArea(properties.area_ha))}</strong></div>
      <div class="popup-row"><span>District</span><strong>${escapeHtml(properties.district)}</strong></div>
    `;
  }

  function areaStyle(feature) {
    const area = Number(feature.properties?.area_ha);
    if (!Number.isFinite(area) || area <= 0) return { ...featureStyle, fillColor: '#8ca996', fillOpacity: 0.38 };
    if (area >= 20) return { ...featureStyle, fillColor: '#163c2b', fillOpacity: 0.82 };
    if (area >= 5) return { ...featureStyle, fillColor: '#2f5b45', fillOpacity: 0.7 };
    return { ...featureStyle, fillColor: '#7da087', fillOpacity: 0.52 };
  }

  function styleFeature(feature) {
    return state.mapMode === 'area' ? areaStyle(feature) : featureStyle;
  }

  function onEachFeature(feature, layer) {
    layer.bindPopup(createPopup(feature), { closeButton: true, autoPanPadding: [24, 24] });
    layer.on({
      mouseover: (event) => event.target.setStyle(highlightedStyle),
      mouseout: (event) => event.target.setStyle(styleFeature(feature)),
      focus: (event) => event.target.setStyle(highlightedStyle),
      blur: (event) => event.target.setStyle(styleFeature(feature)),
    });
  }

  function initializeMap() {
    state.map = L.map(elements.map, { zoomControl: false }).setView(DEFAULT_VIEW.center, DEFAULT_VIEW.zoom);
    L.control.zoom({ position: 'bottomright' }).addTo(state.map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(state.map);
    state.geoJsonLayer = L.geoJSON(null, { style: styleFeature, onEachFeature }).addTo(state.map);
  }

  function updateMapKey() {
    if (!elements.mapKeyLabel) return;
    elements.mapKeyLabel.textContent = state.mapMode === 'area' ? 'Recorded area · light to dark' : 'Public green space';
  }

  function updateMapStyles() {
    state.geoJsonLayer.eachLayer((layer) => {
      if (layer.feature) layer.setStyle(styleFeature(layer.feature));
    });
    updateMapKey();
  }

  function renderCategoryChart(features) {
    if (!elements.categoryChart) return;
    const counts = features.reduce((result, feature) => {
      const category = safeText(feature.properties?.category, 'Other green space');
      result[category] = (result[category] || 0) + 1;
      return result;
    }, {});
    const rows = Object.entries(counts).sort(([, a], [, b]) => b - a);
    const max = rows[0]?.[1] || 1;
    elements.categoryChart.innerHTML = rows.length ? rows.map(([category, count]) => `
      <div class="category-row" role="listitem" title="${escapeHtml(category)}: ${count} recorded spaces">
        <span class="category-name">${escapeHtml(category)}</span>
        <span class="category-track" aria-hidden="true"><span class="category-bar" style="width: ${(count / max) * 100}%"></span></span>
        <span class="category-value">${count.toLocaleString('en-GB')}</span>
      </div>
    `).join('') : '<p class="largest-empty">No category data for this view.</p>';
  }

  function renderLargestList(features) {
    if (!elements.largestList) return;
    const largest = features
      .filter((feature) => Number.isFinite(Number(feature.properties?.area_ha)))
      .sort((a, b) => Number(b.properties.area_ha) - Number(a.properties.area_ha))
      .slice(0, 5);
    elements.largestList.innerHTML = largest.length ? largest.map((feature, index) => `
      <li class="largest-item" data-source-id="${escapeHtml(feature.properties?.source_id)}" tabindex="0" role="button" aria-label="Focus ${escapeHtml(feature.properties?.name)} on map">
        <span class="largest-item-name">${escapeHtml(feature.properties?.name)}</span>
        <span class="largest-item-meta">${escapeHtml(formatArea(feature.properties?.area_ha))}</span>
      </li>
    `).join('') : '<li class="largest-empty">No recorded areas in this view.</li>';
    elements.largestList.querySelectorAll('.largest-item').forEach((item) => {
      const focusFeature = () => focusFeatureOnMap(item.dataset.sourceId);
      item.addEventListener('click', focusFeature);
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          focusFeature();
        }
      });
    });
  }

  function focusFeatureOnMap(sourceId) {
    const target = state.geoJsonLayer.getLayers().find((layer) => String(layer.feature?.properties?.source_id) === String(sourceId));
    if (!target) return;
    state.geoJsonLayer.eachLayer((layer) => {
      if (layer.feature) layer.setStyle(styleFeature(layer.feature));
    });
    target.setStyle(highlightedStyle);
    if (target.getBounds) state.map.fitBounds(target.getBounds().pad(0.75), { maxZoom: 15 });
    else if (target.getLatLng) state.map.setView(target.getLatLng(), 15);
    target.openPopup();
    state.activeFeature = target;
  }

  function getCategories(features) {
    return [...new Set(features.map((feature) => safeText(feature.properties?.category, 'Other')))].sort((a, b) => a.localeCompare(b));
  }

  function populateCategoryFilter(features) {
    if (!elements.categoryFilter) return;
    const options = ['<option value="all">All green spaces</option>'];
    getCategories(features).forEach((category) => {
      options.push(`<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`);
    });
    elements.categoryFilter.innerHTML = options.join('');
    elements.categoryFilter.value = state.selectedCategory;
  }

  function updateSummary(features) {
    const categories = getCategories(features);
    const knownAreas = features
      .map((feature) => Number(feature.properties?.area_ha))
      .filter((area) => Number.isFinite(area) && area > 0);
    const totalArea = knownAreas.reduce((sum, area) => sum + area, 0);
    elements.visibleCount.textContent = features.length.toLocaleString('en-GB');
    elements.categoryCount.textContent = categories.length.toLocaleString('en-GB');
    elements.areaTotal.textContent = knownAreas.length ? totalArea.toLocaleString('en-GB', { maximumFractionDigits: 1 }) : '—';
    renderCategoryChart(features);
    renderLargestList(features);
    if (elements.resultLabel) {
      elements.resultLabel.textContent = state.selectedCategory === 'all' ? 'ALL SPACES' : state.selectedCategory.toUpperCase();
    }
  }

  function updateNoResultsState(features) {
    if (features.length === 0 && state.allFeatures.length > 0) {
      setStatus('No spaces match those filters. Try a wider search.');
      return;
    }
    setStatus(`${features.length.toLocaleString('en-GB')} green spaces indexed`);
  }

  function renderFeatures(features) {
    state.filteredFeatures = [...features];
    state.geoJsonLayer.clearLayers();
    if (features.length > 0) state.geoJsonLayer.addData({ type: 'FeatureCollection', features });
    updateSummary(features);
    updateMapStyles();
    updateNoResultsState(features);
  }

  function applyFilters() {
    const query = state.query.trim().toLocaleLowerCase('en-GB');
    const filtered = state.allFeatures.filter((feature) => {
      const properties = feature.properties || {};
      const categoryMatches = state.selectedCategory === 'all' || safeText(properties.category, 'Other') === state.selectedCategory;
      const nameMatches = !query || safeText(properties.name).toLocaleLowerCase('en-GB').includes(query);
      return categoryMatches && nameMatches;
    });
    renderFeatures(filtered);
  }

  function resetView() {
    state.selectedCategory = 'all';
    state.query = '';
    elements.categoryFilter.value = 'all';
    elements.searchInput.value = '';
    renderFeatures(state.allFeatures);
    const bounds = state.geoJsonLayer.getBounds();
    if (bounds.isValid()) state.map.fitBounds(bounds.pad(0.08));
    else state.map.setView(DEFAULT_VIEW.center, DEFAULT_VIEW.zoom);
  }

  async function loadData() {
    try {
      const response = await fetch(DATA_PATH, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Dataset request failed: ${response.status}`);
      const data = await response.json();
      if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) throw new Error('Dataset is not a FeatureCollection');
      state.allFeatures = data.features.filter(hasValidGeometry);
      populateCategoryFilter(state.allFeatures);
      renderFeatures(state.allFeatures);
      hideMapError();
      const skipped = data.features.length - state.allFeatures.length;
      setStatus(`${state.allFeatures.length.toLocaleString('en-GB')} green spaces indexed${skipped ? ` · ${skipped} skipped` : ''}`);
      const bounds = state.geoJsonLayer.getBounds();
      if (bounds.isValid()) state.map.fitBounds(bounds.pad(0.08));
    } catch (error) {
      state.allFeatures = [];
      renderFeatures([]);
      setStatus('The green-space index is unavailable.');
      showMapError();
      console.error('Unable to load green-space data:', error);
    }
  }

  function bindControls() {
    elements.categoryFilter.addEventListener('change', (event) => {
      state.selectedCategory = event.target.value;
      applyFilters();
    });
    elements.searchInput.addEventListener('input', (event) => {
      window.clearTimeout(state.searchTimer);
      state.searchTimer = window.setTimeout(() => {
        state.query = event.target.value;
        applyFilters();
      }, 180);
    });
    elements.resetButton.addEventListener('click', resetView);
    elements.modeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        state.mapMode = button.dataset.mapMode;
        elements.modeButtons.forEach((item) => {
          const isActive = item === button;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-pressed', String(isActive));
        });
        updateMapStyles();
      });
    });
  }

  function init() {
    initializeMap();
    bindControls();
    loadData();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
