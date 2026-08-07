import type {
    ViewportPadding,
    ViewportPaddingInput,
} from './types';

export function normalizePadding(
    padding: ViewportPaddingInput = 0,
): ViewportPadding {
    if (typeof padding === 'number') {
        return {
            top: padding,
            right: padding,
            bottom: padding,
            left: padding,
        };
    }

    return {
        top: padding.top ?? 0,
        right: padding.right ?? 0,
        bottom: padding.bottom ?? 0,
        left: padding.left ?? 0,
    };
}

export function addPadding(
    basePadding: ViewportPadding,
    additionalPadding: ViewportPaddingInput = 0,
): ViewportPadding {
    const normalizedAdditionalPadding =
        normalizePadding(additionalPadding);

    return {
        top: basePadding.top + normalizedAdditionalPadding.top,
        right: basePadding.right + normalizedAdditionalPadding.right,
        bottom: basePadding.bottom + normalizedAdditionalPadding.bottom,
        left: basePadding.left + normalizedAdditionalPadding.left,
    };
}