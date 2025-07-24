import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";


export default [
  {
    ignores: ["backend/dist/**", "client/types/**", "node_modules/**", "client/.next/**", "README.md"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["client/**/*.{ts,tsx,js,jsx}"],
     plugins: {
      "@next/next": nextPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: "./client/tsconfig.json",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      ...nextPlugin.configs.recommended.rules,
    },
  },
  {
    files: ["backend/**/*.{ts,js}"],
    languageOptions: {
      parserOptions: {
        project: "./backend/tsconfig.json",
      },
    },
    rules: {
      "no-console": "warn",
    },
  },
];
