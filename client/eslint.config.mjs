import antfu from "@antfu/eslint-config";

export default antfu({
  type: "app",
  typescript: true,
  formatters: true,
  nextjs: true,
  stylistic: {
    indent: 2,
    semi: true,
    quotes: "double",
  },
}, {
  ignores: ["**/node_modules", "**/.next"],
  rules: {
    "camelcase": ["error", { properties: "always" }],
    "ts/no-redeclare": "off",
    "ts/consistent-type-definitions": ["error", "type"],
    "no-console": ["warn"],
    "antfu/no-top-level-await": ["off"],
    "node/prefer-global/process": ["off"],
    "n/prefer-global/buffer": ["error", "always"],
    "n/no-process-env": ["error", {
      allowedVariables: ["NEXT_PUBLIC_API_BASE_URL", "ACCESS_TOKEN_SECRET", "NEXT_PUBLIC_ENCRYPTION_SECRET", "NEXT_PUBLIC_CLOUD_NAME", "MAPBOX_TOKEN", "OPENWEATHER_API_KEY", "NEXT_PUBLIC_SITE_URL"],
    }],
    "perfectionist/sort-imports": ["error", {
      tsconfigRootDir: ".",
    }],
    "unicorn/filename-case": ["error", {
      case: "kebabCase",
      ignore: ["README.md"],
    }],
  },
});
