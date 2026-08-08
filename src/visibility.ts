import type { Rect, ViewportPadding } from './types';

export type PixelPoint = {
    x: number;
    y: number;
};

export function isPointInsideRect(
    point: PixelPoint,
    rect: Rect,
): boolean {
    return (
        point.x >= rect.left &&
        point.x <= rect.right &&
        point.y >= rect.top &&
        point.y <= rect.bottom
    );
}

export function isPointObscured(
    point: PixelPoint,
    obstacles: Rect[],
): boolean {
    return obstacles.some((obstacle) =>
        isPointInsideRect(point, obstacle),
    );
}

export function isPointVisible(
    point: PixelPoint,
    mapWidth: number,
    mapHeight: number,
    obstacles: Rect[],
    padding: ViewportPadding,
): boolean {
    const insideAvailableMapArea =
        point.x >= padding.left &&
        point.x <= mapWidth - padding.right &&
        point.y >= padding.top &&
        point.y <= mapHeight - padding.bottom;

    return (
        insideAvailableMapArea &&
        !isPointObscured(point, obstacles)
    );
}

export function arePointsVisible(
    points: PixelPoint[],
    mapWidth: number,
    mapHeight: number,
    obstacles: Rect[],
    padding: ViewportPadding,
): boolean {
    return points.every((point) =>
        isPointVisible(
            point,
            mapWidth,
            mapHeight,
            obstacles,
            padding,
        ),
    );
}