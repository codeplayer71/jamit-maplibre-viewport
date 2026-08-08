import type { Rect } from './types';

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