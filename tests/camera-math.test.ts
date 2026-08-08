import { describe, expect, it } from 'vitest';
import {
    calculateClosestValidTranslation,
    calculateForbiddenTranslationRect,
    calculatePreferredTranslation,
    calculateTranslationBounds,
    calculateValidTranslationSpaces,
    calculateWorldPixelBounds,
    getWorldSize,
    mercatorToWorldPixels,
    translateWorldPixelPoints,
} from '../src/camera-math';

describe('getWorldSize', () => {
    it('returns 512 pixels at zoom 0', () => {
        expect(getWorldSize(0)).toBe(512);
    });

    it('doubles the world size for every zoom level', () => {
        expect(getWorldSize(1)).toBe(1024);
        expect(getWorldSize(2)).toBe(2048);
        expect(getWorldSize(3)).toBe(4096);
    });
});

describe('mercatorToWorldPixels', () => {
    it('converts the world center at zoom 0', () => {
        expect(
            mercatorToWorldPixels(
                {
                    x: 0.5,
                    y: 0.5,
                },
                0,
            ),
        ).toEqual({
            x: 256,
            y: 256,
        });
    });

    it('scales coordinates according to the zoom level', () => {
        expect(
            mercatorToWorldPixels(
                {
                    x: 0.25,
                    y: 0.75,
                },
                2,
            ),
        ).toEqual({
            x: 512,
            y: 1536,
        });
    });
});

describe('calculateWorldPixelBounds', () => {
    it('calculates bounds for multiple Mercator points', () => {
        expect(
            calculateWorldPixelBounds(
                [
                    { x: 0.25, y: 0.25 },
                    { x: 0.5, y: 0.75 },
                    { x: 0.75, y: 0.5 },
                ],
                0,
            ),
        ).toEqual({
            top: 128,
            right: 384,
            bottom: 384,
            left: 128,
            width: 256,
            height: 256,
        });
    });

    it('returns zero-size bounds for a single point', () => {
        expect(
            calculateWorldPixelBounds(
                [
                    { x: 0.5, y: 0.5 },
                ],
                0,
            ),
        ).toEqual({
            top: 256,
            right: 256,
            bottom: 256,
            left: 256,
            width: 0,
            height: 0,
        });
    });

    it('throws when no points are provided', () => {
        expect(() => {
            calculateWorldPixelBounds([], 0);
        }).toThrow('At least one Mercator point is required.');
    });
});

