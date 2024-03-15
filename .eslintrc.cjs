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
      extends: ['plugin:astro/recommended', 'plugin:astro/jsx-a11y-recommended', 'prettier'],
      parserOptions: {
        project: null,
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
      rules: {
        'astro/jsx-a11y/anchor-has-content': 'off',
      },
    },
    {
      files: ['*.jsx', '*.tsx'],
      extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended', 'prettier'],
      plugins: ['react'],
      rules: {
        'react/prop-types': 'off',
        'react-hooks/exhaustive-deps': 'off',
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
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-restricted-imports': ['error'],
  },
};
