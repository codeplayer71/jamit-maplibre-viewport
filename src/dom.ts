import type { Rect } from './types';

export function isMeasurableElement(
    value: unknown,
): value is HTMLElement {
    return (
        typeof value === 'object' &&
        value !== null &&
        'getBoundingClientRect' in value &&
        typeof value.getBoundingClientRect === 'function'
    );
}

export function measureElementRect(element: HTMLElement): Rect {
    const rect = element.getBoundingClientRect();

    return {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height,
    };
}