describe('calculateTranslationBounds', () => {
    it('calculates the valid translation range', () => {
        expect(
            calculateTranslationBounds(
                {
                    top: 100,
                    right: 500,
                    bottom: 400,
                    left: 200,
                    width: 300,
                    height: 300,
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
            top: -60,
            right: 460,
            bottom: 360,
            left: -160,
            width: 620,
            height: 420,
        });
    });

    it('returns null when the points cannot fit horizontally', () => {
        expect(
            calculateTranslationBounds(
                {
                    top: 100,
                    right: 950,
                    bottom: 400,
                    left: 0,
                    width: 950,
                    height: 300,
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
        ).toBeNull();
    });

    it('returns null when the points cannot fit vertically', () => {
        expect(
            calculateTranslationBounds(
                {
                    top: 0,
                    right: 500,
                    bottom: 750,
                    left: 200,
                    width: 300,
                    height: 750,
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
        ).toBeNull();
    });
});

describe('translateWorldPixelPoints', () => {
    it('translates all points by the given offset', () => {
        expect(
            translateWorldPixelPoints(
                [
                    { x: 100, y: 200 },
                    { x: 300, y: 400 },
                ],
                50,
                -25,
            ),
        ).toEqual([
            { x: 150, y: 175 },
            { x: 350, y: 375 },
        ]);
    });

    it('does not mutate the original points', () => {
        const points = [
            { x: 100, y: 200 },
        ];

        translateWorldPixelPoints(points, 50, 50);

        expect(points).toEqual([
            { x: 100, y: 200 },
        ]);
    });
});

describe('calculateForbiddenTranslationRect', () => {
    it('calculates translations that would move a point into an obstacle', () => {
        expect(
            calculateForbiddenTranslationRect(
                {
                    x: 200,
                    y: 300,
                },
                {
                    top: 500,
                    right: 1000,
                    bottom: 800,
                    left: 400,
                    width: 600,
                    height: 300,
                },
            ),
        ).toEqual({
            top: 200,
            right: 800,
            bottom: 500,
            left: 200,
            width: 600,
            height: 300,
        });
    });

    it('supports negative translation ranges', () => {
        expect(
            calculateForbiddenTranslationRect(
                {
                    x: 600,
                    y: 650,
                },
                {
                    top: 500,
                    right: 1000,
                    bottom: 800,
                    left: 400,
                    width: 600,
                    height: 300,
                },
            ),
        ).toEqual({
            top: -150,
            right: 400,
            bottom: 150,
            left: -200,
            width: 600,
            height: 300,
        });
    });
});

describe('calculateClosestValidTranslation', () => {
    it('returns the preferred translation when it is inside a valid space', () => {
        expect(
            calculateClosestValidTranslation(
                {
                    x: 200,
                    y: 200,
                },
                [
                    {
                        top: 0,
                        right: 400,
                        bottom: 400,
                        left: 0,
                        width: 400,
                        height: 400,
                    },
                ],
            ),
        ).toEqual({
            x: 200,
            y: 200,
        });
    });

    it('returns the closest point inside the valid spaces', () => {
        expect(
            calculateClosestValidTranslation(
                {
                    x: 500,
                    y: 500,
                },
                [
                    {
                        top: 0,
                        right: 300,
                        bottom: 300,
                        left: 0,
                        width: 300,
                        height: 300,
                    },
                ],
            ),
        ).toEqual({
            x: 300,
            y: 300,
        });
    });

    it('selects the closest valid space', () => {
        expect(
            calculateClosestValidTranslation(
                {
                    x: 500,
                    y: 500,
                },
                [
                    {
                        top: 0,
                        right: 200,
                        bottom: 200,
                        left: 0,
                        width: 200,
                        height: 200,
                    },
                    {
                        top: 400,
                        right: 800,
                        bottom: 800,
                        left: 600,
                        width: 200,
                        height: 400,
                    },
                ],
            ),
        ).toEqual({
            x: 600,
            y: 500,
        });
    });

    it('returns null when no valid spaces exist', () => {
        expect(
            calculateClosestValidTranslation(
                {
                    x: 200,
                    y: 200,
                },
                [],
            ),
        ).toBeNull();
    });
});

describe('calculateValidTranslationSpaces', () => {
    it('keeps translation space that does not move points into obstacles', () => {
        expect(
            calculateValidTranslationSpaces(
                [
                    { x: 200, y: 300 },
                ],
                {
                    top: -100,
                    right: 500,
                    bottom: 500,
                    left: -100,
                    width: 600,
                    height: 600,
                },
                [
                    {
                        top: 500,
                        right: 1000,
                        bottom: 800,
                        left: 400,
                        width: 600,
                        height: 300,
                    },
                ],
            ),
        ).toEqual([
            {
                top: -100,
                right: 500,
                bottom: 200,
                left: -100,
                width: 600,
                height: 300,
            },
            {
                top: 200,
                right: 200,
                bottom: 500,
                left: -100,
                width: 300,
                height: 300,
            },
        ]);
    });

    it('returns the original translation space without obstacles', () => {
        const translationBounds = {
            top: -100,
            right: 500,
            bottom: 500,
            left: -100,
            width: 600,
            height: 600,
        };

        expect(
            calculateValidTranslationSpaces(
                [
                    { x: 200, y: 300 },
                ],
                translationBounds,
                [],
            ),
        ).toEqual([
            translationBounds,
        ]);
    });

    it('returns an empty list when all translation space is forbidden', () => {
        expect(
            calculateValidTranslationSpaces(
                [
                    { x: 200, y: 300 },
                ],
                {
                    top: 200,
                    right: 800,
                    bottom: 500,
                    left: 200,
                    width: 600,
                    height: 300,
                },
                [
                    {
                        top: 500,
                        right: 1000,
                        bottom: 800,
                        left: 400,
                        width: 600,
                        height: 300,
                    },
                ],
            ),
        ).toEqual([]);
    });
});

describe('calculatePreferredTranslation', () => {
    it('returns the center of the translation bounds', () => {
        expect(
            calculatePreferredTranslation({
                top: -100,
                right: 500,
                bottom: 500,
                left: -100,
                width: 600,
                height: 600,
            }),
        ).toEqual({
            x: 200,
            y: 200,
        });
    });

    it('supports asymmetric translation bounds', () => {
        expect(
            calculatePreferredTranslation({
                top: -50,
                right: 700,
                bottom: 350,
                left: 100,
                width: 600,
                height: 400,
            }),
        ).toEqual({
            x: 400,
            y: 150,
        });
    });
});