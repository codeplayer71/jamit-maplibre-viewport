import { describe, expect, it } from 'vitest';
import {
    calculateMapLocalObstacle,
    expandObstacle,
} from '../src/obstacles';
import type { Rect } from '../src/types';

const mapRect: Rect = {
    top: 100,
    right: 1300,
    bottom: 900,
    left: 300,
    width: 1000,
    height: 800,
};

describe('calculateMapLocalObstacle', () => {
    it('converts an overlapping overlay into map-local coordinates', () => {
        expect(
            calculateMapLocalObstacle(mapRect, {
                top: 600,
                right: 1300,
                bottom: 900,
                left: 700,
                width: 600,
                height: 300,
            }),
        ).toEqual({
            top: 500,
            right: 1000,
            bottom: 800,
            left: 400,
            width: 600,
            height: 300,
        });
    });

    it('clips an overlay to the map bounds', () => {
        expect(
            calculateMapLocalObstacle(mapRect, {
                top: 50,
                right: 1400,
                bottom: 200,
                left: 200,
                width: 1200,
                height: 150,
            }),
        ).toEqual({
            top: 0,
            right: 1000,
            bottom: 100,
            left: 0,
            width: 1000,
            height: 100,
        });
    });

    it('returns null when the overlay is outside the map', () => {
        expect(
            calculateMapLocalObstacle(mapRect, {
                top: 100,
                right: 200,
                bottom: 900,
                left: 0,
                width: 200,
                height: 800,
            }),
        ).toBeNull();
    });

    it('returns null for a zero-size intersection', () => {
        expect(
            calculateMapLocalObstacle(mapRect, {
                top: 900,
                right: 1300,
                bottom: 900,
                left: 300,
                width: 1000,
                height: 0,
            }),
        ).toBeNull();
    });
});

describe('expandObstacle', () => {
    it('expands an obstacle by the provided padding', () => {
        expect(
            expandObstacle(
                {
                    top: 500,
                    right: 1000,
                    bottom: 800,
                    left: 400,
                    width: 600,
                    height: 300,
                },
                1200,
                900,
                {
                    top: 40,
                    right: 40,
                    bottom: 40,
                    left: 40,
                },
            ),
        ).toEqual({
            top: 460,
            right: 1040,
            bottom: 840,
            left: 360,
            width: 680,
            height: 380,
        });
    });

    it('clips the expanded obstacle to the map bounds', () => {
        expect(
            expandObstacle(
                {
                    top: 20,
                    right: 980,
                    bottom: 780,
                    left: 20,
                    width: 960,
                    height: 760,
                },
                1000,
                800,
                {
                    top: 40,
                    right: 40,
                    bottom: 40,
                    left: 40,
                },
            ),
        ).toEqual({
            top: 0,
            right: 1000,
            bottom: 800,
            left: 0,
            width: 1000,
            height: 800,
        });
    });
});