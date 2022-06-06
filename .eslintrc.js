module.exports = {
  'root': true,
  'env': {
    'browser': true,
    'es2021': true,
    'node': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module'
  },
  'plugins': [
    'vue'
  ],
  'rules': {
    'indent': [2, 2],
    'semi': [2, 'never'],
    'quotes': [1, 'single'],
    'eqeqeq': 2,
    'arrow-spacing': [2, { 'before': true, 'after': true }],
    'no-trailing-spaces': 2,
    'no-multi-spaces': 2,
    'comma-spacing': [2, { 'before': false, 'after': true }],
    'no-console': 1,
    'keyword-spacing': [2, { 'after': true }],
    'key-spacing': [2, { 'beforeColon': false }],
    'no-multiple-empty-lines': [2, {'max': 2}],
    'no-useless-escape': 0,
    'vue/multi-word-component-names': 0,
    'no-undef': 0,
    'no-unused-vars': [
      'error',
      // we are only using this rule to check for unused arguments since TS
      // catches unused variables but not args.
      { varsIgnorePattern: '.*', args: 'none' }
    ],
  }
}
