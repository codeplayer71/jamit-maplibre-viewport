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

    it('finds a valid camera with a sidebar and partial bottom panel', () => {
        const points = [
            projectToMercator(13.405, 52.52),
            projectToMercator(13.35, 52.5),
            projectToMercator(13.46, 52.54),
        ];

        const candidate = calculateFitCoordinatesCandidate(
            points,
            10,
            1200,
            800,
            [
                {
                    top: 40,
                    right: 360,
                    bottom: 800,
                    left: 0,
                    width: 360,
                    height: 760,
                },
                {
                    top: 556,
                    right: 1200,
                    bottom: 800,
                    left: 304,
                    width: 896,
                    height: 244,
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

    it('handles overlapping obstacles', () => {
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
                    top: 0,
                    right: 300,
                    bottom: 800,
                    left: 0,
                    width: 300,
                    height: 800,
                },
                {
                    top: 500,
                    right: 1000,
                    bottom: 800,
                    left: 250,
                    width: 750,
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

    it('fits a single coordinate', () => {
        const point = projectToMercator(13.405, 52.52);

        const candidate = findFitCoordinatesCandidate(
            [point],
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
        expect(candidate?.zoom).toBe(14);
        expect(candidate?.center[0]).toBeCloseTo(13.405, 5);
        expect(candidate?.center[1]).toBeCloseTo(52.52, 5);
    });

    it('reduces the zoom when obstacles limit the available space', () => {
        const points = [
            projectToMercator(13.405, 52.52),
            projectToMercator(13.35, 52.5),
            projectToMercator(13.46, 52.54),
        ];

        const withoutObstacle = findFitCoordinatesCandidate(
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

        const withObstacle = findFitCoordinatesCandidate(
            points,
            1000,
            800,
            [
                {
                    top: 400,
                    right: 1000,
                    bottom: 800,
                    left: 0,
                    width: 1000,
                    height: 400,
                },
            ],
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

        expect(withoutObstacle).not.toBeNull();
        expect(withObstacle).not.toBeNull();

        expect(withObstacle!.zoom).toBeLessThan(
            withoutObstacle!.zoom,
        );
    });

    it('reduces the zoom when additional padding limits the available space', () => {
        const points = [
            projectToMercator(13.405, 52.52),
            projectToMercator(13.35, 52.5),
            projectToMercator(13.46, 52.54),
        ];

        const withoutPadding = findFitCoordinatesCandidate(
            points,
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
                zoomStep: 0.1,
            },
        );

        const withPadding = findFitCoordinatesCandidate(
            points,
            1000,
            800,
            [],
            {
                top: 160,
                right: 160,
                bottom: 160,
                left: 160,
            },
            {
                minZoom: 0,
                maxZoom: 14,
                zoomStep: 0.1,
            },
        );

        expect(withoutPadding).not.toBeNull();
        expect(withPadding).not.toBeNull();

        expect(withPadding!.zoom).toBeLessThan(
            withoutPadding!.zoom,
        );
    });

    it('finds a lower zoom for a very small map viewport', () => {
        const points = [
            projectToMercator(13.405, 52.52),
            projectToMercator(13.35, 52.5),
            projectToMercator(13.46, 52.54),
        ];

        const candidate = findFitCoordinatesCandidate(
            points,
            220,
            180,
            [],
            {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
            {
                minZoom: 0,
                maxZoom: 14,
                zoomStep: 0.1,
            },
        );

        expect(candidate).not.toBeNull();
        expect(candidate!.zoom).toBeLessThan(14);
        expect(candidate!.zoom).toBeGreaterThanOrEqual(0);
    });

    it('supports a fixed zoom level', () => {
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
                minZoom: 10,
                maxZoom: 10,
            },
        );

        expect(candidate).not.toBeNull();
        expect(candidate?.zoom).toBe(10);
    });

    it('fits coordinates near the Web Mercator latitude limit', () => {
        const points = [
            projectToMercator(10, 84.9),
            projectToMercator(10.2, 84.95),
            projectToMercator(9.8, 84.85),
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
        expect(candidate!.zoom).toBeGreaterThanOrEqual(0);
        expect(candidate!.zoom).toBeLessThanOrEqual(14);
        expect(Number.isFinite(candidate!.center[0])).toBe(true);
        expect(Number.isFinite(candidate!.center[1])).toBe(true);
    });
});