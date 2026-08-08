import { describe, expect, it } from 'vitest';
import { calculateFreeSpaces } from '../src/free-space';
import type { Rect } from '../src/types';

describe('calculateFreeSpaces', () => {
    it('returns the full padded map area without obstacles', () => {
        expect(
            calculateFreeSpaces(
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
        ).toEqual([
            {
                top: 40,
                right: 960,
                bottom: 760,
                left: 40,
                width: 920,
                height: 720,
            },
        ]);
    });

    it('keeps free space beside a partial bottom obstacle', () => {
        const obstacle: Rect = {
            top: 500,
            right: 1000,
            bottom: 800,
            left: 400,
            width: 600,
            height: 300,
        };

        expect(
            calculateFreeSpaces(
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
        ).toEqual([
            {
                top: 0,
                right: 1000,
                bottom: 500,
                left: 0,
                width: 1000,
                height: 500,
            },
            {
                top: 500,
                right: 400,
                bottom: 800,
                left: 0,
                width: 400,
                height: 300,
            },
        ]);
    });

    it('removes space covered by a full-width bottom obstacle', () => {
        const obstacle: Rect = {
            top: 500,
            right: 1000,
            bottom: 800,
            left: 0,
            width: 1000,
            height: 300,
        };

        expect(
            calculateFreeSpaces(
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
        ).toEqual([
            {
                top: 0,
                right: 1000,
                bottom: 500,
                left: 0,
                width: 1000,
                height: 500,
            },
        ]);
    });

    it('returns an empty list when padding leaves no usable area', () => {
        expect(
            calculateFreeSpaces(
                1000,
                800,
                [],
                {
                    top: 400,
                    right: 500,
                    bottom: 400,
                    left: 500,
                },
            ),
        ).toEqual([]);
    });
});