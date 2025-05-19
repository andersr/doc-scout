import js from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { default as pluginReact } from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import sortKeysCustomOrder from "eslint-plugin-sort-keys-custom-order";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  { ignores: ["build", "tmp", ".react-router"] },
  {
    extends: ["js/recommended"],
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: { js },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { globals: globals.browser },
    rules: {
      "no-console": [
        "error",
        {
          allow: ["warn", "error", "info"],
        },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  sortKeysCustomOrder.configs["flat/recommended"],
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  reactHooks.configs["recommended-latest"],
  eslintPluginPrettierRecommended,
]);
