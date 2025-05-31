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

    platform: 'neutral', // Ensures compatibility with both node and browser
    format: 'esm',       // Output as ES6 module
    target: ['esnext'],  // Latest JS runtimes
    sourcemap: false,
    external: [],
    logLevel: 'info',
}).catch(() => process.exit(1));
