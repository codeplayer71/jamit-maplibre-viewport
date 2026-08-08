import { describe, expect, it, vi } from 'vitest';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { createMapLibreViewport } from '../src/viewport';

function createElementMock(
    rect: {
        top: number;
        right: number;
        bottom: number;
        left: number;
        width: number;
        height: number;
    },
): HTMLElement {
    return {
        getBoundingClientRect: () => ({
            ...rect,
            x: rect.left,
            y: rect.top,
            toJSON: () => ({}),
        }),
    } as HTMLElement;
}

function createMapMock() {
    const container = createElementMock({
        top: 100,
        right: 1300,
        bottom: 900,
        left: 300,
        width: 1000,
        height: 800,
    });

    const fitBounds = vi.fn();
    const flyTo = vi.fn();
    const easeTo = vi.fn();

    const map = {
        getContainer: () => container,
        fitBounds,
        flyTo,
        easeTo,
    } as unknown as MapLibreMap;

    return {
        map,
        fitBounds,
        flyTo,
        easeTo,
    };
}

describe('fitBounds', () => {
    it('uses automatically calculated overlay padding', () => {
        const { map, fitBounds } = createMapMock();
        const viewport = createMapLibreViewport(map);

        viewport.addOverlay({
            id: 'header',
            element: createElementMock({
                top: 100,
                right: 1300,
                bottom: 180,
                left: 300,
                width: 1000,
                height: 80,
            }),
            edge: 'top',
        });

        viewport.addOverlay({
            id: 'bottom-sheet',
            element: createElementMock({
                top: 600,
                right: 1300,
                bottom: 900,
                left: 300,
                width: 1000,
                height: 300,
            }),
            edge: 'bottom',
        });

        const bounds: [[number, number], [number, number]] = [
            [10, 20],
            [30, 40],
        ];

        viewport.fitBounds(bounds, {
            maxZoom: 14,
        });

        expect(fitBounds).toHaveBeenCalledWith(bounds, {
            maxZoom: 14,
            padding: {
                top: 80,
                right: 0,
                bottom: 300,
                left: 0,
            },
        });
    });

    it('adds numeric consumer padding to overlay padding', () => {
        const { map, fitBounds } = createMapMock();
        const viewport = createMapLibreViewport(map);

        viewport.addOverlay({
            id: 'header',
            element: createElementMock({
                top: 100,
                right: 1300,
                bottom: 180,
                left: 300,
                width: 1000,
                height: 80,
            }),
            edge: 'top',
        });

        const bounds: [[number, number], [number, number]] = [
            [10, 20],
            [30, 40],
        ];

        viewport.fitBounds(bounds, {
            padding: 40,
        });

        expect(fitBounds).toHaveBeenCalledWith(bounds, {
            padding: {
                top: 120,
                right: 40,
                bottom: 40,
                left: 40,
            },
        });
    });

    it('adds partial consumer padding to overlay padding', () => {
        const { map, fitBounds } = createMapMock();
        const viewport = createMapLibreViewport(map);

        viewport.addOverlay({
            id: 'bottom-sheet',
            element: createElementMock({
                top: 600,
                right: 1300,
                bottom: 900,
                left: 300,
                width: 1000,
                height: 300,
            }),
            edge: 'bottom',
        });

        const bounds: [[number, number], [number, number]] = [
            [10, 20],
            [30, 40],
        ];

        viewport.fitBounds(bounds, {
            padding: {
                left: 40,
                right: 40,
            },
            maxZoom: 14,
        });

        expect(fitBounds).toHaveBeenCalledWith(bounds, {
            maxZoom: 14,
            padding: {
                top: 0,
                right: 40,
                bottom: 300,
                left: 40,
            },
        });
    });
});

describe('flyTo', () => {
    it('uses automatically calculated overlay padding', () => {
        const { map, flyTo } = createMapMock();
        const viewport = createMapLibreViewport(map);

        viewport.addOverlay({
            id: 'sidebar',
            element: createElementMock({
                top: 100,
                right: 650,
                bottom: 900,
                left: 300,
                width: 350,
                height: 800,
            }),
            edge: 'left',
        });

        viewport.flyTo({
            center: [13.405, 52.52],
            zoom: 14,
        });

        expect(flyTo).toHaveBeenCalledWith({
            center: [13.405, 52.52],
            zoom: 14,
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 350,
            },
        });
    });
});

describe('easeTo', () => {
    it('uses automatically calculated overlay padding', () => {
        const { map, easeTo } = createMapMock();
        const viewport = createMapLibreViewport(map);

        viewport.addOverlay({
            id: 'bottom-sheet',
            element: createElementMock({
                top: 600,
                right: 1300,
                bottom: 900,
                left: 300,
                width: 1000,
                height: 300,
            }),
            edge: 'bottom',
        });

        viewport.easeTo({
            center: [13.405, 52.52],
            zoom: 14,
        });

        expect(easeTo).toHaveBeenCalledWith({
            center: [13.405, 52.52],
            zoom: 14,
            padding: {
                top: 0,
                right: 0,
                bottom: 300,
                left: 0,
            },
        });
    });
});