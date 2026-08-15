import type { Map as MapLibreMap } from 'maplibre-gl';
import {
    addPadding,
    getPaddingOffset,
    normalizePadding,
} from './padding';
import { isMeasurableElement, measureElementRect } from './dom';
import { calculateMapLocalObstacle } from './obstacles';
import { findFitCoordinatesCandidate } from './fit-coordinates';
import { projectToMercator } from './mercator';
import {
    calculatePadding,
    calculateSafeArea,
} from './geometry';
import type {
    MapLibreViewport,
    MapLibreViewportOverlay,
    OverlayRect,
    SafeArea,
    ViewportPadding,
    Rect,
} from './types';
import { expandObstacle } from './obstacles';


const EMPTY_PADDING: ViewportPadding = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
};

const EMPTY_SAFE_AREA: SafeArea = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
};

function getMapContainer(map: MapLibreMap): HTMLElement {
    if (typeof map.getContainer !== 'function') {
        throw new Error(
            'MapLibre viewport requires a map with a valid getContainer() method.',
        );
    }

    const container = map.getContainer();

    if (!isMeasurableElement(container)) {
        throw new Error(
            'MapLibre viewport requires a measurable map container.',
        );
    }

    return container;
}

export function createMapLibreViewport(
    map: MapLibreMap,
): MapLibreViewport {
    const mapContainer = getMapContainer(map);
    const overlays = new Map<string, MapLibreViewportOverlay>();

    let padding: ViewportPadding = { ...EMPTY_PADDING };
    let safeArea: SafeArea = { ...EMPTY_SAFE_AREA };
    let measuredOverlays: OverlayRect[] = [];
    let obstacles: Rect[] = [];
    let mapWidth = 0;
    let mapHeight = 0;
    let dirty = true;
    let destroyed = false;
    let scheduledFrame: number | null = null;

    function assertActive(): void {
        if (destroyed) {
            throw new Error('MapLibre viewport has been destroyed.');
        }
    }

    function assertUsableSafeArea(
        effectivePadding: ViewportPadding,
    ): void {
        const effectiveSafeArea = calculateSafeArea(
            measureElementRect(mapContainer),
            effectivePadding,
        );

        if (
            effectiveSafeArea.width <= 0 ||
            effectiveSafeArea.height <= 0
        ) {
            throw new Error(
                'Cannot perform camera operation because the calculated safe area has no usable size.',
            );
        }
    }

    function recalculate(): void {
        const mapRect = measureElementRect(mapContainer);

        mapWidth = mapRect.width;
        mapHeight = mapRect.height;

        measuredOverlays = [...overlays.values()].map((overlay) => ({
            edge: overlay.edge,
            rect: measureElementRect(overlay.element),
        }));

        obstacles = measuredOverlays.flatMap(({ rect }) => {
            const obstacle = calculateMapLocalObstacle(mapRect, rect);

            return obstacle ? [obstacle] : [];
        });

        padding = calculatePadding(mapRect, measuredOverlays);
        safeArea = calculateSafeArea(mapRect, padding);
        dirty = false;
    }

    function cancelScheduledRefresh(): void {
        if (scheduledFrame === null) {
            return;
        }

        if (typeof cancelAnimationFrame !== 'undefined') {
            cancelAnimationFrame(scheduledFrame);
        }

        scheduledFrame = null;
    }

    function scheduleRefresh(): void {
        if (destroyed) {
            return;
        }

        dirty = true;

        if (
            scheduledFrame !== null ||
            typeof requestAnimationFrame === 'undefined'
        ) {
            return;
        }

        scheduledFrame = requestAnimationFrame(() => {
            scheduledFrame = null;

            if (!destroyed) {
                recalculate();
            }
        });
    }

    function ensureFresh(): void {
        if (dirty) {
            cancelScheduledRefresh();
            recalculate();
        }
    }

    const resizeObserver =
        typeof ResizeObserver === 'undefined'
            ? null
            : new ResizeObserver(() => {
                scheduleRefresh();
            });

    resizeObserver?.observe(mapContainer);

    return {
        addOverlay(overlay) {
            assertActive();

            if (overlay.id.trim().length === 0) {
                throw new Error('Overlay id must not be empty.');
            }

            if (
                overlay.edge !== 'top' &&
                overlay.edge !== 'right' &&
                overlay.edge !== 'bottom' &&
                overlay.edge !== 'left'
            ) {
                throw new Error(
                    `Overlay "${overlay.id}" has an invalid edge "${overlay.edge}".`,
                );
            }

            if (!isMeasurableElement(overlay.element)) {
                throw new Error(
                    `Overlay "${overlay.id}" must provide a measurable DOM element.`,
                );
            }

            if (overlays.has(overlay.id)) {
                throw new Error(
                    `Overlay with id "${overlay.id}" is already registered.`,
                );
            }

            overlays.set(overlay.id, overlay);
            resizeObserver?.observe(overlay.element);
            dirty = true;
        },

        removeOverlay(id) {
            assertActive();

            const overlay = overlays.get(id);

            if (!overlay) {
                return;
            }

            resizeObserver?.unobserve(overlay.element);
            overlays.delete(id);
            dirty = true;
        },

        getSafeArea() {
            assertActive();
            ensureFresh();

            return { ...safeArea };
        },

        getPadding() {
            assertActive();
            ensureFresh();

            return { ...padding };
        },

        fitBounds(bounds, options = {}) {
            assertActive();
            ensureFresh();

            const { padding: additionalPadding, ...fitBoundsOptions } = options;
            const effectivePadding = addPadding(padding, additionalPadding);

            assertUsableSafeArea(effectivePadding);

            map.fitBounds(bounds, {
                ...fitBoundsOptions,
                padding: effectivePadding,
            });
        },

        fitCoordinates(coordinates, options = {}) {
            assertActive();

            if (map.getBearing() !== 0 || map.getPitch() !== 0) {
                throw new Error(
                    'fitCoordinates currently requires a map with bearing 0 and pitch 0.',
                );
            }

            if (coordinates.length === 0) {
                throw new Error('At least one coordinate is required.');
            }

            if (
                coordinates.some(
                    ([longitude, latitude]) =>
                        !Number.isFinite(longitude) ||
                        !Number.isFinite(latitude),
                )
            ) {
                throw new Error('Coordinates must contain finite longitude and latitude values.');
            }

            ensureFresh();

            const {
                padding: additionalPadding,
                minZoom = map.getMinZoom(),
                maxZoom = map.getMaxZoom(),
                zoomStep,
                ...cameraOptions
            } = options;

            const consumerPadding = normalizePadding(additionalPadding);

            const mercatorPoints = coordinates.map(
                ([longitude, latitude]) =>
                    projectToMercator(longitude, latitude),
            );

            const expandedObstacles = obstacles.map((obstacle) =>
                expandObstacle(
                    obstacle,
                    mapWidth,
                    mapHeight,
                    consumerPadding,
                ),
            );

            const candidate = findFitCoordinatesCandidate(
                mercatorPoints,
                mapWidth,
                mapHeight,
                expandedObstacles,
                consumerPadding,
                {
                    minZoom,
                    maxZoom,
                    ...(zoomStep !== undefined
                        ? { zoomStep }
                        : {}),
                },
            );

            if (!candidate) {
                throw new Error(
                    'Cannot fit coordinates into the available map area.',
                );
            }

            map.easeTo({
                ...cameraOptions,
                center: candidate.center,
                zoom: candidate.zoom,
            });
        },

        flyTo(options) {
            assertActive();
            ensureFresh();

            const {
                padding: additionalPadding,
                offset: consumerOffset,
                ...flyToOptions
            } = options;

            const effectivePadding = addPadding(
                padding,
                additionalPadding,
            );

            assertUsableSafeArea(effectivePadding);

            const [offsetX, offsetY] = getPaddingOffset(effectivePadding);

            const consumerOffsetX = Array.isArray(consumerOffset)
                ? consumerOffset[0]
                : (consumerOffset?.x ?? 0);

            const consumerOffsetY = Array.isArray(consumerOffset)
                ? consumerOffset[1]
                : (consumerOffset?.y ?? 0);

            map.flyTo({
                ...flyToOptions,
                offset: [
                    offsetX + consumerOffsetX,
                    offsetY + consumerOffsetY,
                ],
            });
        },

        easeTo(options) {
            assertActive();
            ensureFresh();

            const {
                padding: additionalPadding,
                offset: consumerOffset,
                ...easeToOptions
            } = options;

            const effectivePadding = addPadding(
                padding,
                additionalPadding,
            );

            assertUsableSafeArea(effectivePadding);

            const [offsetX, offsetY] = getPaddingOffset(effectivePadding);

            const consumerOffsetX = Array.isArray(consumerOffset)
                ? consumerOffset[0]
                : (consumerOffset?.x ?? 0);

            const consumerOffsetY = Array.isArray(consumerOffset)
                ? consumerOffset[1]
                : (consumerOffset?.y ?? 0);

            map.easeTo({
                ...easeToOptions,
                offset: [
                    offsetX + consumerOffsetX,
                    offsetY + consumerOffsetY,
                ],
            });
        },

        refresh() {
            assertActive();
            cancelScheduledRefresh();
            recalculate();
        },

        destroy() {
            if (destroyed) {
                return;
            }

            destroyed = true;

            cancelScheduledRefresh();
            resizeObserver?.disconnect();
            overlays.clear();
        },
    };
}