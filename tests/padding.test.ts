import { describe, expect, it } from 'vitest';
import {
    addPadding,
    normalizePadding,
} from '../src/padding';

describe('normalizePadding', () => {
    it('normalizes numeric padding', () => {
        expect(normalizePadding(40)).toEqual({
            top: 40,
            right: 40,
            bottom: 40,
            left: 40,
        });
    });

    it('normalizes partial padding', () => {
        expect(
            normalizePadding({
                left: 40,
                right: 20,
            }),
        ).toEqual({
            top: 0,
            right: 20,
            bottom: 0,
            left: 40,
        });
    });

    it('returns zero padding by default', () => {
        expect(normalizePadding()).toEqual({
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        });
    });

    it('rejects negative padding', () => {
        expect(() => normalizePadding(-1)).toThrow(
            'Viewport padding values must be finite numbers greater than or equal to 0.',
        );
    });

    it('rejects NaN padding', () => {
        expect(() => normalizePadding(Number.NaN)).toThrow(
            'Viewport padding values must be finite numbers greater than or equal to 0.',
        );
    });

    it('rejects infinite padding', () => {
        expect(() => normalizePadding(Number.POSITIVE_INFINITY)).toThrow(
            'Viewport padding values must be finite numbers greater than or equal to 0.',
        );
    });
});

describe('addPadding', () => {
    it('adds numeric padding to all edges', () => {
        expect(
            addPadding(
                {
                    top: 80,
                    right: 0,
                    bottom: 300,
                    left: 350,
                },
                40,
            ),
        ).toEqual({
            top: 120,
            right: 40,
            bottom: 340,
            left: 390,
        });
    });

    it('adds partial padding only to specified edges', () => {
        expect(
            addPadding(
                {
                    top: 80,
                    right: 0,
                    bottom: 300,
                    left: 350,
                },
                {
                    left: 40,
                    right: 40,
                },
            ),
        ).toEqual({
            top: 80,
            right: 40,
            bottom: 300,
            left: 390,
        });
    });
});