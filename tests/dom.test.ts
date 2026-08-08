import { describe, expect, it } from 'vitest';
import { measureElementRect } from '../src/dom';

function createElementMock(): HTMLElement {
    return {
        getBoundingClientRect: () => ({
            top: 100,
            right: 900,
            bottom: 700,
            left: 300,
            width: 600,
            height: 600,
            x: 300,
            y: 100,
            toJSON: () => ({}),
        }),
    } as HTMLElement;
}

describe('measureElementRect', () => {
    it('converts a DOMRect into an internal Rect', () => {
        expect(measureElementRect(createElementMock())).toEqual({
            top: 100,
            right: 900,
            bottom: 700,
            left: 300,
            width: 600,
            height: 600,
        });
    });
});