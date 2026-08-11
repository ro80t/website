import prettier from "eslint-config-prettier";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginAstro from "eslint-plugin-astro";
import { includeIgnoreFile } from "@eslint/compat";
import { defineConfig } from "eslint/config";
import { fileURLToPath } from "node:url";

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

export default defineConfig([
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  prettier,
  {
    ignores: ["eslint.config.js"]
  }
]);
