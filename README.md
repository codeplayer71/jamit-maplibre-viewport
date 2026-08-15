# jamit-maplibre-viewport

A lightweight, framework-agnostic viewport and safe-area manager for MapLibre GL JS applications with dynamic UI overlays.

`jamit-maplibre-viewport` helps MapLibre applications keep important map content visible when UI elements such as sidebars, bottom panels, drawers or floating overlays cover parts of the map.

Instead of relying on hard-coded padding values, it measures the actual DOM geometry, observes layout changes and provides camera helpers that are aware of the space users can really see.

## Demo

A public interactive demo is available at:

https://jamit.one/packages/jamit-maplibre-viewport

The demo shows the viewport manager with dynamic sidebars, bottom panels, multiple markers and camera operations such as `fitCoordinates()`, `fitBounds()`, `flyTo()` and `easeTo()`.

## Features

- Framework-agnostic TypeScript API
- Works with MapLibre GL JS 5 and 6
- Dynamic DOM overlay measurement
- Automatic updates with `ResizeObserver`
- No polling
- No project-specific selectors or magic numbers
- Safe-area and padding calculation
- Obstacle-aware coordinate fitting
- Additional consumer padding
- Camera helpers for `fitBounds`, `fitCoordinates`, `flyTo` and `easeTo`
- SSR-safe package import
- Fully typed API
- No runtime framework dependencies

## Installation

```bash
pnpm add jamit-maplibre-viewport maplibre-gl
```

With npm:

```bash
npm install jamit-maplibre-viewport maplibre-gl
```

MapLibre GL JS is a peer dependency.

Supported versions:

```text
MapLibre GL JS >= 5.6.0 < 7
```

## Basic usage

```ts
import { Map } from 'maplibre-gl';
import { createMapLibreViewport } from 'jamit-maplibre-viewport';

const map = new Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [13.405, 52.52],
  zoom: 11,
});

const viewport = createMapLibreViewport(map);
```

## Registering overlays

UI elements covering the map can be registered as overlays.

```ts
const sidebar = document.querySelector<HTMLElement>('.sidebar');
const bottomPanel = document.querySelector<HTMLElement>('.bottom-panel');

if (!sidebar || !bottomPanel) {
  throw new Error('Map overlays not found.');
}

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
```

The package measures the real DOM rectangles instead of requiring fixed pixel values.

If a registered overlay changes its size, `ResizeObserver` automatically marks the viewport geometry for recalculation.

## Fit coordinates into the visible map area

`fitCoordinates()` is the main obstacle-aware camera helper.

```ts
const coordinates: [number, number][] = [
  [13.405, 52.52],
  [13.35, 52.5],
  [13.46, 52.54],
];

viewport.fitCoordinates(coordinates, {
  padding: 40,
  maxZoom: 14,
  duration: 800,
});
```

Unlike traditional edge padding, `fitCoordinates()` works with the actual overlay rectangles.

For example, a partial bottom panel does not automatically block the complete width of the map. Free space beside the panel can still be used when calculating the camera position.

The solver searches for the highest zoom level at which all supplied coordinates can remain visible outside the registered obstacles.

## Additional padding

Padding can be supplied as a single number:

```ts
viewport.fitCoordinates(coordinates, {
  padding: 40,
});
```

or per edge:

```ts
viewport.fitCoordinates(coordinates, {
  padding: {
    top: 40,
    right: 40,
    bottom: 80,
    left: 60,
  },
});
```

For `fitCoordinates()`, this padding is applied both to the outer map boundary and as safety spacing around UI obstacles.

## Fit bounds

For traditional rectangular bounds fitting:

```ts
viewport.fitBounds(
  [
    [13.35, 52.5],
    [13.46, 52.54],
  ],
  {
    padding: 40,
    maxZoom: 14,
    duration: 800,
  },
);
```

`fitBounds()` uses the calculated edge-safe area and delegates the camera operation to MapLibre.

For layouts with partial or irregularly positioned overlays, prefer `fitCoordinates()` when the actual coordinates are available.

## Fly to

```ts
viewport.flyTo({
  center: [13.405, 52.52],
  zoom: 14,
  padding: 40,
  duration: 1200,
});
```

## Ease to

```ts
viewport.easeTo({
  center: [13.46, 52.54],
  zoom: 13,
  padding: 40,
  duration: 800,
});
```

