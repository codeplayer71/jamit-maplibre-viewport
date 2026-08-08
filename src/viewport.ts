import type { Map as MapLibreMap } from 'maplibre-gl';
import { addPadding } from './padding';
import { isMeasurableElement, measureElementRect } from './dom';
import {
    calculatePadding,
    calculateSafeArea,
} from './geometry';
import type {
    MapLibreViewport,
    MapLibreViewportOverlay,
    SafeArea,
    ViewportPadding,
} from './types';


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

        const overlayRects = [...overlays.values()].map((overlay) => ({
            edge: overlay.edge,
            rect: measureElementRect(overlay.element),
        }));

        padding = calculatePadding(mapRect, overlayRects);
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

        flyTo(options) {
            assertActive();
            ensureFresh();

            const { padding: additionalPadding, ...flyToOptions } = options;
            const effectivePadding = addPadding(padding, additionalPadding);

            assertUsableSafeArea(effectivePadding);

            map.flyTo({
                ...flyToOptions,
                padding: effectivePadding,
            });
        },

        easeTo(options) {
            assertActive();
            ensureFresh();

            const { padding: additionalPadding, ...easeToOptions } = options;
            const effectivePadding = addPadding(padding, additionalPadding);

            assertUsableSafeArea(effectivePadding);

            map.easeTo({
                ...easeToOptions,
                padding: effectivePadding,
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