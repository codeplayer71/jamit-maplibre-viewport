import { describe, expect, it } from 'vitest';
import {
    calculatePadding,
    calculateSafeArea,
} from '../src/geometry';
import type { Rect } from '../src/types';

const mapRect: Rect = {
    top: 100,
    right: 1300,
    bottom: 900,
    left: 300,
    width: 1000,
    height: 800,
};

describe('calculatePadding', () => {
    it('returns zero padding without overlays', () => {
        expect(calculatePadding(mapRect, [])).toEqual({
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        });
    });

    it('calculates top padding from the map intersection', () => {
        const padding = calculatePadding(mapRect, [
            {
                edge: 'top',
                rect: {
                    top: 0,
                    right: 1920,
                    bottom: 180,
                    left: 0,
                    width: 1920,
                    height: 180,
                },
            },
        ]);

        expect(padding).toEqual({
            top: 80,
            right: 0,
            bottom: 0,
            left: 0,
        });
    });

    it('calculates right padding', () => {
        const padding = calculatePadding(mapRect, [
            {
                edge: 'right',
                rect: {
                    top: 100,
                    right: 1300,
                    bottom: 900,
                    left: 1100,
                    width: 200,
                    height: 800,
                },
            },
        ]);

        expect(padding.right).toBe(200);
    });

    it('calculates bottom padding', () => {
        const padding = calculatePadding(mapRect, [
            {
                edge: 'bottom',
                rect: {
                    top: 600,
                    right: 1300,
                    bottom: 900,
                    left: 300,
                    width: 1000,
                    height: 300,
                },
            },
        ]);

        expect(padding.bottom).toBe(300);
    });

    it('calculates left padding', () => {
        const padding = calculatePadding(mapRect, [
            {
                edge: 'left',
                rect: {
                    top: 100,
                    right: 650,
                    bottom: 900,
                    left: 300,
                    width: 350,
                    height: 800,
                },
            },
        ]);

        expect(padding.left).toBe(350);
    });

    it('uses the largest overlay on the same edge', () => {
        const padding = calculatePadding(mapRect, [
            {
                edge: 'top',
                rect: {
                    top: 100,
                    right: 1300,
                    bottom: 180,
                    left: 300,
                    width: 1000,
                    height: 80,
                },
            },
            {
                edge: 'top',
                rect: {
                    top: 100,
                    right: 1300,
                    bottom: 220,
                    left: 300,
                    width: 1000,
                    height: 120,
                },
            },
        ]);

        expect(padding.top).toBe(120);
    });

    it('ignores overlays outside the map', () => {
        const padding = calculatePadding(mapRect, [
            {
                edge: 'left',
                rect: {
                    top: 100,
                    right: 200,
                    bottom: 900,
                    left: 0,
                    width: 200,
                    height: 800,
                },
            },
        ]);

        expect(padding).toEqual({
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        });
    });

    it('ignores zero-size overlays', () => {
        const padding = calculatePadding(mapRect, [
            {
                edge: 'top',
                rect: {
                    top: 100,
                    right: 300,
                    bottom: 100,
                    left: 300,
                    width: 0,
                    height: 0,
                },
            },
        ]);

        expect(padding).toEqual({
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        });
    });
});

describe('calculateSafeArea', () => {
    it('calculates the map-local safe area', () => {
        const safeArea = calculateSafeArea(mapRect, {
            top: 80,
            right: 40,
            bottom: 300,
            left: 350,
        });

        expect(safeArea).toEqual({
            x: 350,
            y: 80,
            width: 610,
            height: 420,
        });
    });

    it('never returns negative dimensions', () => {
        const safeArea = calculateSafeArea(mapRect, {
            top: 500,
            right: 600,
            bottom: 500,
            left: 600,
        });

        expect(safeArea).toEqual({
            x: 600,
            y: 500,
            width: 0,
            height: 0,
        });
    });
});