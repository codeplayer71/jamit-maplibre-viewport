import type { Map as MapLibreMap } from 'maplibre-gl';
import type {
    MapLibreViewport,
    MapLibreViewportOverlay,
} from './types';

export function createMapLibreViewport(
    map: MapLibreMap,
): MapLibreViewport {
    void map;

    const overlays = new Map<string, MapLibreViewportOverlay>();

    return {
        addOverlay(overlay) {
            if (overlays.has(overlay.id)) {
                throw new Error(
                    `Overlay with id "${overlay.id}" is already registered.`,
                );
            }

            overlays.set(overlay.id, overlay);
        },

        removeOverlay(id) {
            overlays.delete(id);
        },

        getSafeArea() {
            return {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            };
        },

        getPadding() {
            return {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
            };
        },

        refresh() {},

        destroy() {},
    };
}