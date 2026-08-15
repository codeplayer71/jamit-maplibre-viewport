import { describe, expect, it } from 'vitest';
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

function createMapMock(): MapLibreMap {
    const container = createElementMock({
        top: 100,
        right: 1300,
        bottom: 900,
        left: 300,
        width: 1000,
        height: 800,
    });

    return {
        getContainer: () => container,
    } as MapLibreMap;
}

describe('createMapLibreViewport', () => {
    it('registers an overlay', () => {
        const viewport = createMapLibreViewport(createMapMock());

        expect(() => {
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
        }).not.toThrow();
    });

    it('throws when an overlay id is already registered', () => {
        const viewport = createMapLibreViewport(createMapMock());

        const element = createElementMock({
            top: 100,
            right: 1300,
            bottom: 180,
            left: 300,
            width: 1000,
            height: 80,
        });

        viewport.addOverlay({
            id: 'header',
            element,
            edge: 'top',
        });

        expect(() => {
            viewport.addOverlay({
                id: 'header',
                element,
                edge: 'bottom',
            });
        }).toThrow('Overlay with id "header" is already registered.');
    });

    it('calculates padding from registered overlays', () => {
        const viewport = createMapLibreViewport(createMapMock());

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

        expect(viewport.getPadding()).toEqual({
            top: 80,
            right: 0,
            bottom: 300,
            left: 0,
        });
    });

    it('calculates the safe area', () => {
        const viewport = createMapLibreViewport(createMapMock());

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

        expect(viewport.getSafeArea()).toEqual({
            x: 350,
            y: 80,
            width: 650,
            height: 420,
        });
    });

    it('removes an overlay from subsequent calculations', () => {
        const viewport = createMapLibreViewport(createMapMock());

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

        expect(viewport.getPadding().top).toBe(80);

        viewport.removeOverlay('header');

        expect(viewport.getPadding().top).toBe(0);
    });

    it('allows an overlay id to be registered again after removal', () => {
        const viewport = createMapLibreViewport(createMapMock());

        const element = createElementMock({
            top: 100,
            right: 1300,
            bottom: 180,
            left: 300,
            width: 1000,
            height: 80,
        });

        viewport.addOverlay({
            id: 'header',
            element,
            edge: 'top',
        });

        viewport.removeOverlay('header');

        expect(() => {
            viewport.addOverlay({
                id: 'header',
                element,
                edge: 'top',
            });
        }).not.toThrow();
    });

    it('prevents usage after destroy', () => {
        const viewport = createMapLibreViewport(createMapMock());

        viewport.destroy();

        expect(() => viewport.getPadding()).toThrow(
            'MapLibre viewport has been destroyed.',
        );

        expect(() => viewport.getSafeArea()).toThrow(
            'MapLibre viewport has been destroyed.',
        );

        expect(() => viewport.refresh()).toThrow(
            'MapLibre viewport has been destroyed.',
        );

        expect(() => viewport.removeOverlay('header')).toThrow(
            'MapLibre viewport has been destroyed.',
        );

        expect(() => {
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
        }).toThrow('MapLibre viewport has been destroyed.');
    });

    it('recalculates geometry on refresh', () => {
        const viewport = createMapLibreViewport(createMapMock());

        let bottomSheetTop = 700;

        const bottomSheet = {
            getBoundingClientRect: () => ({
                top: bottomSheetTop,
                right: 1300,
                bottom: 900,
                left: 300,
                width: 1000,
                height: 900 - bottomSheetTop,
                x: 300,
                y: bottomSheetTop,
                toJSON: () => ({}),
            }),
        } as HTMLElement;

        viewport.addOverlay({
            id: 'bottom-sheet',
            element: bottomSheet,
            edge: 'bottom',
        });

        expect(viewport.getPadding().bottom).toBe(200);

        bottomSheetTop = 500;

        viewport.refresh();

        expect(viewport.getPadding().bottom).toBe(400);
    });

    it('rejects overlays without a measurable DOM element', () => {
        const viewport = createMapLibreViewport(createMapMock());

        expect(() => {
            viewport.addOverlay({
                id: 'invalid-overlay',
                element: {} as HTMLElement,
                edge: 'top',
            });
        }).toThrow(
            'Overlay "invalid-overlay" must provide a measurable DOM element.',
        );
    });

    it('rejects maps without getContainer', () => {
        expect(() => {
            createMapLibreViewport({} as MapLibreMap);
        }).toThrow(
            'MapLibre viewport requires a map with a valid getContainer() method.',
        );
    });

    it('rejects maps without a measurable container', () => {
        expect(() => {
            createMapLibreViewport({
                getContainer: () => ({} as HTMLElement),
            } as MapLibreMap);
        }).toThrow(
            'MapLibre viewport requires a measurable map container.',
        );
    });

    it('rejects empty overlay ids', () => {
        const viewport = createMapLibreViewport(createMapMock());

        expect(() => {
            viewport.addOverlay({
                id: '   ',
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
        }).toThrow('Overlay id must not be empty.');
    });

    it('rejects invalid overlay edges at runtime', () => {
        const viewport = createMapLibreViewport(createMapMock());

        expect(() => {
            viewport.addOverlay({
                id: 'invalid-edge',
                element: createElementMock({
                    top: 100,
                    right: 1300,
                    bottom: 180,
                    left: 300,
                    width: 1000,
                    height: 80,
                }),
                // Intentionally bypass TypeScript to simulate a JavaScript consumer.
                edge: 'center' as never,
            });
        }).toThrow(
            'Overlay "invalid-edge" has an invalid edge "center".',
        );
    });

    it('throws when fitCoordinates is called without coordinates', () => {
        const viewport = createMapLibreViewport(createMapMock());

        expect(() => {
            viewport.fitCoordinates([]);
        }).toThrow('At least one coordinate is required.');
    });

    it('throws when coordinates cannot fit into the available map area', () => {
        const viewport = createMapLibreViewport(createMapMock());

        viewport.addOverlay({
            id: 'full-overlay',
            element: createElementMock({
                top: 100,
                right: 1300,
                bottom: 900,
                left: 300,
                width: 1000,
                height: 800,
            }),
            edge: 'bottom',
        });

        expect(() => {
            viewport.fitCoordinates(
                [[13.405, 52.52]],
                {
                    minZoom: 0,
                    maxZoom: 14,
                },
            );
        }).toThrow(
            'Cannot fit coordinates into the available map area.',
        );
    });
});