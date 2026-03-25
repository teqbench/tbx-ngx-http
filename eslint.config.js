import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['coverage/', 'dist/', 'node_modules/'],
    },
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['eslint.config.js', 'vitest.config.ts'],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
    }
);
