module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'eslint:recommended'
  ],
  rules: {
    semi: ['error', 'always'],
    'semi-spacing': ['error', { after: true, before: false }],
    'semi-style': ['error', 'last'],
    'comma-dangle': ['error', 'only-multiline'],
    'no-extra-semi': 'error',
    'no-unexpected-multiline': 'error',
    'no-unreachable': 'error',
    'no-unused-vars': 'off',
    'no-console': 'off',
    'vue/html-self-closing': [
      'error', {
        html: {
          void: 'any',
          normal: 'any'
        }
      }
    ],
    'vue/require-prop-types': 'off',
    'vue/multi-word-component-names': 0
  }
}
