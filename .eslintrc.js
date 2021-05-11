module.exports = {
  globals: {
    __PATH_PREFIX__: true
  },
  root: true,
  rules: {
    'react-hooks/rules-of-hooks': `warn`,
    'react-hooks/exhaustive-deps': `warn`,
    'indent': [
      `warn`,
      2,
      {
        'flatTernaryExpressions': true,
        'MemberExpression': 1,
        'SwitchCase': 1,
        'ignoredNodes': [
          `JSXAttribute`,
          `JSXSpreadAttribute`,
          `TemplateLiteral`
        ]
      }
    ],
    'babel/no-invalid-this': 1,
    'linebreak-style': [
      `warn`,
      `windows`
    ],
    'max-len': [
      `warn`,
      {
        'code': 180
      }
    ],
    'newline-per-chained-call': [
      `warn`,
      {
        'ignoreChainWithDepth': 2
      }
    ],
    'no-unused-vars': `warn`,
    'no-else-return': [
      `warn`,
      {
        'allowElseIf': false
      }
    ],
    'no-nested-ternary': `warn`,
    'no-unneeded-ternary': [
      `warn`,
      {
        'defaultAssignment': false
      }
    ],
    'quotes': [
      `warn`,
      `backtick`,
      {
        'avoidEscape': true
      }
    ],
    'react/jsx-indent': [
      `warn`,
      2
    ],
    'react/jsx-indent-props': [
      2,
      `first`
    ],
    'react/jsx-no-bind': [
      `warn`,
      {
        'allowArrowFunctions': true
      }
    ]
  },
  env: {
    'amd': true,
    'browser': true,
    'commonjs': true,
    'es6': true,
    'jest': true,
    'node': true
  },
  extends: [
    `react-app`,
    `eslint:recommended`,
    `plugin:react/recommended`
  ],
  parser: `babel-eslint`,
  parserOptions: {
    'ecmaVersion': 2020,
    'sourceType': `module`,
    'ecmaFeatures': {
      'jsx': true,
      'impliedStrict': true
    }
  },
  plugins: [
    `react`,
    `react-hooks`,
    `babel`,
    `promise`
  ],
  settings: {
    'react': {
      'version': `detect`
    }
  }
};