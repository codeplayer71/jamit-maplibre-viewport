import type {
    Rect,
    ViewportPadding,
} from './types';

export function calculateMapLocalObstacle(
    mapRect: Rect,
    overlayRect: Rect,
): Rect | null {
    const left = Math.max(mapRect.left, overlayRect.left);
    const right = Math.min(mapRect.right, overlayRect.right);
    const top = Math.max(mapRect.top, overlayRect.top);
    const bottom = Math.min(mapRect.bottom, overlayRect.bottom);

    if (right <= left || bottom <= top) {
        return null;
    }

    return {
        top: top - mapRect.top,
        right: right - mapRect.left,
        bottom: bottom - mapRect.top,
        left: left - mapRect.left,
        width: right - left,
        height: bottom - top,
    };
}

export function expandObstacle(
    obstacle: Rect,
    mapWidth: number,
    mapHeight: number,
    padding: ViewportPadding,
): Rect {
    const left = Math.max(
        0,
        obstacle.left - padding.left,
    );

    const right = Math.min(
        mapWidth,
        obstacle.right + padding.right,
    );

    const top = Math.max(
        0,
        obstacle.top - padding.top,
    );

    const bottom = Math.min(
        mapHeight,
        obstacle.bottom + padding.bottom,
    );

    return {
        top,
        right,
        bottom,
        left,
        width: right - left,
        height: bottom - top,
    };
}