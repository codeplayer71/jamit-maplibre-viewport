import { describe, expect, it } from 'vitest';
import {
    arePointsVisible,
    isPointInsideRect,
    isPointObscured,
    isPointVisible,
} from '../src/visibility';
import type { Rect } from '../src/types';

const obstacle: Rect = {
    top: 500,
    right: 1000,
    bottom: 800,
    left: 400,
    width: 600,
    height: 300,
};

describe('isPointInsideRect', () => {
    it('returns true for a point inside the rect', () => {
        expect(
            isPointInsideRect(
                {
                    x: 600,
                    y: 650,
                },
                obstacle,
            ),
        ).toBe(true);
    });

    it('returns true for a point on the rect boundary', () => {
        expect(
            isPointInsideRect(
                {
                    x: 400,
                    y: 500,
                },
                obstacle,
            ),
        ).toBe(true);
    });

    it('returns false for a point outside the rect', () => {
        expect(
            isPointInsideRect(
                {
                    x: 200,
                    y: 650,
                },
                obstacle,
            ),
        ).toBe(false);
    });
});

describe('isPointObscured', () => {
    it('returns true when a point is inside any obstacle', () => {
        expect(
            isPointObscured(
                {
                    x: 600,
                    y: 650,
                },
                [
                    {
                        top: 0,
                        right: 300,
                        bottom: 800,
                        left: 0,
                        width: 300,
                        height: 800,
                    },
                    obstacle,
                ],
            ),
        ).toBe(true);
    });

    it('returns false when a point is outside all obstacles', () => {
        expect(
            isPointObscured(
                {
                    x: 350,
                    y: 400,
                },
                [obstacle],
            ),
        ).toBe(false);
    });

    it('returns false when no obstacles exist', () => {
        expect(
            isPointObscured(
                {
                    x: 600,
                    y: 650,
                },
                [],
            ),
        ).toBe(false);
    });
});

describe('isPointVisible', () => {
    it('returns true for a point inside the usable map area', () => {
        expect(
            isPointVisible(
                {
                    x: 350,
                    y: 300,
                },
                1000,
                800,
                [],
                {
                    top: 40,
                    right: 40,
                    bottom: 40,
                    left: 40,
                },
            ),
        ).toBe(true);
    });

    it('returns false when a point is inside an obstacle', () => {
        expect(
            isPointVisible(
                {
                    x: 600,
                    y: 650,
                },
                1000,
                800,
                [obstacle],
                {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            ),
        ).toBe(false);
    });

    it('returns false when a point violates consumer padding', () => {
        expect(
            isPointVisible(
                {
                    x: 20,
                    y: 300,
                },
                1000,
                800,
                [],
                {
                    top: 40,
                    right: 40,
                    bottom: 40,
                    left: 40,
                },
            ),
        ).toBe(false);
    });

    it('allows a point beside a partial bottom obstacle', () => {
        expect(
            isPointVisible(
                {
                    x: 200,
                    y: 700,
                },
                1000,
                800,
                [obstacle],
                {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            ),
        ).toBe(true);
    });
});

describe('arePointsVisible', () => {
    it('returns true when all points are visible', () => {
        expect(
            arePointsVisible(
                [
                    { x: 200, y: 200 },
                    { x: 350, y: 400 },
                    { x: 200, y: 700 },
                ],
                1000,
                800,
                [obstacle],
                {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            ),
        ).toBe(true);
    });

    it('returns false when one point is obscured', () => {
        expect(
            arePointsVisible(
                [
                    { x: 200, y: 200 },
                    { x: 600, y: 650 },
                    { x: 200, y: 700 },
                ],
                1000,
                800,
                [obstacle],
                {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            ),
        ).toBe(false);
    });

    it('returns false when one point violates padding', () => {
        expect(
            arePointsVisible(
                [
                    { x: 20, y: 200 },
                    { x: 350, y: 400 },
                ],
                1000,
                800,
                [],
                {
                    top: 40,
                    right: 40,
                    bottom: 40,
                    left: 40,
                },
            ),
        ).toBe(false);
    });
});