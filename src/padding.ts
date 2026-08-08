import type {
    ViewportPadding,
    ViewportPaddingInput,
} from './types';

function validatePaddingValue(value: number): number {
    if (!Number.isFinite(value) || value < 0) {
        throw new Error(
            'Viewport padding values must be finite numbers greater than or equal to 0.',
        );
    }

    return value;
}

export function normalizePadding(
    padding: ViewportPaddingInput = 0,
): ViewportPadding {
    if (typeof padding === 'number') {
        const value = validatePaddingValue(padding);

        return {
            top: value,
            right: value,
            bottom: value,
            left: value,
        };
    }

    return {
        top: validatePaddingValue(padding.top ?? 0),
        right: validatePaddingValue(padding.right ?? 0),
        bottom: validatePaddingValue(padding.bottom ?? 0),
        left: validatePaddingValue(padding.left ?? 0),
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

export function getPaddingOffset(
    padding: ViewportPadding,
): [number, number] {
    return [
        (padding.left - padding.right) / 2,
        (padding.top - padding.bottom) / 2,
    ];
}