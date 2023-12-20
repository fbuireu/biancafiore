const tsconfig = require('./scripts/get-tsconfig.cjs');

module.exports = {
    parser: '@typescript-eslint/parser',
    settings: {
        react: {
            version: 'detect',
        },
    },
    env: {
        browser: true,
        es2023: true,
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/eslint-recommended', 'prettier'],
    overrides: [
        {
            files: tsconfig.include,
            parserOptions: {
                project: true,
                tsconfigRootDir: __dirname,
                extraFileExtensions: ['.astro', '.css'],
            },
        },
        {
            files: ['*.astro'],
            parser: 'astro-eslint-parser',
            extends: ['plugin:astro/recommended', 'prettier'],
            parserOptions: {
                project: null,
                parser: '@typescript-eslint/parser',
                extraFileExtensions: ['.astro', '.css'],
            },
            rules: {},
        },
        {
            files: ['*.jsx', '*.tsx'],
            extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended', 'prettier'],
            plugins: ['react'],
            rules: {
                'react/prop-types': 'off',
            },
        },
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.astro', '.css'],
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint'],
    rules: {
        'react/prop-types': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'no-restricted-imports': ['error'],
    },
};
