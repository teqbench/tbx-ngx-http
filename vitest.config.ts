import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        passWithNoTests: false,
        coverage: {
            thresholds: {
                lines: 80,
                functions: 80,
                statements: 80,
                branches: 75,
                perFile: true,
            },
        },
    },
});
