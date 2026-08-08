import { createRect, subtractRect } from './rect';
import type { Rect, ViewportPadding } from './types';

export function calculateFreeSpaces(
    mapWidth: number,
    mapHeight: number,
    obstacles: Rect[],
    padding: ViewportPadding,
): Rect[] {
    const initialRect = createRect(
        padding.left,
        padding.top,
        mapWidth - padding.right,
        mapHeight - padding.bottom,
    );

    if (!initialRect) {
        return [];
    }

    let freeSpaces: Rect[] = [initialRect];

    for (const obstacle of obstacles) {
        freeSpaces = freeSpaces.flatMap((freeRect) =>
            subtractRect(freeRect, obstacle),
        );
    }

    return freeSpaces;
}