import { describe, expect, it } from 'vitest';

describe('package build', () => {
    it('exports the public API from dist', async () => {
        const packageBuild = await import('../dist/index.mjs');

        expect(packageBuild).toHaveProperty('createMapLibreViewport');
        expect(typeof packageBuild.createMapLibreViewport).toBe('function');
    });
});