import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        reporters: 'verbose',
        logHeapUsage: true,
        typecheck: {
            tsconfig: './tsconfig.json',
        },
        coverage: {
            reporter: ['text', 'html', 'lcov'],
            enabled: true,
            include: ['src/*.ts'],
        },
    },
});
