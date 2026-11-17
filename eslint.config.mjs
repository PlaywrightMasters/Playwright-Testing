import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['node_modules/', 'playwright-report/', 'test-results/', 'blob-report/']),
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // A missing `await` on a Playwright call is the most common source of flaky tests.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['tests/**/*.ts', 'src/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      // Page objects expose `expect*` helpers that assert on the test's behalf.
      'playwright/expect-expect': ['error', { assertFunctionPatterns: ['^expect'] }],
    },
  },
  {
    files: ['**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
