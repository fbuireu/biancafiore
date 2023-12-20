module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'scope-case': [2, 'always', ['lower-case', 'pascal-case', 'camel-case']],
        'scope-enum': [2, 'always', ['only-ui', 'deps', 'other']],
        'header-max-length': [2, 'always', 130],
    },
};
