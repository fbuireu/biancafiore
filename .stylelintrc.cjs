module.exports = {
    extends: 'stylelint-config-standard-scss',
    plugins: ['stylelint-order'],
    rules: {
        'order/properties-alphabetical-order': true,
        'selector-class-pattern': null,
        'value-keyword-case': null,
        'custom-property-pattern': null,
    },
};
