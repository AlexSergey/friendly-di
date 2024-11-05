const { makeConfig } = require('@rockpack/codestyle');

const config = makeConfig();

config.push({
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    'no-console': 'off',
  },
});

module.exports = config;
