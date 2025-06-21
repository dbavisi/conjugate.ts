import { build } from 'esbuild';

// Build JS bundle
build({
    entryPoints: ['src/conjugate.ts'],
    outfile: 'dist/conjugate.min.js',
    bundle: true,
    minify: true,
    treeShaking: true,

    // Aggressive minification options
    minifySyntax: true,
    minifyWhitespace: true,
    minifyIdentifiers: true,

    platform: 'neutral',
    format: 'esm',
    target: ['esnext'],

    // Enable source maps for diagnostics
    sourcemap: true,
    logLevel: 'info',
}).catch(() => process.exit(1));
