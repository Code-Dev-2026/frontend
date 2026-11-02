import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    ignores: ['**/dist/**', '**/.next/**', '**/build/**', '**/coverage/**'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['**/apps/**', '**/packages/**']
        }
      ]
    }
  }
];
