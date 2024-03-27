module.exports = {
  extends: 'stylelint-config-recommended',
  plugins: ['stylelint-order'],
  allowEmptyInput: true,
  rules: {
    'order/properties-alphabetical-order': true,
    'selector-class-pattern': null,
    'value-keyword-case': null,
    'custom-property-pattern': null,
  },
};
