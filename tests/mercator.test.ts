import { describe, expect, it } from 'vitest';
import {
    projectToMercator,
    unprojectFromMercator,
} from '../src/mercator';

describe('projectToMercator', () => {
    it('projects the world center correctly', () => {
        expect(projectToMercator(0, 0)).toEqual({
            x: 0.5,
            y: 0.5,
        });
    });

    it('projects longitude linearly', () => {
        expect(projectToMercator(-180, 0).x).toBe(0);
        expect(projectToMercator(180, 0).x).toBe(1);
    });

    it('projects northern latitudes above the equator', () => {
        const equator = projectToMercator(0, 0);
        const north = projectToMercator(0, 52.52);

        expect(north.y).toBeLessThan(equator.y);
    });

    it('projects southern latitudes below the equator', () => {
        const equator = projectToMercator(0, 0);
        const south = projectToMercator(0, -52.52);

        expect(south.y).toBeGreaterThan(equator.y);
    });

    it('clamps latitudes to the Web Mercator limit', () => {
        const maximum = projectToMercator(0, 85.051129);
        const aboveMaximum = projectToMercator(0, 90);

        expect(aboveMaximum.y).toBeCloseTo(maximum.y);
    });
});

describe('unprojectFromMercator', () => {
    it('unprojects the world center correctly', () => {
        expect(unprojectFromMercator(0.5, 0.5)).toEqual([
            0,
            0,
        ]);
    });

    it('round-trips geographic coordinates', () => {
        const coordinates: [number, number] = [
            13.405,
            52.52,
        ];

        const projected = projectToMercator(...coordinates);
        const unprojected = unprojectFromMercator(
            projected.x,
            projected.y,
        );

        expect(unprojected[0]).toBeCloseTo(coordinates[0]);
        expect(unprojected[1]).toBeCloseTo(coordinates[1]);
    });
});