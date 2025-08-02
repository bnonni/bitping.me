const eslint = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const globals = require('globals');

module.exports = [
  eslint.configs.recommended,
  {
    languageOptions: {
      parser        : tsParser,
      parserOptions : {
        ecmaFeatures : { modules: true },
        ecmaVersion  : '2022'
      },
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    plugins: {
      '@typescript-eslint' : tsPlugin,
    },
    files   : ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-unsafe-optional-chaining' : 'off',
      'key-spacing'                 : [
        'error',
        {
          'singleLine': {
            'beforeColon' : false,
            'afterColon'  : true,
          },
          'multiLine': {
            'beforeColon' : true,
            'afterColon'  : true,
          },
          'align': {
            'beforeColon' : true,
            'afterColon'  : true,
            'on'          : 'colon',
            'mode'        : 'minimum'
          }
        }
      ],
      'quotes': [
        'error',
        'single',
        { 'allowTemplateLiterals': true }
      ],
      'semi'                              : ['error', 'always'],
      'indent'                            : ['error', 2, { 'SwitchCase': 1 }],
      'no-unused-vars'                    : 'off',
      'prefer-const'                      : 'off',
      '@typescript-eslint/no-unused-vars' : [
        'error',
        {
          'vars'               : 'all',
          'args'               : 'after-used',
          'ignoreRestSiblings' : true,
          'argsIgnorePattern'  : '^_',
          'varsIgnorePattern'  : '^_'
        }
      ],
      'no-dupe-class-members'                    : 'off',
      'no-trailing-spaces'                       : ['error'],
      '@typescript-eslint/no-explicit-any'       : 'off',
      '@typescript-eslint/no-non-null-assertion' : 'off',
      '@typescript-eslint/ban-ts-comment'        : 'off',
    }
  },
  {
    ignores: [
      '**/*.js',
      '**/*.cjs',
      '**/*.mjs',
      '**/*.d.ts',
      '**/prototyping/*',
    ]
  }
];
