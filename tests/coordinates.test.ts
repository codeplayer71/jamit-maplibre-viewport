import { describe, expect, it } from 'vitest';
import { calculateCoordinateBounds } from '../src/coordinates';

describe('calculateCoordinateBounds', () => {
    it('calculates bounds from multiple coordinates', () => {
        expect(
            calculateCoordinateBounds([
                [13.405, 52.52],
                [13.35, 52.5],
                [13.46, 52.54],
            ]),
        ).toEqual([
            [13.35, 52.5],
            [13.46, 52.54],
        ]);
    });

    it('creates zero-size bounds from a single coordinate', () => {
        expect(
            calculateCoordinateBounds([
                [13.405, 52.52],
            ]),
        ).toEqual([
            [13.405, 52.52],
            [13.405, 52.52],
        ]);
    });

    it('throws when no coordinates are provided', () => {
        expect(() => {
            calculateCoordinateBounds([]);
        }).toThrow('At least one coordinate is required.');
    });
});