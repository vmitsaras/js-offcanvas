const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        document: 'readonly',
        Element: 'readonly',
        HTMLElement: 'readonly',
        MutationObserver: 'readonly',
        requestAnimationFrame: 'readonly',
        window: 'readonly',
        CustomEvent: 'readonly'
      }
    }
  }
];
