import type {
    OverlayEdge,
    OverlayRect,
    Rect,
    SafeArea,
    ViewportPadding,
} from './types';

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function intersects(mapRect: Rect, overlayRect: Rect): boolean {
    if (
        mapRect.width <= 0 ||
        mapRect.height <= 0 ||
        overlayRect.width <= 0 ||
        overlayRect.height <= 0
    ) {
        return false;
    }

    return (
        overlayRect.right > mapRect.left &&
        overlayRect.left < mapRect.right &&
        overlayRect.bottom > mapRect.top &&
        overlayRect.top < mapRect.bottom
    );
}

function getOverlayPadding(
    mapRect: Rect,
    overlayRect: Rect,
    edge: OverlayEdge,
): number {
    if (!intersects(mapRect, overlayRect)) {
        return 0;
    }

    switch (edge) {
        case 'top':
            return clamp(
                overlayRect.bottom - mapRect.top,
                0,
                mapRect.height,
            );

        case 'right':
            return clamp(
                mapRect.right - overlayRect.left,
                0,
                mapRect.width,
            );

        case 'bottom':
            return clamp(
                mapRect.bottom - overlayRect.top,
                0,
                mapRect.height,
            );

        case 'left':
            return clamp(
                overlayRect.right - mapRect.left,
                0,
                mapRect.width,
            );
    }
}

export function calculatePadding(
    mapRect: Rect,
    overlays: OverlayRect[],
): ViewportPadding {
    const padding: ViewportPadding = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    };

    for (const overlay of overlays) {
        padding[overlay.edge] = Math.max(
            padding[overlay.edge],
            getOverlayPadding(mapRect, overlay.rect, overlay.edge),
        );
    }

    return padding;
}

export function calculateSafeArea(
    mapRect: Rect,
    padding: ViewportPadding,
): SafeArea {
    return {
        x: padding.left,
        y: padding.top,
        width: Math.max(
            0,
            mapRect.width - padding.left - padding.right,
        ),
        height: Math.max(
            0,
            mapRect.height - padding.top - padding.bottom,
        ),
    };
}