const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const angular = require('@angular-eslint/eslint-plugin');
const angularTemplate = require('@angular-eslint/eslint-plugin-template');
const angularTemplateParser = require('@angular-eslint/template-parser');

module.exports = [
  {
    files: ['**/*.ts'],
    ignores: ['dist/**', 'node_modules/**'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['tsconfig.json'],
        sourceType: 'module',
        ecmaVersion: 'latest'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@angular-eslint': angular
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...angular.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@angular-eslint/prefer-inject': 'off'
    }
  },
  {
    files: ['**/*.html'],
    ignores: ['dist/**', 'node_modules/**'],
    languageOptions: {
      parser: angularTemplateParser
    },
    plugins: {
      '@angular-eslint/template': angularTemplate
    },
    rules: {
      ...angularTemplate.configs.recommended.rules,
      '@angular-eslint/template/prefer-control-flow': 'off'
    }
  }
];
