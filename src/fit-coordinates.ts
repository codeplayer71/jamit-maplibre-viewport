import {
    calculateClosestValidTranslation,
    calculatePreferredTranslation,
    calculateTranslationBounds,
    calculateValidTranslationSpaces,
    calculateWorldPixelBounds,
    getWorldSize,
    mercatorToWorldPixels,
} from './camera-math';
import {
    unprojectFromMercator,
    type MercatorPoint,
} from './mercator';
import type {
    Rect,
    ViewportPadding,
} from './types';

export type FitCoordinatesCandidate = {
    center: [number, number];
    zoom: number;
};

export function calculateFitCoordinatesCandidate(
    points: MercatorPoint[],
    zoom: number,
    mapWidth: number,
    mapHeight: number,
    obstacles: Rect[],
    padding: ViewportPadding,
): FitCoordinatesCandidate | null {
    const worldPixelPoints = points.map((point) =>
        mercatorToWorldPixels(point, zoom),
    );

    const worldPixelBounds = calculateWorldPixelBounds(
        points,
        zoom,
    );

    const translationBounds = calculateTranslationBounds(
        worldPixelBounds,
        mapWidth,
        mapHeight,
        padding,
    );

    if (!translationBounds) {
        return null;
    }

    const validSpaces = calculateValidTranslationSpaces(
        worldPixelPoints,
        translationBounds,
        obstacles,
    );

    const preferredTranslation =
        calculatePreferredTranslation(translationBounds);

    const translation = calculateClosestValidTranslation(
        preferredTranslation,
        validSpaces,
    );

    if (!translation) {
        return null;
    }

    const worldSize = getWorldSize(zoom);

    const centerWorldX =
        mapWidth / 2 - translation.x;

    const centerWorldY =
        mapHeight / 2 - translation.y;

    const center = unprojectFromMercator(
        centerWorldX / worldSize,
        centerWorldY / worldSize,
    );

    return {
        center,
        zoom,
    };
}

export type FindFitCoordinatesCandidateOptions = {
    minZoom: number;
    maxZoom: number;
    zoomStep?: number;
};

export function findFitCoordinatesCandidate(
    points: MercatorPoint[],
    mapWidth: number,
    mapHeight: number,
    obstacles: Rect[],
    padding: ViewportPadding,
    options: FindFitCoordinatesCandidateOptions,
): FitCoordinatesCandidate | null {
    const {
        minZoom,
        maxZoom,
        zoomStep = 0.1,
    } = options;

    if (zoomStep <= 0) {
        throw new Error('zoomStep must be greater than 0.');
    }

    if (minZoom > maxZoom) {
        throw new Error('minZoom must not be greater than maxZoom.');
    }

    for (
        let zoom = maxZoom;
        zoom >= minZoom;
        zoom -= zoomStep
    ) {
        const candidate = calculateFitCoordinatesCandidate(
            points,
            zoom,
            mapWidth,
            mapHeight,
            obstacles,
            padding,
        );

        if (candidate) {
            return candidate;
        }
    }

    return null;
}