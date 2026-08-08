import type { Map as MapLibreMap } from 'maplibre-gl';
import { addPadding } from './padding';
import { measureElementRect } from './dom';
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

export function createMapLibreViewport(
    map: MapLibreMap,
): MapLibreViewport {
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

    function recalculate(): void {
        const mapRect = measureElementRect(map.getContainer());

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

    resizeObserver?.observe(map.getContainer());

    return {
        addOverlay(overlay) {
            assertActive();

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

            map.fitBounds(bounds, {
                ...fitBoundsOptions,
                padding: addPadding(padding, additionalPadding),
            });
        },

        flyTo(options) {
            assertActive();
            ensureFresh();

            const { padding: additionalPadding, ...flyToOptions } = options;

            map.flyTo({
                ...flyToOptions,
                padding: addPadding(padding, additionalPadding),
            });
        },

        easeTo(options) {
            assertActive();
            ensureFresh();

            const { padding: additionalPadding, ...easeToOptions } = options;

            map.easeTo({
                ...easeToOptions,
                padding: addPadding(padding, additionalPadding),
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