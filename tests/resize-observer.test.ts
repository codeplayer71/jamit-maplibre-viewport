import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { createMapLibreViewport } from '../src/viewport';

function createElementMock(): HTMLElement {
    return {
        getBoundingClientRect: () => ({
            top: 0,
            right: 1000,
            bottom: 800,
            left: 0,
            width: 1000,
            height: 800,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        }),
    } as HTMLElement;
}

function createMapMock(container: HTMLElement): MapLibreMap {
    return {
        getContainer: () => container,
    } as MapLibreMap;
}

describe('ResizeObserver lifecycle', () => {
    const observe = vi.fn();
    const unobserve = vi.fn();
    const disconnect = vi.fn();
    const requestAnimationFrameMock = vi.fn();
    const cancelAnimationFrameMock = vi.fn();

    let resizeObserverCallback: ResizeObserverCallback;

    beforeEach(() => {
        observe.mockClear();
        unobserve.mockClear();
        disconnect.mockClear();
        requestAnimationFrameMock.mockClear();
        cancelAnimationFrameMock.mockClear();

        requestAnimationFrameMock.mockReturnValue(1);

        vi.stubGlobal(
            'requestAnimationFrame',
            requestAnimationFrameMock,
        );

        vi.stubGlobal(
            'cancelAnimationFrame',
            cancelAnimationFrameMock,
        );

        class ResizeObserverMock {
            constructor(callback: ResizeObserverCallback) {
                resizeObserverCallback = callback;
            }

            observe = observe;
            unobserve = unobserve;
            disconnect = disconnect;
        }

        vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('observes the map container', () => {
        const mapContainer = createElementMock();

        createMapLibreViewport(createMapMock(mapContainer));

        expect(observe).toHaveBeenCalledWith(mapContainer);
    });

    it('observes a registered overlay', () => {
        const mapContainer = createElementMock();
        const overlayElement = createElementMock();
        const viewport = createMapLibreViewport(
            createMapMock(mapContainer),
        );

        viewport.addOverlay({
            id: 'header',
            element: overlayElement,
            edge: 'top',
        });

        expect(observe).toHaveBeenCalledWith(overlayElement);
    });

    it('stops observing a removed overlay', () => {
        const mapContainer = createElementMock();
        const overlayElement = createElementMock();
        const viewport = createMapLibreViewport(
            createMapMock(mapContainer),
        );

        viewport.addOverlay({
            id: 'header',
            element: overlayElement,
            edge: 'top',
        });

        viewport.removeOverlay('header');

        expect(unobserve).toHaveBeenCalledWith(overlayElement);
    });

    it('disconnects the observer on destroy', () => {
        const mapContainer = createElementMock();
        const viewport = createMapLibreViewport(
            createMapMock(mapContainer),
        );

        viewport.destroy();

        expect(disconnect).toHaveBeenCalledOnce();
    });

    it('disconnects only once when destroy is called multiple times', () => {
        const mapContainer = createElementMock();
        const viewport = createMapLibreViewport(
            createMapMock(mapContainer),
        );

        viewport.destroy();
        viewport.destroy();

        expect(disconnect).toHaveBeenCalledOnce();
    });

    it('recalculates geometry after an observed resize', () => {
        const mapContainer = createElementMock();

        let bottomSheetTop = 600;

        const bottomSheet = {
            getBoundingClientRect: () => ({
                top: bottomSheetTop,
                right: 1000,
                bottom: 800,
                left: 0,
                width: 1000,
                height: 800 - bottomSheetTop,
                x: 0,
                y: bottomSheetTop,
                toJSON: () => ({}),
            }),
        } as HTMLElement;

        const viewport = createMapLibreViewport(
            createMapMock(mapContainer),
        );

        viewport.addOverlay({
            id: 'bottom-sheet',
            element: bottomSheet,
            edge: 'bottom',
        });

        expect(viewport.getPadding().bottom).toBe(200);

        bottomSheetTop = 400;

        resizeObserverCallback([], {} as ResizeObserver);

        expect(viewport.getPadding().bottom).toBe(400);
    });

    it('batches multiple resize events into a single animation frame', () => {
        const mapContainer = createElementMock();

        createMapLibreViewport(
            createMapMock(mapContainer),
        );

        resizeObserverCallback([], {} as ResizeObserver);
        resizeObserverCallback([], {} as ResizeObserver);
        resizeObserverCallback([], {} as ResizeObserver);

        expect(requestAnimationFrameMock).toHaveBeenCalledOnce();
    });

    it('cancels a scheduled animation frame on destroy', () => {
        const mapContainer = createElementMock();
        const viewport = createMapLibreViewport(
            createMapMock(mapContainer),
        );

        resizeObserverCallback([], {} as ResizeObserver);

        viewport.destroy();

        expect(cancelAnimationFrameMock).toHaveBeenCalledWith(1);
    });
});