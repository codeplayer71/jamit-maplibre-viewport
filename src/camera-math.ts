import type { MercatorPoint } from './mercator';
import type {
    Rect,
    ViewportPadding,
} from './types';
import { subtractRect } from './rect';

const TILE_SIZE = 512;

export type WorldPixelPoint = {
    x: number;
    y: number;
};

export type WorldPixelBounds = {
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
};

export function getWorldSize(zoom: number): number {
    return TILE_SIZE * 2 ** zoom;
}

export function mercatorToWorldPixels(
    point: MercatorPoint,
    zoom: number,
): WorldPixelPoint {
    const worldSize = getWorldSize(zoom);

    return {
        x: point.x * worldSize,
        y: point.y * worldSize,
    };
}

export function calculateWorldPixelBounds(
    points: MercatorPoint[],
    zoom: number,
): WorldPixelBounds {
    const firstPoint = points[0];

    if (!firstPoint) {
        throw new Error('At least one Mercator point is required.');
    }

    const firstPixel = mercatorToWorldPixels(
        firstPoint,
        zoom,
    );

    let left = firstPixel.x;
    let right = firstPixel.x;
    let top = firstPixel.y;
    let bottom = firstPixel.y;

    for (const point of points.slice(1)) {
        const pixel = mercatorToWorldPixels(point, zoom);

        left = Math.min(left, pixel.x);
        right = Math.max(right, pixel.x);
        top = Math.min(top, pixel.y);
        bottom = Math.max(bottom, pixel.y);
    }

    return {
        top,
        right,
        bottom,
        left,
        width: right - left,
        height: bottom - top,
    };
}

export function calculateTranslationBounds(
    bounds: WorldPixelBounds,
    mapWidth: number,
    mapHeight: number,
    padding: ViewportPadding,
): Rect | null {
    const left = padding.left - bounds.left;
    const right =
        mapWidth - padding.right - bounds.right;

    const top = padding.top - bounds.top;
    const bottom =
        mapHeight - padding.bottom - bounds.bottom;

    const width = right - left;
    const height = bottom - top;

    if (width < 0 || height < 0) {
        return null;
    }

    return {
        top,
        right,
        bottom,
        left,
        width,
        height,
    };
}

export function translateWorldPixelPoints(
    points: WorldPixelPoint[],
    translationX: number,
    translationY: number,
): WorldPixelPoint[] {
    return points.map((point) => ({
        x: point.x + translationX,
        y: point.y + translationY,
    }));
}

export function calculateForbiddenTranslationRect(
    point: WorldPixelPoint,
    obstacle: Rect,
): Rect {
    const left = obstacle.left - point.x;
    const right = obstacle.right - point.x;
    const top = obstacle.top - point.y;
    const bottom = obstacle.bottom - point.y;

    return {
        top,
        right,
        bottom,
        left,
        width: right - left,
        height: bottom - top,
    };
}

export function calculateValidTranslationSpaces(
    points: WorldPixelPoint[],
    translationBounds: Rect,
    obstacles: Rect[],
): Rect[] {
    let validSpaces: Rect[] = [translationBounds];

    for (const point of points) {
        for (const obstacle of obstacles) {
            const forbiddenRect = calculateForbiddenTranslationRect(
                point,
                obstacle,
            );

            validSpaces = validSpaces.flatMap((space) =>
                subtractRect(space, forbiddenRect),
            );

            if (validSpaces.length === 0) {
                return [];
            }
        }
    }

    return validSpaces;
}

export function calculatePreferredTranslation(
    translationBounds: Rect,
): WorldPixelPoint {
    return {
        x:
            translationBounds.left +
            translationBounds.width / 2,
        y:
            translationBounds.top +
            translationBounds.height / 2,
    };
}

function clampToRange(
    value: number,
    min: number,
    max: number,
): number {
    return Math.min(Math.max(value, min), max);
}

export function calculateClosestValidTranslation(
    preferredTranslation: WorldPixelPoint,
    validSpaces: Rect[],
): WorldPixelPoint | null {
    if (validSpaces.length === 0) {
        return null;
    }

    let closestPoint: WorldPixelPoint | null = null;
    let closestDistanceSquared = Number.POSITIVE_INFINITY;

    for (const space of validSpaces) {
        const candidate = {
            x: clampToRange(
                preferredTranslation.x,
                space.left,
                space.right,
            ),
            y: clampToRange(
                preferredTranslation.y,
                space.top,
                space.bottom,
            ),
        };

        const deltaX = candidate.x - preferredTranslation.x;
        const deltaY = candidate.y - preferredTranslation.y;

        const distanceSquared =
            deltaX * deltaX +
            deltaY * deltaY;

        if (distanceSquared < closestDistanceSquared) {
            closestDistanceSquared = distanceSquared;
            closestPoint = candidate;
        }
    }

    return closestPoint;
}