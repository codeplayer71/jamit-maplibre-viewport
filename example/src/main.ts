import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createMapLibreViewport } from '../../src';
import './style.css';

const app = document.querySelector('#app');

if (!app) {
    throw new Error('Demo app element not found.');
}

app.innerHTML = `
  <aside class="demo__sidebar">
    Sidebar
  </aside>

<div class="demo__actions">
  <button type="button" data-action="fit-bounds">
    Fit Coordinates
  </button>

  <button type="button" data-action="fly-to">
    Fly To
  </button>

  <button type="button" data-action="ease-to">
    Ease To
  </button>

  <button type="button" data-action="toggle-sidebar">
    Toggle Sidebar
  </button>

  <button type="button" data-action="toggle-bottom-panel">
    Resize Bottom Panel
  </button>
</div>

  <div id="map" class="demo__map"></div>

  <section class="demo__bottom-panel">
    Bottom Panel
  </section>
`;

const sidebar = document.querySelector<HTMLElement>('.demo__sidebar');
const bottomPanel = document.querySelector<HTMLElement>('.demo__bottom-panel');

const fitBoundsButton = document.querySelector<HTMLButtonElement>(
    '[data-action="fit-bounds"]',
);

const flyToButton = document.querySelector<HTMLButtonElement>(
    '[data-action="fly-to"]',
);

const easeToButton = document.querySelector<HTMLButtonElement>(
    '[data-action="ease-to"]',
);

const toggleSidebarButton = document.querySelector<HTMLButtonElement>(
    '[data-action="toggle-sidebar"]',
);

const toggleBottomPanelButton = document.querySelector<HTMLButtonElement>(
    '[data-action="toggle-bottom-panel"]',
);

if (
    !sidebar ||
    !bottomPanel ||
    !fitBoundsButton ||
    !flyToButton ||
    !toggleSidebarButton ||
    !toggleBottomPanelButton ||
    !easeToButton
) {
    throw new Error('Demo elements not found.');
}

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://demotiles.maplibre.org/style.json',
    center: [13.405, 52.52],
    zoom: 11,
});

map.addControl(
    new maplibregl.NavigationControl(),
    'top-right',
);

const viewport = createMapLibreViewport(map);

viewport.addOverlay({
    id: 'sidebar',
    element: sidebar,
    edge: 'left',
});

viewport.addOverlay({
    id: 'bottom-panel',
    element: bottomPanel,
    edge: 'bottom',
});

const markerCoordinates: [number, number][] = [
    [13.405, 52.52],
    [13.35, 52.5],
    [13.46, 52.54],
];

map.on('load', () => {
    for (const coordinates of markerCoordinates) {
        new maplibregl.Marker()
            .setLngLat(coordinates)
            .addTo(map);
    }
});

fitBoundsButton.addEventListener('click', () => {
    viewport.fitCoordinates(markerCoordinates, {
        padding: 40,
        maxZoom: 14,
        duration: 800,
    });
});

flyToButton.addEventListener('click', () => {
    viewport.flyTo({
        center: [13.405, 52.52],
        zoom: 14,
        padding: 40,
        duration: 1200,
    });
});

easeToButton.addEventListener('click', () => {
    viewport.easeTo({
        center: [13.46, 52.54],
        zoom: 13,
        padding: 40,
        duration: 800,
    });
});

toggleSidebarButton.addEventListener('click', () => {
    sidebar.classList.toggle('demo__sidebar--collapsed');
});

toggleBottomPanelButton.addEventListener('click', () => {
    bottomPanel.classList.toggle('demo__bottom-panel--expanded');
});