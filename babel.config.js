module.exports = function() {
  const presets = [
    [`@babel/preset-env`, { 'useBuiltIns': `usage`, 'corejs': `3` }],
    [`@babel/preset-react`, { 'development': true }],
  ];

  const plugins = [
    `@babel/plugin-syntax-dynamic-import`,
    `@babel/plugin-proposal-class-properties`,
    `@babel/plugin-transform-classes`,
  ];

  return {
    presets,
    plugins,
  };
};
