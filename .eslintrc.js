module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  parser: '@babel/eslint-parser',
  extends: 'airbnb',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'react/destructuring-assignment': [0, 'always', { 'ignoreClassFields': true }],
    'no-use-before-define': ['error', { 'functions': false, 'variables': false, 'classes': false }],
    'react/prefer-stateless-function': [0],
    'react/jsx-filename-extension': [1, { 'extensions': ['.js', '.jsx'] }],
    'react/forbid-prop-types': [1, {
      'forbid': [],
      'checkContextTypes': true,
      'checkChildContextTypes': true
    }],
    'global-require': 0,
    'no-param-reassign': [2, { 'props': false }],
    'no-underscore-dangle': [0],
    'radix': [0],
    'react/static-property-placement': [0],
    'react/jsx-props-no-spreading': [0],
    'jsx-a11y/iframe-has-title': [0],
    'jsx-a11y/label-has-associated-control': [1, {
      'labelComponents': ['CustomLabel'],
      'labelAttributes': ['inputLabel'],
      'controlComponents': ['CustomInput'],
      'assert': 'both',
      'depth': 3,
    }],
    'max-len': ['error', { 'code': 120 }]
  },
};
