import type { Rect } from './types';

export function createRect(
    left: number,
    top: number,
    right: number,
    bottom: number,
): Rect | null {
    const width = right - left;
    const height = bottom - top;

    if (width <= 0 || height <= 0) {
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

export function subtractRect(
    source: Rect,
    cutout: Rect,
): Rect[] {
    const intersectionLeft = Math.max(
        source.left,
        cutout.left,
    );
    const intersectionRight = Math.min(
        source.right,
        cutout.right,
    );
    const intersectionTop = Math.max(
        source.top,
        cutout.top,
    );
    const intersectionBottom = Math.min(
        source.bottom,
        cutout.bottom,
    );

    if (
        intersectionRight <= intersectionLeft ||
        intersectionBottom <= intersectionTop
    ) {
        return [source];
    }

    const candidates = [
        createRect(
            source.left,
            source.top,
            source.right,
            intersectionTop,
        ),
        createRect(
            source.left,
            intersectionBottom,
            source.right,
            source.bottom,
        ),
        createRect(
            source.left,
            intersectionTop,
            intersectionLeft,
            intersectionBottom,
        ),
        createRect(
            intersectionRight,
            intersectionTop,
            source.right,
            intersectionBottom,
        ),
    ];

    return candidates.filter(
        (rect): rect is Rect => rect !== null,
    );
}