The viewport manager translates asymmetric safe-area padding into a camera offset so the MapLibre transform padding is not permanently modified.

## Reading the current geometry

### Padding

```ts
const padding = viewport.getPadding();

console.log(padding);
```

Example:

```ts
{
  top: 0,
  right: 0,
  bottom: 180,
  left: 320,
}
```

### Safe area

```ts
const safeArea = viewport.getSafeArea();

console.log(safeArea);
```

Example:

```ts
{
  x: 320,
  y: 0,
  width: 960,
  height: 540,
}
```

## Manually refreshing geometry

Overlay and container resizes are normally detected automatically.

If an application needs to force an immediate recalculation:

```ts
viewport.refresh();
```

For example:

```ts
viewport.refresh();

viewport.fitCoordinates(coordinates, {
  padding: 40,
});
```

`refresh()` recalculates the geometry. It does not automatically move the map camera.

## Removing overlays

```ts
viewport.removeOverlay('sidebar');
```

The overlay will no longer participate in subsequent viewport calculations.

## Cleanup

Call `destroy()` when the viewport manager is no longer needed:

```ts
viewport.destroy();
```

This disconnects observers, cancels scheduled updates and releases internal references.

After destruction, viewport operations are no longer available.

## API

### `createMapLibreViewport(map)`

Creates a viewport manager for a MapLibre map instance.

Returns:

```ts
type MapLibreViewport = {
  addOverlay: (overlay: MapLibreViewportOverlay) => void;
  removeOverlay: (id: string) => void;
  getSafeArea: () => SafeArea;
  getPadding: () => ViewportPadding;
  fitBounds: (
    bounds: LngLatBoundsLike,
    options?: ViewportFitBoundsOptions,
  ) => void;
  fitCoordinates: (
    coordinates: Coordinate[],
    options?: ViewportFitCoordinatesOptions,
  ) => void;
  flyTo: (options: ViewportFlyToOptions) => void;
  easeTo: (options: ViewportEaseToOptions) => void;
  refresh: () => void;
  destroy: () => void;
};
```

### Overlay

```ts
type MapLibreViewportOverlay = {
  id: string;
  element: HTMLElement;
  edge: 'top' | 'right' | 'bottom' | 'left';
};
```

### Coordinate

```ts
type Coordinate = [number, number];
```

## Dynamic layouts

A typical use case is a map with UI whose dimensions change at runtime:

```text
┌───────────────────────────────────────┐
│ Sidebar          Map                 │
│ ┌────────┐                            │
│ │        │             Marker        │
│ │        │               ●           │
│ │        │                            │
│ │        │       ┌───────────────────┤
│ │        │   ●   │ Bottom Panel      │
│ └────────┘       │                   │
└──────────────────┴───────────────────┘
```

If the sidebar collapses or the bottom panel grows, the viewport manager detects the new dimensions through `ResizeObserver`.

The next camera operation uses the updated geometry automatically.

## SSR

The package can safely be imported in server-side rendered applications.

Importing it does not require browser globals such as:

```text
window
document
HTMLElement
ResizeObserver
```

DOM access only happens when a viewport instance interacts with actual map and overlay elements.

This makes the package suitable for frameworks such as Nuxt and Next.js.

## Current limitations

### Bearing and pitch

Obstacle-aware `fitCoordinates()` currently requires:

```text
bearing = 0
pitch = 0
```

Calling it on a rotated or pitched map throws a descriptive error instead of calculating an incorrect camera position.

### Antimeridian

`fitCoordinates()` currently does not support coordinate groups crossing the antimeridian.

For example:

```ts
[
  [179, 10],
  [-179, 10],
]
```

is rejected until world-wrapping support is implemented.

Traditional MapLibre camera APIs remain available for such cases.

## Compatibility

Tested with:

- MapLibre GL JS 5.6
- MapLibre GL JS 6.0
- TypeScript
- modern browsers with `ResizeObserver`

The package does not depend on Vue, React, Nuxt or any other UI framework.

## Development

Install dependencies:

```bash
pnpm install
```

Run the type checker:

```bash
pnpm typecheck
```

Run the tests:

```bash
pnpm test
```

Build the package:

```bash
pnpm build
```

Verify the built package import:

```bash
pnpm test:package
```

Run the MapLibre demo:

```bash
pnpm demo
```

Build the demo:

```bash
pnpm demo:build
```

## License

MIT

## Author

JamIT
