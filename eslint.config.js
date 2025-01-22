import pluginJs from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import jsonPlugin from 'eslint-plugin-json';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  {
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-env']
        }
      }
    },
    plugins: {
      prettier: prettierPlugin,
      json: jsonPlugin,
      import: importPlugin
    },
    rules: {
      'prettier/prettier': ['error']
    }
  },
  pluginJs.configs.recommended,
  prettierPlugin.configs.recommended,
  jsonPlugin.configs.recommended,
  importPlugin.configs.recommended,
  {
    settings: {
      jest: {
        version: 29
      }
    }
  }
];
