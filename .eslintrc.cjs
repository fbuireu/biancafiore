const tsconfig = require('./scripts/get-tsconfig.cjs');

module.exports = {
  ignorePatterns: ['/scripts'],
  env: {
    browser: true,
    es2023: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
  ],
  overrides: [
    {
      files: tsconfig.include,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['*.astro'],
      parser: 'astro-eslint-parser',
      extends: [
        'plugin:astro/recommended',
      ],
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
      rules: {},
    },
    {
      files: ['*.jsx', '*.tsx'],
      extends: [
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
      ],
      plugins: [
        'react',
      ],
      rules: {},
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    extraFileExtensions: ['.astro'],
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
    'no-restricted-imports': ['error'],
  },
};
