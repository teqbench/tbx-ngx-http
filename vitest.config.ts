import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
    plugins: [angular({ jit: true, tsconfig: 'tsconfig.spec.json' })],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['src/test-setup.ts'],
        passWithNoTests: false,
        coverage: {
            thresholds: {
                lines: 80,
                functions: 80,
                statements: 80,
                branches: 75,
                perFile: true,
            },
            exclude: [
                '**/test-setup.ts',
                '**/*.spec.ts',
                '**/vitest.config.ts',
                '**/src/index.ts',
                // Exclude constants from coverage since they contain no logic
                '**/src/constants/http.constants.ts',
                // Exclude interfaces from coverage since they contain no logic
                '**/src/models/http-request-options.model.ts',
                '**/src/models/http-body-requestion-options.model.ts',
            ],
        },
    },
});
