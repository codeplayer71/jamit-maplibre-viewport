import { describe, expect, it } from 'vitest';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { createMapLibreViewport } from '../src/viewport';

function createMapMock(): MapLibreMap {
    return {} as MapLibreMap;
}

function createElementMock(): HTMLElement {
    return {} as HTMLElement;
}

describe('createMapLibreViewport', () => {
    it('registers an overlay', () => {
        const viewport = createMapLibreViewport(createMapMock());

        expect(() => {
            viewport.addOverlay({
                id: 'header',
                element: createElementMock(),
                edge: 'top',
            });
        }).not.toThrow();
    });

    it('throws when an overlay id is already registered', () => {
        const viewport = createMapLibreViewport(createMapMock());

        viewport.addOverlay({
            id: 'header',
            element: createElementMock(),
            edge: 'top',
        });

        expect(() => {
            viewport.addOverlay({
                id: 'header',
                element: createElementMock(),
                edge: 'bottom',
            });
        }).toThrow('Overlay with id "header" is already registered.');
    });

    it('allows an overlay id to be registered again after removal', () => {
        const viewport = createMapLibreViewport(createMapMock());

        viewport.addOverlay({
            id: 'header',
            element: createElementMock(),
            edge: 'top',
        });

        viewport.removeOverlay('header');

        expect(() => {
            viewport.addOverlay({
                id: 'header',
                element: createElementMock(),
                edge: 'top',
            });
        }).not.toThrow();
    });
});