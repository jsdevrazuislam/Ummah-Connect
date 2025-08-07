import antfu from "@antfu/eslint-config";

export default antfu(
  {
    type: "node",
    typescript: true,
    stylistic: {
      indent: 2,
      semi: true,
      quotes: "double",
    },
  },
  {
    ignores: ["**/dist", "**/node_modules"],
    rules: {
      "camelcase": ["error", { properties: "always" }],

      "ts/consistent-type-definitions": ["error", "type"],
      "ts/no-redeclare": "off",

      "no-console": "warn",
      "node/prefer-global/process": "off",
      "n/prefer-global/buffer": ["error", "always"],
      "n/no-process-env": ["error", {
        allowedVariables: [
          "DB_NAME",
          "DB_USER",
          "DB_PASS",
          "DB_HOST",
          "PORT",
          "ACCESS_TOKEN_SECRET",
          "ACCESS_TOKEN_EXPIRY",
          "REFRESH_TOKEN_SECRET",
          "REFRESH_TOKEN_EXPIRY",
          "SMTP_TOKEN",
          "SERVER_URL",
          "CLIENT_URL",
          "CLOUDINARY_CLOUD_NAME",
          "CLOUDINARY_API_KEY",
          "CLOUDINARY_API_SECRET",
          "REDIS_URL",
          "LIVEKIT_URL",
          "LIVEKIT_API_KEY",
          "LIVEKIT_API_SECRET",
          "MAPBOX_TOKEN",
          "NODE_ENV",
        ],
      }],

      "perfectionist/sort-imports": ["error", {
        tsconfigRootDir: ".",
      }],

      "unicorn/filename-case": ["error", {
        case: "kebabCase",
      }],
    },
  },
);
