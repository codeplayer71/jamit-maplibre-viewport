import { describe, expect, it } from 'vitest';

describe('SSR safety', () => {
    it('can be imported without browser globals', async () => {
        expect(typeof window).toBe('undefined');
        expect(typeof document).toBe('undefined');
        expect(typeof HTMLElement).toBe('undefined');
        expect(typeof ResizeObserver).toBe('undefined');

        await expect(import('../src/index')).resolves.toBeDefined();
    });
});