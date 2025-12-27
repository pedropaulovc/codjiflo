// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

export default tseslint.config({ ignores: ["dist", "storybook-static", "coverage", "e2e/**/*", ".storybook/**/*", "playwright-report", ".next/**/*", "next-env.d.ts"] }, {
  extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  plugins: {
    "react-hooks": reactHooks,
    "react-refresh": reactRefresh,
    "@next/next": nextPlugin,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs["core-web-vitals"].rules,
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "@typescript-eslint/no-confusing-void-expression": "off",
  },
}, {
  // Disable type-aware linting for config files
  files: ["*.config.ts", "*.config.js", "playwright.config.ts"],
  extends: [tseslint.configs.disableTypeChecked],
}, storybook.configs["flat/recommended"]);
