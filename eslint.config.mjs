import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["backend/dist/**", "client/types/**", "node_modules/**", "client/.next/**", "README.md"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["client/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parserOptions: {
        project: "./client/tsconfig.json",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
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
