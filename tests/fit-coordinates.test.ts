import { describe, expect, it } from 'vitest';
import {
    calculateFitCoordinatesCandidate,
    findFitCoordinatesCandidate,
} from '../src/fit-coordinates';
import { projectToMercator } from '../src/mercator';

describe('calculateFitCoordinatesCandidate', () => {
    it('returns a camera candidate when all points fit', () => {
        const points = [
            projectToMercator(13.405, 52.52),
            projectToMercator(13.35, 52.5),
            projectToMercator(13.46, 52.54),
        ];

        const candidate = calculateFitCoordinatesCandidate(
            points,
            10,
            1000,
            800,
            [],
            {
                top: 40,
                right: 40,
                bottom: 40,
                left: 40,
            },
        );

        expect(candidate).not.toBeNull();
        expect(candidate?.zoom).toBe(10);
    });

    it('returns null when the points do not fit at the given zoom', () => {
        const points = [
            projectToMercator(-170, 0),
            projectToMercator(170, 0),
        ];

        const candidate = calculateFitCoordinatesCandidate(
            points,
            10,
            1000,
            800,
            [],
            {
                top: 40,
                right: 40,
                bottom: 40,
                left: 40,
            },
        );

        expect(candidate).toBeNull();
    });

    it('finds a valid center beside a partial obstacle', () => {
        const points = [
            projectToMercator(13.405, 52.52),
            projectToMercator(13.35, 52.5),
            projectToMercator(13.46, 52.54),
        ];

        const candidate = calculateFitCoordinatesCandidate(
            points,
            10,
            1000,
            800,
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
            {
                top: 40,
                right: 40,
                bottom: 40,
                left: 40,
            },
        );

        expect(candidate).not.toBeNull();
        expect(candidate?.zoom).toBe(10);
    });
});

describe('findFitCoordinatesCandidate', () => {
    it('returns the highest fitting zoom level', () => {
        const points = [
            projectToMercator(13.405, 52.52),
            projectToMercator(13.35, 52.5),
            projectToMercator(13.46, 52.54),
        ];

        const candidate = findFitCoordinatesCandidate(
            points,
            1000,
            800,
            [],
            {
                top: 40,
                right: 40,
                bottom: 40,
                left: 40,
            },
            {
                minZoom: 0,
                maxZoom: 14,
                zoomStep: 0.1,
            },
        );

        expect(candidate).not.toBeNull();
        expect(candidate!.zoom).toBeLessThanOrEqual(14);
        expect(candidate!.zoom).toBeGreaterThan(0);
    });

    it('respects maxZoom', () => {
        const points = [
            projectToMercator(13.405, 52.52),
        ];

        const candidate = findFitCoordinatesCandidate(
            points,
            1000,
            800,
            [],
            {
                top: 40,
                right: 40,
                bottom: 40,
                left: 40,
            },
            {
                minZoom: 0,
                maxZoom: 12,
            },
        );

        expect(candidate?.zoom).toBe(12);
    });

    it('returns null when no zoom level can fit', () => {
        const points = [
            projectToMercator(-170, 0),
            projectToMercator(170, 0),
        ];

        const candidate = findFitCoordinatesCandidate(
            points,
            100,
            100,
            [],
            {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50,
            },
            {
                minZoom: 0,
                maxZoom: 14,
            },
        );

        expect(candidate).toBeNull();
    });

    it('rejects an invalid zoom step', () => {
        expect(() => {
            findFitCoordinatesCandidate(
                [projectToMercator(13.405, 52.52)],
                1000,
                800,
                [],
                {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
                {
                    minZoom: 0,
                    maxZoom: 14,
                    zoomStep: 0,
                },
            );
        }).toThrow('zoomStep must be greater than 0.');
    });

    it('rejects minZoom greater than maxZoom', () => {
        expect(() => {
            findFitCoordinatesCandidate(
                [projectToMercator(13.405, 52.52)],
                1000,
                800,
                [],
                {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
                {
                    minZoom: 15,
                    maxZoom: 14,
                },
            );
        }).toThrow('minZoom must not be greater than maxZoom.');
    });
});