const packageModule = await import('../dist/index.mjs');

if (typeof packageModule.createMapLibreViewport !== 'function') {
    throw new Error(
        'Built package does not export createMapLibreViewport.',
    );
}

console.log('Package import smoke test passed.');